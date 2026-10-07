import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt, sign, verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

// Helper function to hash passwords securely using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------
// PUBLIC ROUTES
// ---------------------------

// Register API
app.post('/api/register', async (c) => {
  const { username, mobile, email, password, upliner } = await c.req.json()
  
  if (!username || !mobile || !email || !password) {
    return c.json({ error: 'All fields are required' }, 400)
  }

  const normalizedEmail = email.toLowerCase().trim();
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  if (!gmailRegex.test(normalizedEmail)) {
    return c.json({ error: 'Only valid @gmail.com addresses are allowed' }, 400);
  }

  const mobileRegex = /^\+92\d{10}$/;
  if (!mobileRegex.test(mobile.trim())) {
    return c.json({ error: 'Mobile number must start with +92 and contain exactly 10 digits' }, 400);
  }

  // Validate Password (min 8 chars, strong: letters and numbers)
  if (!password || password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters long' }, 400);
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return c.json({ error: 'Password must be strong and contain both letters and numbers' }, 400);
  }

  try {
    const hashedPassword = await hashPassword(password);
    const id = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const joined = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    await c.env.DB.prepare(
      `INSERT INTO users (id, name, mobile, email, password, joined, upliner) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, username, mobile, normalizedEmail, hashedPassword, joined, upliner || null).run();

    // Create JWT Token
    const token = await sign({ id, role: 'user' }, c.env.JWT_SECRET || 'fallback-secret');

    console.log(`[REGISTER SUCCESS] User ID: ${id}, Email: ${normalizedEmail}`);

    return c.json({ message: 'User registered successfully', token, user: { id, name: username, email: normalizedEmail, mobile, role: 'user', upliner: upliner || null } }, 201)
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Mobile or Email already exists' }, 409)
    }
    return c.json({ error: 'Database error' }, 500)
  }
})

// Login API
app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await c.env.DB.prepare(
    `SELECT id, name, email, mobile, role, password, status, plan, balance FROM users WHERE email = ?`
  ).bind(normalizedEmail).first();

  console.log(`[LOGIN LOOKUP] Email: ${normalizedEmail}, Found: ${!!user}`);

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  if (user.status === 'Blocked') {
    return c.json({ error: 'Aap ko website ne block kar diya hai. Aap ka account admin panel se active hone tak suspend hai.' }, 403)
  }

  const hashedPassword = await hashPassword(password);
  const isMatch = user.password === hashedPassword;
  
  console.log(`[LOGIN PWD MATCH] Email: ${normalizedEmail}, Match: ${isMatch}`);

  if (!isMatch) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await sign({ id: user.id, role: user.role }, c.env.JWT_SECRET || 'fallback-secret');

  return c.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, plan: user.plan, balance: user.balance } })
})

// Check user status
app.get('/api/user/status', async (c) => {
  const id = c.req.query('id');
  const email = c.req.query('email');
  if (!id && !email) {
    return c.json({ error: 'id or email required' }, 400);
  }
  const user = await c.env.DB.prepare(
    `SELECT id, name, email, status, plan, balance FROM users WHERE id = ? OR email = ?`
  ).bind(id || '', email ? email.toLowerCase().trim() : '').first();
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json({ id: user.id, status: user.status, plan: user.plan, balance: user.balance });
})


// ---------------------------
// ADMIN PROTECTED ROUTES
// ---------------------------

// Middleware to check admin role
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback-secret', 'HS256');
    if (payload.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }
    await next();
  } catch (e: any) {
    console.error("JWT verify error:", e);
    return c.json({ error: 'Invalid token', details: e.message, stack: e.stack, name: e.name }, 401)
  }
}

app.get('/api/users', adminAuth, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT id, name, email, mobile, balance, plan, status, joined, role FROM users WHERE role != 'admin' ORDER BY joined DESC`).all();
  return c.json(results);
})

app.put('/api/users/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  try {
    let updates = [];
    let binds = [];
    
    if (body.balance !== undefined) {
      updates.push('balance = ?');
      binds.push(body.balance);
    }
    if (body.plan !== undefined) {
      updates.push('plan = ?');
      binds.push(body.plan);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      binds.push(body.status);
    }
    
    if (updates.length > 0) {
      binds.push(id);
      await c.env.DB.prepare(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...binds).run();
    }
    return c.json({ message: 'User updated successfully' }, 200);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

app.delete('/api/users/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(id).run();
    return c.json({ message: 'User deleted successfully' }, 200);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

// Plans Endpoints
app.get('/api/plans', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM plans ORDER BY id ASC`).all();
  return c.json(results);
})

app.post('/api/plans', adminAuth, async (c) => {
  const { name, price, dailyProfit, total, validity, status } = await c.req.json();
  try {
    await c.env.DB.prepare(
      `INSERT INTO plans (name, price, dailyProfit, total, validity, status) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(name, price, dailyProfit, total, validity, status || 'Active').run();
    return c.json({ message: 'Plan created successfully' }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

app.put('/api/plans/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  const { name, price, dailyProfit, total, validity, status } = await c.req.json();
  try {
    await c.env.DB.prepare(
      `UPDATE plans SET name = ?, price = ?, dailyProfit = ?, total = ?, validity = ?, status = ? WHERE id = ?`
    ).bind(name, price, dailyProfit, total, validity, status, id).run();
    return c.json({ message: 'Plan updated successfully' }, 200);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

app.delete('/api/plans/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare(`DELETE FROM plans WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Plan deleted successfully' }, 200);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

// ==========================================
// SUPPORT TICKETS API (For Users and Admins)
// ==========================================

// Create a new ticket
app.post('/api/tickets', async (c) => {
  try {
    const { userId, userName, userEmail, subject, category, priority, message } = await c.req.json();
    if (!userId || !subject || !category || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const num = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `#IPL-${num}`;
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO tickets (id, userId, userName, userEmail, subject, category, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?)`
    ).bind(ticketId, userId, userName || 'User', userEmail || '', subject, category, priority || 'Normal', now, now).run();

    await c.env.DB.prepare(
      `INSERT INTO ticket_replies (ticketId, sender, message, created_at) VALUES (?, 'user', ?, ?)`
    ).bind(ticketId, message, now).run();

    return c.json({ message: 'Ticket created', ticketId }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Get user tickets
app.get('/api/tickets/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM tickets WHERE userId = ? ORDER BY updated_at DESC`
    ).bind(userId).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Get all tickets (admin)
app.get('/api/tickets', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM tickets ORDER BY updated_at DESC`
    ).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Get single ticket details + replies
app.get('/api/tickets/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const ticket = await c.env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return c.json({ error: 'Ticket not found' }, 404);

    const { results: replies } = await c.env.DB.prepare(`SELECT * FROM ticket_replies WHERE ticketId = ? ORDER BY created_at ASC`).bind(id).all();
    
    return c.json({ ticket, replies });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Add reply
app.post('/api/tickets/:id/reply', async (c) => {
  const id = c.req.param('id');
  try {
    const { sender, message } = await c.req.json();
    if (!message) return c.json({ error: 'Message is required' }, 400);

    const now = new Date().toISOString();
    await c.env.DB.prepare(
      `INSERT INTO ticket_replies (ticketId, sender, message, created_at) VALUES (?, ?, ?, ?)`
    ).bind(id, sender || 'user', message, now).run();

    await c.env.DB.prepare(`UPDATE tickets SET updated_at = ? WHERE id = ?`).bind(now, id).run();

    return c.json({ message: 'Reply added' }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Update ticket status/priority
app.put('/api/tickets/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const { status, priority } = await c.req.json();
    const now = new Date().toISOString();
    
    let updates = [];
    let binds = [];
    if (status) { updates.push('status = ?'); binds.push(status); }
    if (priority) { updates.push('priority = ?'); binds.push(priority); }
    
    if (updates.length > 0) {
      updates.push('updated_at = ?'); binds.push(now);
      binds.push(id);
      await c.env.DB.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
    }
    
    return c.json({ message: 'Ticket updated' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// DEPOSITS API
// ==========================================

// Create a new deposit
app.post('/api/deposits', async (c) => {
  try {
    const { id, userId, user, amount, method, date, status, receipt, receiptData, trxId, planName } = await c.req.json();
    if (!userId || !amount || !method) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO deposits (id, userId, user, amount, method, date, status, receipt, receiptData, trxId, planName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, user, amount, method, date, status || 'Pending', receipt, receiptData, trxId, planName).run();

    return c.json({ message: 'Deposit created', id }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Get user deposits
app.get('/api/deposits/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM deposits WHERE userId = ? ORDER BY date DESC`
    ).bind(userId).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Get all deposits (admin)
app.get('/api/deposits', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM deposits ORDER BY date DESC`
    ).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Update deposit status
app.put('/api/deposits/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    const { status } = await c.req.json();
    if (!status) return c.json({ error: 'Status is required' }, 400);
    
    await c.env.DB.prepare(`UPDATE deposits SET status = ? WHERE id = ?`).bind(status, id).run();
    
    return c.json({ message: 'Deposit updated' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.delete('/api/deposits/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare(`DELETE FROM deposits WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Deposit deleted' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// SUPPORT TICKETS API
// ==========================================
app.post('/api/tickets', async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const date = body.date || new Date().toISOString();
    const status = body.status || 'Open';
    const priority = body.priority || 'Normal';
    const type = body.category || body.type || 'General';
    const lastUpdate = body.lastUpdate || date;
    const unread = body.unread ? 1 : 0;
    
    await c.env.DB.prepare(
      `INSERT INTO tickets (id, userId, subject, date, status, priority, lastUpdate, type, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.userId, body.subject, date, status, priority, lastUpdate, type, unread).run();
    
    // Also insert the first message as a reply if message is provided
    if (body.message) {
      await c.env.DB.prepare(
        `INSERT INTO ticket_replies (ticketId, sender, senderName, text, timestamp) VALUES (?, ?, ?, ?, ?)`
      ).bind(id, 'user', body.userName || 'User', body.message, date).run();
    }
    
    return c.json({ message: 'Ticket created', id }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/tickets/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM tickets WHERE userId = ? ORDER BY date DESC`).bind(userId).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/tickets', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM tickets ORDER BY date DESC`).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/tickets/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const ticket = await c.env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return c.json({ error: 'Not found' }, 404);
    const { results: replies } = await c.env.DB.prepare(`SELECT * FROM ticket_replies WHERE ticketId = ? ORDER BY timestamp ASC`).bind(id).all();
    return c.json({ ...ticket, replies });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.post('/api/tickets/:id/replies', async (c) => {
  const ticketId = c.req.param('id');
  try {
    const { sender, senderName, text, timestamp } = await c.req.json();
    await c.env.DB.prepare(`INSERT INTO ticket_replies (ticketId, sender, senderName, text, timestamp) VALUES (?, ?, ?, ?, ?)`).bind(ticketId, sender, senderName, text, timestamp).run();
    await c.env.DB.prepare(`UPDATE tickets SET lastUpdate = ?, unread = 1 WHERE id = ?`).bind(timestamp, ticketId).run();
    return c.json({ message: 'Reply added' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.put('/api/tickets/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    const updates = [];
    const binds = [];
    if (body.status !== undefined) { updates.push('status = ?'); binds.push(body.status); }
    if (body.unread !== undefined) { updates.push('unread = ?'); binds.push(body.unread ? 1 : 0); }
    if (updates.length > 0) {
      binds.push(id);
      await c.env.DB.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
    }
    return c.json({ message: 'Ticket updated' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// WITHDRAWALS API
// ==========================================
app.post('/api/withdrawals', async (c) => {
  try {
    const { id, userId, user, amount, method, accountDetails, date, status } = await c.req.json();
    if (!userId || !amount || !method) return c.json({ error: 'Missing required fields' }, 400);

    await c.env.DB.prepare(
      `INSERT INTO withdrawals (id, userId, user, amount, method, accountDetails, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, user, amount, method, accountDetails, date, status || 'Pending').run();

    return c.json({ message: 'Withdrawal requested', id }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/withdrawals/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM withdrawals WHERE userId = ? ORDER BY date DESC`).bind(userId).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/withdrawals', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM withdrawals ORDER BY date DESC`).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.put('/api/withdrawals/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    const { status } = await c.req.json();
    await c.env.DB.prepare(`UPDATE withdrawals SET status = ? WHERE id = ?`).bind(status, id).run();
    return c.json({ message: 'Withdrawal updated' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.delete('/api/withdrawals/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare(`DELETE FROM withdrawals WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Withdrawal deleted' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// COMMISSION API
// ==========================================
app.post('/api/distribute-commission', adminAuth, async (c) => {
  const { userId, amount } = await c.req.json();
  if (!userId || !amount) return c.json({ error: 'Missing data' }, 400);
  
  try {
    const { results } = await c.env.DB.prepare('SELECT upliner, name FROM users WHERE id = ?').bind(userId).all();
    if (!results || results.length === 0) return c.json({ message: 'User not found' });
    
    const uplinerRef = results[0].upliner;
    const userName = results[0].name;
    if (!uplinerRef) return c.json({ message: 'No upliner' });

    const { results: upResults } = await c.env.DB.prepare('SELECT id, balance FROM users WHERE id = ? OR name = ? OR username = ?').bind(uplinerRef, uplinerRef, uplinerRef).all();
    if (!upResults || upResults.length === 0) return c.json({ message: 'Upliner user not found' });
    
    const uplinerId = upResults[0].id;
    const commission = amount * 0.16;
    
    await c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(commission, uplinerId).run();
    
    const trxId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    await c.env.DB.prepare(
      `INSERT INTO transactions (id, userId, user, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(trxId, uplinerId, uplinerRef, 'Team Commission', commission, date, `Level 1 Commission from ${userName}`).run();
    
    return c.json({ message: 'Commission distributed successfully', commission });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/team/:username', async (c) => {
  const username = c.req.param('username');
  try {
    const { results } = await c.env.DB.prepare(`SELECT id, name, joined, plan FROM users WHERE upliner = ? OR upliner = (SELECT name FROM users WHERE id = ? LIMIT 1)`).bind(username, username).all();
    
    // Calculate commission directly from transactions
    const { results: commissions } = await c.env.DB.prepare(`SELECT description, amount FROM transactions WHERE (user = ? OR user = (SELECT name FROM users WHERE id = ? LIMIT 1)) AND type = 'Team Commission'`).bind(username, username).all();
    
    return c.json({ team: results || [], commissions: commissions || [] });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// TRANSACTIONS API
// ==========================================
app.post('/api/transactions', async (c) => {
  try {
    const { id, userId, user, type, amount, date, description } = await c.req.json();
    await c.env.DB.prepare(
      `INSERT INTO transactions (id, userId, user, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, user, type, amount, date, description || '').run();
    return c.json({ message: 'Transaction created', id }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/transactions/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC`).bind(userId).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/transactions', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM transactions ORDER BY date DESC`).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// CERTIFICATES API
// ==========================================
app.get('/api/certificates/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const result = await c.env.DB.prepare(`SELECT * FROM certificates WHERE userId = ?`).bind(userId).first();
    if (!result) return c.json({ status: 'Not Issued' });
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.post('/api/certificates', adminAuth, async (c) => {
  try {
    const { userId, user, status, issueDate, certificateUrl } = await c.req.json();
    await c.env.DB.prepare(
      `INSERT INTO certificates (userId, user, status, issueDate, certificateUrl) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(userId) DO UPDATE SET status=excluded.status, issueDate=excluded.issueDate, certificateUrl=excluded.certificateUrl`
    ).bind(userId, user, status, issueDate, certificateUrl).run();
    return c.json({ message: 'Certificate saved' }, 201);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// ==========================================
// SETTINGS / GATEWAYS API
// ==========================================
app.get('/api/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM settings`).all();
    const map: any = {};
    results.forEach((r: any) => map[r.key] = r.value);
    return c.json(map);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.put('/api/settings', adminAuth, async (c) => {
  try {
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
       await c.env.DB.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(key, value).run();
    }
    return c.json({ message: 'Settings updated' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/gateways/:type', async (c) => {
  const type = c.req.param('type');
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM payment_gateways WHERE type = ?`).bind(type).all();
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.post('/api/gateways', adminAuth, async (c) => {
  try {
    const { type, name, details } = await c.req.json();
    await c.env.DB.prepare(`INSERT INTO payment_gateways (type, name, details) VALUES (?, ?, ?)`).bind(type, name, details).run();
    return c.json({ message: 'Gateway added' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.put('/api/gateways/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    const { type, name, details } = await c.req.json();
    await c.env.DB.prepare(`UPDATE payment_gateways SET type = ?, name = ?, details = ? WHERE id = ?`).bind(type, name, details, id).run();
    return c.json({ message: 'Gateway updated' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.delete('/api/gateways/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare(`DELETE FROM payment_gateways WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Gateway deleted' });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

export default app


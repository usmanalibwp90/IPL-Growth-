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

// Middleware to check user/admin role (valid logged in user)
const userAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback-secret', 'HS256');
    // Save decoded user in context
    c.set('user', payload);
    await next();
  } catch (e: any) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

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
    c.set('user', payload);
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

    const withdrawAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0;

    // --- Backend balance & minimum limit validation ---
    // 1. Get gateway minLimit from gateways table
    const gatewayRow = await c.env.DB.prepare(
      `SELECT details FROM gateways WHERE name = ? AND type = 'withdraw' LIMIT 1`
    ).bind(method).first();

    let minLimit = 500; // default minimum
    if (gatewayRow?.details) {
      try {
        const parsed = JSON.parse(String(gatewayRow.details));
        minLimit = parseFloat(parsed.minLimit || 500);
      } catch (_) {}
    }

    if (withdrawAmount < minLimit) {
      return c.json({ error: `Minimum withdrawal for ${method} is Rs${minLimit}. You entered Rs${withdrawAmount}.` }, 400);
    }

    // 2. Get user balance
    const userRow = await c.env.DB.prepare(
      `SELECT balance FROM users WHERE id = ?`
    ).bind(userId).first();
    const userBalance = parseFloat(String(userRow?.balance || 0));

    // Check if user balance is below the minimum limit
    if (userBalance < minLimit) {
      return c.json({ error: `Aap ka balance Rs${userBalance} hai jo minimum limit Rs${minLimit} se kam hai. Withdrawal mumkin nahi.` }, 400);
    }

    // 3. Calculate total pending/approved withdrawals to get available balance
    const withdrawalsResult = await c.env.DB.prepare(
      `SELECT SUM(CAST(amount AS REAL)) as total FROM withdrawals WHERE userId = ? AND status != 'Rejected'`
    ).bind(userId).first();
    const totalWithdrawn = parseFloat(String(withdrawalsResult?.total || 0));

    const availableBalance = userBalance - totalWithdrawn;

    if (withdrawAmount > availableBalance) {
      return c.json({ error: `Insufficient balance. Available: Rs${availableBalance.toFixed(2)}, Requested: Rs${withdrawAmount}.` }, 400);
    }
    // --- End validation ---

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
  const { userId, amount, depositId, planName } = await c.req.json();
  if (!userId || !amount) return c.json({ error: 'Missing data' }, 400);
  
  try {
    const { results } = await c.env.DB.prepare('SELECT id, name, upliner FROM users WHERE id = ?').bind(userId).all();
    if (!results || results.length === 0) return c.json({ message: 'User not found' });
    
    const user = results[0];
    const userName = user.name;
    
    const pkgName = planName || 'Unknown Package';
    const pkgAmount = amount;
    
    const levels = [
      { level: 1, percentage: 0.16 },
      { level: 2, percentage: 0.04 },
      { level: 3, percentage: 0.01 }
    ];

    let currentUpliner = user.upliner;
    let distributedCommissions = [];

    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const now = new Date().toISOString();

    for (let i = 0; i < levels.length; i++) {
      if (!currentUpliner) break;

      // Find the upliner user
      const { results: upResults } = await c.env.DB.prepare('SELECT id, name, upliner FROM users WHERE id = ? OR name = ? OR email = ?').bind(currentUpliner, currentUpliner, currentUpliner).all();
      if (!upResults || upResults.length === 0) break;

      const uplinerNode = upResults[0];
      const uplinerId = uplinerNode.id;
      const commissionAmount = pkgAmount * levels[i].percentage;

      // Check if this commission is already processed to prevent duplicates
      const checkDup = await c.env.DB.prepare(
        'SELECT id FROM referral_commissions WHERE referrer_id = ? AND referred_user_id = ? AND level = ? AND package_name = ?'
      ).bind(uplinerId, userId, levels[i].level, pkgName).first();

      if (!checkDup) {
        // Distribute commission
        const commissionId = `COM-${Math.floor(100000 + Math.random() * 900000)}`;
        
        await c.env.DB.prepare(
          `INSERT INTO referral_commissions (id, referrer_id, referred_user_id, package_id, package_name, package_amount, level, commission_percentage, commission_amount, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(commissionId, uplinerId, userId, depositId || null, pkgName, pkgAmount, levels[i].level, levels[i].percentage * 100, commissionAmount, 'available', now).run();
        
        distributedCommissions.push({ level: levels[i].level, amount: commissionAmount, upliner: uplinerNode.name });
      }

      currentUpliner = uplinerNode.upliner;
    }

    return c.json({ message: 'Commission distributed successfully', distributedCommissions });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/admin/backfill-commissions', async (c) => {
  try {
    const { results: deposits } = await c.env.DB.prepare(`SELECT * FROM deposits WHERE status = 'Approved' AND planName IS NOT NULL AND planName != ''`).all();
    let added = 0;
    const levels = [ { level: 1, p: 0.16 }, { level: 2, p: 0.04 }, { level: 3, p: 0.01 } ];

    for (const dep of deposits) {
       const { results: userRes } = await c.env.DB.prepare(`SELECT id, name, upliner FROM users WHERE id = ?`).bind(dep.userId).all();
       if (!userRes || userRes.length === 0) continue;
       const user = userRes[0];
       let currentUpliner = user.upliner;
       
       for (let i=0; i<3; i++) {
          if (!currentUpliner) break;
          const { results: upRes } = await c.env.DB.prepare(`SELECT id, name, upliner FROM users WHERE id = ? OR name = ? OR email = ?`).bind(currentUpliner, currentUpliner, currentUpliner).all();
          if (!upRes || upRes.length === 0) break;
          
          const uplinerNode = upRes[0];
          const commAmount = dep.amount * levels[i].p;
          
          // check if commission already exists in referral_commissions
          const dupCheck = await c.env.DB.prepare(`SELECT id FROM referral_commissions WHERE referrer_id = ? AND referred_user_id = ? AND level = ? AND package_name = ?`).bind(uplinerNode.id, user.id, levels[i].level, dep.planName).first();
          
          if (!dupCheck) {
             const commissionId = `COM-BF-${Math.floor(100000 + Math.random() * 900000)}`;
             await c.env.DB.prepare(`INSERT INTO referral_commissions (id, referrer_id, referred_user_id, package_id, package_name, package_amount, level, commission_percentage, commission_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
                commissionId, uplinerNode.id, user.id, dep.id, dep.planName, dep.amount, levels[i].level, levels[i].p * 100, commAmount, 'available', dep.date
             ).run();
             
             // Check if already paid via old system
             const trxDup = await c.env.DB.prepare(`SELECT id FROM transactions WHERE userId = ? AND description LIKE ? AND type = 'Team Commission'`).bind(uplinerNode.id, `%from ${user.name}%`).first();
             
             if (trxDup) {
               // Already paid, mark as transferred
               await c.env.DB.prepare(`UPDATE referral_commissions SET status = 'transferred' WHERE id = ?`).bind(commissionId).run();
             }
             added++;
          }
          currentUpliner = uplinerNode.upliner;
       }
    }
    return c.json({ message: `Backfill complete. Added ${added} commission records.` });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

app.get('/api/team/:identifier?', async (c) => {
  let identifier = c.req.param('identifier');
  
  // Try to use token auth if available
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = await verify(token, c.env.JWT_SECRET || 'fallback-secret', 'HS256');
      identifier = payload.id;
    } catch (e) {
      // Ignore token errors, fallback to identifier if provided
    }
  }

  if (!identifier) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Determine user id or name
    const { results: selfResults } = await c.env.DB.prepare('SELECT id, name FROM users WHERE id = ? OR name = ?').bind(identifier, identifier).all();
    if (!selfResults || selfResults.length === 0) return c.json({ team: [], commissions: [] });
    
    const selfId = selfResults[0].id;
    const selfName = selfResults[0].name;

    // Get team members (level 1 only)
    const { results } = await c.env.DB.prepare(`SELECT id, name, joined, plan FROM users WHERE upliner = ? OR upliner = ?`).bind(selfId, selfName).all();
    
    // Get commissions from referral_commissions
    const { results: commissions } = await c.env.DB.prepare(`
      SELECT r.referred_user_id, r.package_name, r.commission_amount, r.level, r.status, u.name as referred_name 
      FROM referral_commissions r
      LEFT JOIN users u ON r.referred_user_id = u.id
      WHERE r.referrer_id = ?
    `).bind(selfId).all();
    
    // Compute total and available commissions
    const totalCommission = (commissions || []).reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const availableCommission = (commissions || []).filter(c => c.status === 'available').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    
    return c.json({ team: results || [], commissions: commissions || [], totalCommission, availableCommission });
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

// Transfer commission to main wallet
app.post('/api/transfer-commission', userAuth, async (c) => {
  try {
    const authUser = c.get('user');
    const { amount } = await c.req.json();
    if (!amount) return c.json({ error: 'Missing parameters' }, 400);

    const userId = authUser.id;
    const { results: selfResults } = await c.env.DB.prepare('SELECT id, name, balance FROM users WHERE id = ?').bind(userId).all();
    if (!selfResults || selfResults.length === 0) return c.json({ error: 'User not found' }, 404);

    const selfId = selfResults[0].id;
    const selfName = selfResults[0].name;

    // Validate 10 referrals rule
    const refCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE upliner = ? OR upliner = ?').bind(selfId, selfName).first();
    const totalReferrals = refCount?.count || 0;

    if (totalReferrals < 10) {
      return c.json({ error: `Complete 10 referrals to unlock commission transfer. Current: ${totalReferrals}/10` }, 403);
    }

    // Sum available
    const available = await c.env.DB.prepare(
      `SELECT SUM(commission_amount) as total FROM referral_commissions WHERE referrer_id = ? AND status = 'available'`
    ).bind(selfId).first();

    const totalAvailable = available?.total || 0;
    
    if (totalAvailable < amount) {
      return c.json({ error: 'Insufficient available commission' }, 400);
    }

    // Update referral commissions to transferred
    await c.env.DB.prepare(
      `UPDATE referral_commissions SET status = 'transferred' WHERE referrer_id = ? AND status = 'available'`
    ).bind(selfId).run();

    // Add to user balance
    await c.env.DB.prepare(
      `UPDATE users SET balance = balance + ? WHERE id = ?`
    ).bind(totalAvailable, selfId).run();

    // Create a transaction
    const trxId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    await c.env.DB.prepare(
      `INSERT INTO transactions (id, userId, user, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(trxId, selfId, 'User', 'Commission Transfer', totalAvailable, date, 'Transferred commission to main wallet').run();

    return c.json({ message: 'Commission transferred successfully', transferred: totalAvailable });
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


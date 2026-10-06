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
  const { username, mobile, email, password } = await c.req.json()
  
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
      `INSERT INTO users (id, name, mobile, email, password, joined) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, username, mobile, normalizedEmail, hashedPassword, joined).run();

    // Create JWT Token
    const token = await sign({ id, role: 'user' }, c.env.JWT_SECRET || 'fallback-secret');

    console.log(`[REGISTER SUCCESS] User ID: ${id}, Email: ${normalizedEmail}`);

    return c.json({ message: 'User registered successfully', token, user: { id, name: username, email: normalizedEmail, mobile, role: 'user' } }, 201)
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
  const { balance, plan, status } = await c.req.json();
  try {
    await c.env.DB.prepare(
      `UPDATE users SET balance = ?, plan = ?, status = ? WHERE id = ?`
    ).bind(balance, plan, status, id).run();
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

export default app


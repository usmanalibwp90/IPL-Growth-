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

    return c.json({ message: 'User registered successfully', token, user: { id, name: username, email: normalizedEmail, role: 'user' } }, 201)
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
    `SELECT id, name, email, role, password, status FROM users WHERE email = ?`
  ).bind(normalizedEmail).first();

  console.log(`[LOGIN LOOKUP] Email: ${normalizedEmail}, Found: ${!!user}`);

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  if (user.status === 'Blocked') {
    return c.json({ error: 'Account is blocked by admin' }, 403)
  }

  const hashedPassword = await hashPassword(password);
  const isMatch = user.password === hashedPassword;
  
  console.log(`[LOGIN PWD MATCH] Email: ${normalizedEmail}, Match: ${isMatch}`);

  if (!isMatch) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await sign({ id: user.id, role: user.role }, c.env.JWT_SECRET || 'fallback-secret');

  return c.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
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
  const { results } = await c.env.DB.prepare(`SELECT id, name, email, mobile, balance, plan, status, joined, role FROM users ORDER BY joined DESC`).all();
  return c.json(results);
})

app.put('/api/users/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  const { balance, plan, status } = await c.req.json();
  try {
    const { success } = await c.env.DB.prepare(
      `UPDATE users SET balance = ?, plan = ?, status = ? WHERE id = ?`
    ).bind(balance, plan, status, id).run();
    if (success) {
      return c.json({ message: 'User updated successfully' }, 200);
    }
    return c.json({ error: 'Failed to update user' }, 500);
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
    const { success } = await c.env.DB.prepare(
      `INSERT INTO plans (name, price, dailyProfit, total, validity, status) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(name, price, dailyProfit, total, validity, status || 'Active').run();
    if (success) {
      return c.json({ message: 'Plan created successfully' }, 201);
    }
    return c.json({ error: 'Failed to create plan' }, 500);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

app.put('/api/plans/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  const { name, price, dailyProfit, total, validity, status } = await c.req.json();
  try {
    const { success } = await c.env.DB.prepare(
      `UPDATE plans SET name = ?, price = ?, dailyProfit = ?, total = ?, validity = ?, status = ? WHERE id = ?`
    ).bind(name, price, dailyProfit, total, validity, status, id).run();
    if (success) {
      return c.json({ message: 'Plan updated successfully' }, 200);
    }
    return c.json({ error: 'Failed to update plan' }, 500);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

app.delete('/api/plans/:id', adminAuth, async (c) => {
  const id = c.req.param('id');
  try {
    const { success } = await c.env.DB.prepare(`DELETE FROM plans WHERE id = ?`).bind(id).run();
    if (success) {
      return c.json({ message: 'Plan deleted successfully' }, 200);
    }
    return c.json({ error: 'Failed to delete plan' }, 500);
  } catch (err: any) {
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
})

export default app

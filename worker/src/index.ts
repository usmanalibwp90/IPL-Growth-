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
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback-secret');
    if (payload.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

app.get('/api/users', adminAuth, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT id, name, email, mobile, balance, plan, status, joined, role FROM users ORDER BY joined DESC`).all();
  return c.json(results);
})

export default app

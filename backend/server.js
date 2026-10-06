const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite Database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      balance REAL DEFAULT 0,
      plan TEXT DEFAULT 'None',
      status TEXT DEFAULT 'Active',
      joined TEXT NOT NULL
    )`);

    // Create Support Tickets Table
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userName TEXT,
      userEmail TEXT,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT DEFAULT 'Open',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);

    // Create Ticket Replies Table
    db.run(`CREATE TABLE IF NOT EXISTS ticket_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketId TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);
  }
});

// API Routes
app.post('/api/register', (req, res) => {
  const { username, mobile, email, password } = req.body;
  
  if (!username || !mobile || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate Gmail requirement
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  if (!gmailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Only valid @gmail.com addresses are allowed' });
  }

  // Validate Mobile (+92 followed by exactly 10 digits)
  const mobileRegex = /^\+92\d{10}$/;
  if (!mobileRegex.test(mobile.trim())) {
    return res.status(400).json({ error: 'Mobile number must start with +92 and contain exactly 10 digits' });
  }

  // Validate Password (min 8 chars, strong: letters and numbers)
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must be strong and contain both letters and numbers' });
  }

  const id = `USR-${Math.floor(100 + Math.random() * 900)}`;
  const joined = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Note: in a real app, hash the password using bcrypt. For simplicity keeping as is based on existing logic.
  const query = `INSERT INTO users (id, name, mobile, email, password, joined) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [id, username, mobile, email, password, joined], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ error: 'Email or Mobile already registered' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    const token = 'dummy-jwt-token';
    res.status(201).json({ message: 'User registered successfully', token, user: { id, name: username, email, role: 'user' } });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(`SELECT id, name, email, role, password, status FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status === 'Blocked') {
      return res.status(403).json({ error: 'Aap ko website ne block kar diya hai. Aap ka account admin panel se active hone tak suspend hai.' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = 'dummy-jwt-token';
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// Check user status
app.get('/api/user/status', (req, res) => {
  const { id, email } = req.query;
  if (!id && !email) {
    return res.status(400).json({ error: 'id or email required' });
  }
  db.get(`SELECT id, name, email, status FROM users WHERE id = ? OR email = ?`, [id || '', email || ''], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, status: user.status });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all(`SELECT * FROM users ORDER BY joined DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Update user (balance, plan, status)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { balance, plan, status } = req.body;
  db.run(
    `UPDATE users SET balance = COALESCE(?, balance), plan = COALESCE(?, plan), status = COALESCE(?, status) WHERE id = ?`,
    [balance !== undefined ? balance : null, plan || null, status || null, id],
    function(err) {
      if (err) {
        console.error('Update user error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// --- SUPPORT TICKETS API ---

// Create a new ticket
app.post('/api/tickets', (req, res) => {
  const { userId, userName, userEmail, subject, category, priority, message } = req.body;
  if (!userId || !subject || !category || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate a ticket ID
  const num = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `#IPL-${num}`;
  const now = new Date().toISOString();

  const query = `INSERT INTO tickets (id, userId, userName, userEmail, subject, category, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?)`;
  
  db.run(query, [ticketId, userId, userName, userEmail, subject, category, priority, now, now], function(err) {
    if (err) return res.status(500).json({ error: 'Database error creating ticket' });

    // Insert the first message as a reply
    db.run(`INSERT INTO ticket_replies (ticketId, sender, message, created_at) VALUES (?, 'user', ?, ?)`, [ticketId, message, now], function(err2) {
      if (err2) return res.status(500).json({ error: 'Database error adding ticket message' });
      res.status(201).json({ message: 'Ticket created', ticketId });
    });
  });
});

// Get user tickets
app.get('/api/tickets/user/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(`SELECT * FROM tickets WHERE userId = ? ORDER BY updated_at DESC`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get all tickets (admin)
app.get('/api/tickets', (req, res) => {
  db.all(`SELECT * FROM tickets ORDER BY updated_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get single ticket details + replies
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM tickets WHERE id = ?`, [id], (err, ticket) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    db.all(`SELECT * FROM ticket_replies WHERE ticketId = ? ORDER BY created_at ASC`, [id], (err2, replies) => {
      if (err2) return res.status(500).json({ error: 'Database error fetching replies' });
      res.json({ ticket, replies });
    });
  });
});

// Add reply
app.post('/api/tickets/:id/reply', (req, res) => {
  const { id } = req.params;
  const { sender, message } = req.body; // sender should be 'user' or 'admin'
  const now = new Date().toISOString();

  if (!message) return res.status(400).json({ error: 'Message is required' });

  db.run(`INSERT INTO ticket_replies (ticketId, sender, message, created_at) VALUES (?, ?, ?, ?)`, [id, sender, message, now], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });

    // Update ticket's updated_at. Also, if sender is admin, might want to change status? Wait, leave status update to explicit PUT.
    let statusUpdate = "";
    let params = [now, id];
    
    // If user replies, and ticket was Waiting for User, change to Open/In Progress. 
    // Or just let admin handle status manually. 
    // We'll just update updated_at.
    db.run(`UPDATE tickets SET updated_at = ? WHERE id = ?`, params, (err2) => {
      res.status(201).json({ message: 'Reply added' });
    });
  });
});

// Update ticket status/priority
app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;
  const now = new Date().toISOString();

  db.run(`UPDATE tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), updated_at = ? WHERE id = ?`, 
    [status || null, priority || null, now, id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Ticket updated' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

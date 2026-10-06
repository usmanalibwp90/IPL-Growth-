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
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready.');
      }
    });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

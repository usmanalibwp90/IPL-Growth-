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
      email TEXT NOT NULL,
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
  const { username, mobile } = req.body;
  
  if (!username || !mobile) {
    return res.status(400).json({ error: 'Username and mobile are required' });
  }

  const id = `USR-${Math.floor(100 + Math.random() * 900)}`;
  const email = `${username.toLowerCase().replace(/\s+/g, '')}@example.com`;
  const joined = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const query = `INSERT INTO users (id, name, mobile, email, joined) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [id, username, mobile, email, joined], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'User registered successfully', user: { id, name: username, mobile, email, joined } });
  });
});

app.get('/api/users', (req, res) => {
  db.all(`SELECT * FROM users ORDER BY joined DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

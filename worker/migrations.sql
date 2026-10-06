CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  user TEXT NOT NULL,
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  accountDetails TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS certificates (
  userId TEXT PRIMARY KEY,
  user TEXT NOT NULL,
  status TEXT DEFAULT 'Not Issued',
  issueDate TEXT,
  certificateUrl TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  user TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  details TEXT NOT NULL
);

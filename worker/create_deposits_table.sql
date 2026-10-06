CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  user TEXT NOT NULL,
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  receipt TEXT,
  receiptData TEXT,
  trxId TEXT,
  planName TEXT
);

INSERT INTO deposits (id, userId, user, amount, method, date, status, receipt, receiptData, trxId, planName)
VALUES ('DEP-9321', 'USR-180', 'Faizan', 112560, 'jazzcash', '07 Oct 2026, 01:39 AM', 'Pending', 'screenshot.jpg', NULL, '9321', 'Deposit to Wallet');

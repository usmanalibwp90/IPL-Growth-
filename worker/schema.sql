DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  balance REAL DEFAULT 0,
  plan TEXT DEFAULT 'None',
  status TEXT DEFAULT 'Active',
  joined TEXT NOT NULL
);

-- Note: The admin password hash below is just a placeholder and should be updated.
INSERT INTO users (id, name, mobile, email, password, role, joined) 
VALUES ('USR-000', 'Admin', '00000000000', 'admin@example.com', 'hashed_password_here', 'admin', '03 Oct 2026');

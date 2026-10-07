CREATE TABLE IF NOT EXISTS referral_commissions (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  package_id TEXT,
  package_name TEXT,
  package_amount REAL,
  level INTEGER,
  commission_percentage REAL,
  commission_amount REAL,
  status TEXT DEFAULT 'available',
  created_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_unique 
ON referral_commissions (referrer_id, referred_user_id, level, package_name);

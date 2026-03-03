-- ============================================================
-- libSQL schema — primary database
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  plan               TEXT NOT NULL DEFAULT 'free',
  status             TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  action    TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token         ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id  ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON audit_logs(user_id);

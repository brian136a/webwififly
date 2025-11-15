CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  meta TEXT,
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

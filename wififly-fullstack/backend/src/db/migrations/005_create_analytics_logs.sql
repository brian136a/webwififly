CREATE TABLE IF NOT EXISTS analytics_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  payload TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_logs_session_id ON analytics_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_event_name ON analytics_logs(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created_at ON analytics_logs(created_at);

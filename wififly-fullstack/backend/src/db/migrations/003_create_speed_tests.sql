CREATE TABLE IF NOT EXISTS speed_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id INTEGER,
  room_name TEXT NOT NULL,
  dl REAL NOT NULL,
  ul REAL NOT NULL,
  ping REAL NOT NULL,
  jitter REAL NOT NULL,
  client_ip TEXT,
  server_info TEXT,
  timestamp INTEGER NOT NULL,
  anomaly BOOLEAN DEFAULT 0,
  raw_data TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_speed_tests_session_id ON speed_tests(session_id);
CREATE INDEX IF NOT EXISTS idx_speed_tests_user_id ON speed_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_speed_tests_created_at ON speed_tests(created_at);
CREATE INDEX IF NOT EXISTS idx_speed_tests_anomaly ON speed_tests(anomaly);

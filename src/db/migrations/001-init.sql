CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS setups (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  isp TEXT NOT NULL,
  plan_download_mbps REAL NOT NULL,
  monthly_cost_nzd REAL NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS speed_tests (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  download_mbps REAL NOT NULL,
  upload_mbps REAL NOT NULL,
  ping_ms REAL NOT NULL,
  jitter_ms REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

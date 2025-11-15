-- Migration 007: Add submissions table for lead capture
-- Stores user emails and feedback for support follow-up

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  test_run_id TEXT,
  modem_photo_url TEXT,
  message TEXT,
  created_at_ms INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);

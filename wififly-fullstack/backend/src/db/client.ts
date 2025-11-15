import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_FILE || './backend/data/wififly.sqlite';
const dbDir = path.dirname(dbPath);

// Create data directory if not exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function closeDatabase() {
  db.close();
}

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'wififly.sqlite');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
    runMigrations();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Executing migration: ${file}`);
      await new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
      console.log(`✓ ${file} completed`);
    }

    console.log('All migrations completed successfully');
    db.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

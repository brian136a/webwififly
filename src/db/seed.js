const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'wififly.sqlite');

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  } else {
    seedDatabase();
  }
});

async function seedDatabase() {
  try {
    console.log('Seeding development data...');

    // Create a test session
    const sessionId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO sessions (id, created_at) VALUES (?, ?)',
        [sessionId, Date.now()],
        (err) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });
    console.log(`Created session: ${sessionId}`);

    // Add setup data
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO setups (id, session_id, isp, plan_download_mbps, monthly_cost_nzd, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sessionId, 'Spark', 100, 89, Date.now()],
        (err) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });
    console.log('Created test setup');

    // Add speed test data
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO speed_tests (id, session_id, room_name, download_mbps, upload_mbps, ping_ms, jitter_ms, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sessionId, 'Lounge', 95.5, 8.2, 12.3, 1.5, Date.now()],
        (err) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });
    console.log('Created test speed result');

    console.log('Seeding completed successfully');
    db.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

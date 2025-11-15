import { v4 as uuidv4 } from 'uuid';
import { runAsync, closeDb } from './client.js';

async function seedDatabase() {
  try {
    console.log('Seeding development data...');

    // Create a test session
    const sessionId = uuidv4();
    await runAsync('INSERT INTO sessions (id, created_at) VALUES (?, ?)', [
      sessionId,
      Date.now(),
    ]);
    console.log(`Created session: ${sessionId}`);

    // Add setup data
    await runAsync(
      `INSERT INTO setups (id, session_id, isp, plan_download_mbps, monthly_cost_nzd, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), sessionId, 'Spark', 100, 89, Date.now()]
    );
    console.log('Created test setup');

    // Add speed test data
    await runAsync(
      `INSERT INTO speed_tests (id, session_id, room_name, download_mbps, upload_mbps, ping_ms, jitter_ms, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), sessionId, 'Lounge', 95.5, 8.2, 12.3, 1.5, Date.now()]
    );
    console.log('Created test speed result');

    console.log('Seeding completed successfully');
    await closeDb();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();

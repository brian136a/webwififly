import { db } from '../src/db/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Seeding database with test data...');

try {
  const now = Date.now();

  // Create test session
  const sessionId = uuidv4();
  db.prepare('INSERT INTO sessions (id, created_at, last_seen) VALUES (?, ?, ?)')
    .run(sessionId, now, now);
  console.log(`✓ Created session: ${sessionId}`);

  // Create test user
  const userResult = db.prepare(`
    INSERT INTO users (
      session_id, name, email, isp, plan_speed_mbps,
      monthly_cost_nz, modem_room, home_type, modem_model,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    'Test User',
    'test@example.com',
    'Spark',
    100,
    79.99,
    'Living Room',
    'House',
    'TP-Link Archer AX12',
    now,
    now
  );
  console.log(`✓ Created user: test@example.com`);

  // Create test speed tests
  const rooms = ['Living Room', 'Bedroom', 'Kitchen', 'Office'];
  for (let i = 0; i < 4; i++) {
    db.prepare(`
      INSERT INTO speed_tests (
        session_id, user_id, room_name, dl, ul, ping, jitter,
        timestamp, anomaly, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      (userResult as any).lastInsertRowid,
      rooms[i],
      50 + Math.random() * 40,
      10 + Math.random() * 15,
      30 + Math.random() * 20,
      5 + Math.random() * 10,
      now - (4 - i) * 60000,
      0,
      now - (4 - i) * 60000
    );
  }
  console.log(`✓ Created 4 test speed tests`);

  // Create test submission
  db.prepare(`
    INSERT INTO submissions (
      session_id, user_id, name, email, modem_model,
      home_type, notes, photo_path, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    (userResult as any).lastInsertRowid,
    'Test User',
    'test@example.com',
    'TP-Link Archer AX12',
    'House',
    'Test submission',
    null,
    now
  );
  console.log(`✓ Created test submission`);

  // Create test analytics logs
  db.prepare(`
    INSERT INTO analytics_logs (session_id, event_name, payload, created_at)
    VALUES (?, ?, ?, ?)
  `).run(
    sessionId,
    'test_completed',
    JSON.stringify({ rooms: 4 }),
    now
  );
  console.log(`✓ Created analytics log`);

  console.log('\n✓ Seed completed successfully');
  process.exit(0);
} catch (error) {
  console.error('✗ Seed failed:', error);
  process.exit(1);
}

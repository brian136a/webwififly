import { db, closeDatabase } from '../src/db/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Resetting database...');

try {
  const dbPath = process.env.DB_FILE || './backend/data/wififly.sqlite';
  
  // Close current connection
  closeDatabase();

  // Delete database file
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`✓ Deleted database at ${dbPath}`);
  }

  console.log('✓ Database reset completed');
  process.exit(0);
} catch (error) {
  console.error('✗ Reset failed:', error);
  process.exit(1);
}

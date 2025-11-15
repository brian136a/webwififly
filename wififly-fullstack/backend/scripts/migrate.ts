import { runMigrations } from '../src/db/migrations';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Starting database migration...');

try {
  runMigrations();
  console.log('✓ Migration completed successfully');
  process.exit(0);
} catch (error) {
  console.error('✗ Migration failed:', error);
  process.exit(1);
}

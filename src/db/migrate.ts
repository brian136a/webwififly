import { execAsync, closeDb } from './client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      try {
        await execAsync(sql);
        console.log(`✓ ${file} completed`);
      } catch (err: any) {
        if (err.message && (
          err.message.includes('duplicate column name') || 
          err.message.includes('already exists')
        )) {
          console.warn(`⚠ ${file} partially or fully skipped (already exists).`);
        } else {
          throw err;
        }
      }
    }

    console.log('All migrations completed successfully');
    await closeDb();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

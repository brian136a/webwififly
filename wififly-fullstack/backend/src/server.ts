import app from './index';
import { runMigrations } from './db/migrations';
import { closeDatabase } from './db/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  try {
    // Run migrations on startup
    runMigrations();

    const server = app.listen(PORT, () => {
      console.log(`\n✓ Backend running at http://localhost:${PORT}`);
      console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
      console.log(`✓ Uploads directory: ${process.env.UPLOAD_DIR || './backend/uploads'}`);
      console.log(`✓ Database: ${process.env.DB_FILE || './backend/data/wififly.sqlite'}\n`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down gracefully...');
      server.close(() => {
        closeDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app: Express = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ 
  origin: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  credentials: true 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});
app.use('/api/', limiter);

// Static file serving
const uploadDir = process.env.UPLOAD_DIR || './backend/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoints
app.get('/test/ping', (req: Request, res: Response) => {
  res.json({ pong: Date.now() });
});

app.get('/test/download', (req: Request, res: Response) => {
  try {
    const size = Math.min(parseInt((req.query.size as string) || '1048576'), 10485760);
    const buffer = Buffer.alloc(size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

app.post('/test/upload', (req: Request, res: Response) => {
  res.json({ ok: true, received: req.get('content-length') || 0 });
});

// Routes (imported after app setup)
import sessionRoutes from './routes/session';
import testRoutes from './routes/tests';
import userRoutes from './routes/users';
import submissionRoutes from './routes/submissions';
import analyticsRoutes from './routes/analytics';
import configRoutes from './routes/config';

app.use('/api/session', sessionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/config', configRoutes);

// Error handler (must be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

export default app;

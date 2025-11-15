import { Router, Request, Response } from 'express';
import { db } from '../db/client';

const router = Router();

interface TestResult extends Request {
  body: {
    sessionId: string;
    roomName: string;
    dl: number;
    ul: number;
    ping: number;
    jitter: number;
    timestamp: number;
    clientIp?: string;
    serverInfo?: any;
    rawData?: any;
  };
}

/**
 * POST /api/tests/result
 * Save speed test result and detect anomalies
 */
router.post('/result', (req: TestResult, res: Response) => {
  try {
    const { sessionId, roomName, dl, ul, ping, jitter, timestamp, clientIp, serverInfo, rawData } = req.body;
    const THRESHOLD = parseInt(process.env.ANOMALY_SPEED_THRESHOLD || '1000', 10);

    // Validate session exists
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    // Detect anomaly
    const anomaly = dl > THRESHOLD || ul > THRESHOLD ? 1 : 0;

    // Insert test result
    const result = db.prepare(`
      INSERT INTO speed_tests (
        session_id, room_name, dl, ul, ping, jitter,
        timestamp, anomaly, client_ip, server_info, raw_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      roomName,
      dl,
      ul,
      ping,
      jitter,
      timestamp,
      anomaly,
      clientIp || null,
      serverInfo ? JSON.stringify(serverInfo) : null,
      rawData ? JSON.stringify(rawData) : null,
      Date.now()
    );

    // Log anomaly if detected
    if (anomaly) {
      db.prepare(`
        INSERT INTO analytics_logs (session_id, event_name, payload, created_at)
        VALUES (?, ?, ?, ?)
      `).run(
        sessionId,
        'anomaly_flag_shown',
        JSON.stringify({ dl, ul, threshold: THRESHOLD, room: roomName }),
        Date.now()
      );
    }

    res.json({
      ok: true,
      testId: (result as any).lastInsertRowid,
      anomaly: Boolean(anomaly),
      displayDl: Math.min(dl, THRESHOLD),
      displayUl: Math.min(ul, THRESHOLD),
    });
  } catch (error) {
    console.error('Test result error:', error);
    res.status(500).json({ error: 'Failed to save test result' });
  }
});

/**
 * GET /test/download
 * Speed test download endpoint
 */
router.get('/download', (req: Request, res: Response) => {
  try {
    const size = Math.min(parseInt((req.query.size as string) || '1048576'), 10485760);
    const buffer = Buffer.alloc(size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

/**
 * POST /test/upload
 * Speed test upload endpoint
 */
router.post('/upload', (req: Request, res: Response) => {
  res.json({ ok: true, received: req.get('content-length') || 0 });
});

/**
 * GET /test/ping
 * Speed test ping endpoint
 */
router.get('/ping', (req: Request, res: Response) => {
  res.json({ pong: Date.now() });
});

export default router;

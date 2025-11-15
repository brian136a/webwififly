import { Router, Request, Response } from 'express';
import { db } from '../db/client';

const router = Router();

interface AnalyticsRequest extends Request {
  body: {
    sessionId: string;
    eventName: string;
    payload?: any;
  };
}

/**
 * POST /api/analytics
 * Log analytics event
 */
router.post('/', (req: AnalyticsRequest, res: Response) => {
  try {
    const { sessionId, eventName, payload } = req.body;

    // Validate session
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    // Insert analytics log
    db.prepare(`
      INSERT INTO analytics_logs (session_id, event_name, payload, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      sessionId,
      eventName,
      payload ? JSON.stringify(payload) : null,
      Date.now()
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to log analytics' });
  }
});

/**
 * GET /api/analytics/session/:sessionId
 * Retrieve analytics for a session
 */
router.get('/session/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const logs = db.prepare(`
      SELECT * FROM analytics_logs
      WHERE session_id = ?
      ORDER BY created_at DESC
    `).all(sessionId);

    res.json({ logs });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

export default router;

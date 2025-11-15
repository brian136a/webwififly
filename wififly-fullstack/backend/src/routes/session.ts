import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';

const router = Router();

interface SessionRequest extends Request {
  body: {
    sessionId?: string;
  };
}

/**
 * POST /api/session/start
 * Create a new session or retrieve existing one
 */
router.post('/start', (req: SessionRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const now = Date.now();

    if (sessionId) {
      // Check if session exists
      const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
      if (existing) {
        // Update last_seen
        db.prepare('UPDATE sessions SET last_seen = ? WHERE id = ?').run(now, sessionId);
        return res.json({ sessionId });
      }
    }

    // Create new session
    const newSessionId = uuidv4();
    db.prepare('INSERT INTO sessions (id, created_at, last_seen) VALUES (?, ?, ?)')
      .run(newSessionId, now, now);

    res.json({ sessionId: newSessionId });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /api/session/:id
 * Retrieve session data with all linked tests and user info
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const user = db.prepare('SELECT * FROM users WHERE session_id = ?').get(id) as any;
    const tests = db.prepare('SELECT * FROM speed_tests WHERE session_id = ? ORDER BY created_at DESC').all(id);
    const submissions = db.prepare('SELECT * FROM submissions WHERE session_id = ? ORDER BY created_at DESC').all(id);

    res.json({
      session,
      user: user || null,
      tests,
      submissions,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

export default router;

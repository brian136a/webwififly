import { Router, Request, Response } from 'express';
import { db } from '../db/client';

const router = Router();

interface UserRequest extends Request {
  body: {
    sessionId: string;
    name?: string;
    email?: string;
    isp?: string;
    planSpeed?: number;
    monthlyCost?: number;
    modemRoom?: string;
    homeType?: string;
    modemModel?: string;
  };
}

/**
 * POST /api/users
 * Create or update user profile
 */
router.post('/', (req: UserRequest, res: Response) => {
  try {
    const {
      sessionId,
      name,
      email,
      isp,
      planSpeed,
      monthlyCost,
      modemRoom,
      homeType,
      modemModel,
    } = req.body;

    // Validate session
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    const now = Date.now();
    const existing = db.prepare('SELECT * FROM users WHERE session_id = ?').get(sessionId) as any;

    if (existing) {
      // Update
      db.prepare(`
        UPDATE users SET
          name = ?, email = ?, isp = ?, plan_speed_mbps = ?,
          monthly_cost_nz = ?, modem_room = ?, home_type = ?,
          modem_model = ?, updated_at = ?
        WHERE session_id = ?
      `).run(
        name || existing.name,
        email || existing.email,
        isp || existing.isp,
        planSpeed !== undefined ? planSpeed : existing.plan_speed_mbps,
        monthlyCost !== undefined ? monthlyCost : existing.monthly_cost_nz,
        modemRoom || existing.modem_room,
        homeType || existing.home_type,
        modemModel || existing.modem_model,
        now,
        sessionId
      );

      return res.json({ ok: true, userId: existing.id });
    }

    // Create
    const result = db.prepare(`
      INSERT INTO users (
        session_id, name, email, isp, plan_speed_mbps,
        monthly_cost_nz, modem_room, home_type, modem_model,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      name || null,
      email || null,
      isp || null,
      planSpeed || null,
      monthlyCost || null,
      modemRoom || null,
      homeType || null,
      modemModel || null,
      now,
      now
    );

    res.json({ ok: true, userId: (result as any).lastInsertRowid });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

export default router;

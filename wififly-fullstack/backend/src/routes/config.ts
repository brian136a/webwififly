import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/config
 * Expose configuration to frontend
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    anomalySpeedThreshold: parseInt(process.env.ANOMALY_SPEED_THRESHOLD || '1000', 10),
    backendUrl: process.env.BACKEND_BASE_URL || 'http://localhost:4000',
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;

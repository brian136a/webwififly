import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/client';
import { sendPersonalizedPlan } from '../services/emailService';

const router = Router();

// Configure multer for file upload
const uploadDir = process.env.UPLOAD_DIR || './backend/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const name = `${timestamp}-${random}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images allowed'));
    }
  },
});

interface SubmissionRequest extends Request {
  body: {
    sessionId: string;
    userId?: string;
    name: string;
    email: string;
    modemModel?: string;
    homeType?: string;
    notes?: string;
  };
  file?: Express.Multer.File;
}

/**
 * POST /api/submissions
 * Create lead submission with optional photo
 */
router.post('/', upload.single('photo'), async (req: SubmissionRequest, res: Response) => {
  try {
    const {
      sessionId,
      userId,
      name,
      email,
      modemModel,
      homeType,
      notes,
    } = req.body;

    // Validate session
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    const now = Date.now();
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
    const parsedUserId = userId ? parseInt(userId, 10) : null;

    // Insert submission
    const result = db.prepare(`
      INSERT INTO submissions (
        session_id, user_id, name, email, modem_model,
        home_type, notes, photo_path, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      parsedUserId || null,
      name,
      email,
      modemModel || null,
      homeType || null,
      notes || null,
      photoPath,
      now
    );

    // Send email asynchronously
    sendPersonalizedPlan(email, name).catch(err => 
      console.error('Email sending failed:', err)
    );

    // Log submission
    db.prepare(`
      INSERT INTO analytics_logs (session_id, event_name, payload, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      sessionId,
      'submission_created',
      JSON.stringify({ submissionId: (result as any).lastInsertRowid, hasPhoto: !!photoPath }),
      now
    );

    res.json({
      ok: true,
      submissionId: (result as any).lastInsertRowid,
      photoPath,
      message: 'Submission received. Check your email for personalized recommendations.',
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

export default router;

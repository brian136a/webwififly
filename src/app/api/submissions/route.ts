import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runAsync } from '@/db/client';

const submissionSchema = z.object({
  sessionId: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email(),
  testRunId: z.string().uuid().optional(),
  modem_photo_url: z.string().url().optional(),
  message: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = submissionSchema.parse(body);

    // Store submission (note: email not auto-sent, queued for later)
    const submissionId = await runAsync(
      `INSERT INTO submissions (session_id, name, email, test_run_id, modem_photo_url, message, created_at_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        validated.sessionId,
        validated.name,
        validated.email,
        validated.testRunId || null,
        validated.modem_photo_url || null,
        validated.message || null,
        Date.now(),
      ]
    );

    console.log(
      `[submissions] New submission from ${validated.email} (session: ${validated.sessionId})`
    );

    // TODO: Queue email sending (requires SMTP configuration)
    // sendEmailQueue.push({
    //   to: validated.email,
    //   template: 'support_followup',
    //   data: { name: validated.name, sessionId: validated.sessionId }
    // });

    return NextResponse.json(
      {
        ok: true,
        submissionId: submissionId.lastID,
        message: 'Thank you! We received your message and will follow up soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid submission', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[submissions] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to submit' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { runAsync } from '@/db/client';

const startRequestSchema = z.object({
  sessionId: z.string().uuid(),
  roomName: z.string().min(1).max(50).trim(),
  streams: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = startRequestSchema.parse(body);

    const testRunId = uuidv4();
    const streams = validated.streams || parseInt(process.env.STREAMS_DEFAULT || '8', 10);
    const chunkSizeBytes = parseInt(process.env.CHUNK_SIZE_BYTES || '1048576', 10);
    const testDurationMs = parseInt(process.env.TEST_DURATION_MS || '30000', 10);
    const workerPath = process.env.WORKER_PATH || '/librespeed/speedtest_worker.js';

    // Create test run record (placeholder for tracking)
    // We'll create the actual speed_tests record when finish is called
    console.log(`[speedtest] Test run started: ${testRunId} for room: ${validated.roomName}`);

    return NextResponse.json(
      {
        ok: true,
        testRunId,
        workerUrl: workerPath,
        streams,
        chunkSizeBytes,
        testDurationMs,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[speedtest/start] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to start speed test' },
      { status: 500 }
    );
  }
}

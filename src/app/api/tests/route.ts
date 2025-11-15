import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { speedTestSchema } from '@/lib/validation';
import { runAsync } from '@/db/client';

const ANOMALY_SPEED_THRESHOLD = 0.5; // 50% deviation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, roomName, downloadMbps, uploadMbps, pingMs, jitterMs } =
      body;

    // Validate input
    const validatedData = speedTestSchema.parse({
      sessionId,
      roomName,
      downloadMbps,
      uploadMbps,
      pingMs,
      jitterMs,
    });

    const id = uuidv4();
    const timestamp = Date.now();

    // Check for anomaly (simplified: if download deviates >50% from baseline, flag it)
    // In production, baseline would come from setup plan or rolling average
    let isAnomaly = false;
    // Anomaly detection would be more sophisticated in production

    // Insert test record
    await runAsync(
      `INSERT INTO speed_tests (id, session_id, room_name, download_mbps, upload_mbps, ping_ms, jitter_ms, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validatedData.sessionId,
        validatedData.roomName,
        validatedData.downloadMbps,
        validatedData.uploadMbps,
        validatedData.pingMs,
        validatedData.jitterMs,
        timestamp,
      ]
    );

    return NextResponse.json(
      {
        id,
        ...validatedData,
        timestamp,
        isAnomaly,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/tests error:', error);
    return NextResponse.json(
      { error: 'Failed to record speed test' },
      { status: 400 }
    );
  }
}

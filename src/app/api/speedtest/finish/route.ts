import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runAsync, getAsync } from '@/db/client';
import { detectAnomaly, sanitizeTestResult, SpeedTestResult } from '@/backend/utils/speedtestUtils';

const finishRequestSchema = z.object({
  sessionId: z.string().uuid(),
  testRunId: z.string().uuid(),
  roomName: z.string().min(1).max(50).trim(),
  downloadMbps: z.number().nonnegative(),
  uploadMbps: z.number().nonnegative(),
  pingMs: z.number().nonnegative(),
  jitterMs: z.number().nonnegative(),
  raw_dl_bytes: z.number().int().nonnegative().optional(),
  raw_ul_bytes: z.number().int().nonnegative().optional(),
  duration_ms: z.number().int().positive().optional(),
  sample_count: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = finishRequestSchema.parse(body);

    // Sanitize numeric values
    const sanityCheck = sanitizeTestResult(
      validated.downloadMbps,
      validated.uploadMbps,
      validated.pingMs,
      validated.jitterMs
    );

    if (!sanityCheck.valid) {
      return NextResponse.json(
        { ok: false, error: sanityCheck.error },
        { status: 400 }
      );
    }

    // Get setup data to check plan speed
    const setup = await getAsync(
      'SELECT plan_download_mbps FROM setups WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
      [validated.sessionId]
    );

    const planDownloadMbps = (setup as any)?.plan_download_mbps || null;

    // Detect anomalies
    const testResult: SpeedTestResult = {
      downloadMbps: validated.downloadMbps,
      uploadMbps: validated.uploadMbps,
      pingMs: validated.pingMs,
      jitterMs: validated.jitterMs,
      raw_dl_bytes: validated.raw_dl_bytes,
      raw_ul_bytes: validated.raw_ul_bytes,
      duration_ms: validated.duration_ms,
      planDownloadMbps: planDownloadMbps || undefined,
    };

    const anomalyCheck = detectAnomaly(testResult);

    // Persist to database
    const recordId = await runAsync(
      `INSERT INTO speed_tests (
        id, session_id, room_name, download_mbps, upload_mbps, ping_ms, jitter_ms,
        raw_dl_bytes, raw_ul_bytes, duration_ms, anomaly, display_dl_mbps, created_at_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        require('crypto').randomUUID(),
        validated.sessionId,
        validated.roomName,
        validated.downloadMbps,
        validated.uploadMbps,
        validated.pingMs,
        validated.jitterMs,
        validated.raw_dl_bytes || null,
        validated.raw_ul_bytes || null,
        validated.duration_ms || null,
        anomalyCheck.isAnomaly ? 1 : 0,
        anomalyCheck.displayDlMbps,
        Date.now(),
      ]
    );

    // Log anomaly if detected
    if (anomalyCheck.isAnomaly) {
      console.warn(
        `[speedtest] ANOMALY detected: session=${validated.sessionId}, room=${validated.roomName}, dl=${validated.downloadMbps}Mbps, note=${anomalyCheck.note}`
      );

      // TODO: Send to analytics
      // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify({
      //   eventName: 'speedtest_anomaly',
      //   payload: { sessionId: validated.sessionId, testRunId: validated.testRunId, measuredDl: validated.downloadMbps, note: anomalyCheck.note }
      // })});
    }

    return NextResponse.json(
      {
        ok: true,
        recordId: recordId.lastID,
        anomaly: anomalyCheck.isAnomaly,
        displayDlMbps: anomalyCheck.displayDlMbps,
        displayUlMbps: anomalyCheck.displayUlMbps,
        note: anomalyCheck.note,
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

    console.error('[speedtest/finish] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to finish speed test' },
      { status: 500 }
    );
  }
}

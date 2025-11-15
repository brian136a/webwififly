import { NextRequest, NextResponse } from 'next/server';
import { queryAsync } from '@/db/client';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get setup data
    const setups = await queryAsync(
      `SELECT * FROM setups WHERE session_id = ? ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );

    // Get speed test results
    const tests = await queryAsync(
      `SELECT * FROM speed_tests WHERE session_id = ? ORDER BY timestamp DESC`,
      [sessionId]
    );

    if (tests.length === 0) {
      return NextResponse.json(
        { error: 'No test results for this session' },
        { status: 404 }
      );
    }

    // Calculate aggregates
    const downloadSpeeds = tests.map((t: any) => t.download_mbps);
    const uploadSpeeds = tests.map((t: any) => t.upload_mbps);
    const pings = tests.map((t: any) => t.ping_ms);
    const jitters = tests.map((t: any) => t.jitter_ms);

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const min = (arr: number[]) => (arr.length > 0 ? Math.min(...arr) : 0);
    const max = (arr: number[]) => (arr.length > 0 ? Math.max(...arr) : 0);

    const analysis = {
      sessionId,
      testCount: tests.length,
      setup: setups[0] || null,
      download: {
        avg: Math.round(avg(downloadSpeeds) * 100) / 100,
        min: Math.round(min(downloadSpeeds) * 100) / 100,
        max: Math.round(max(downloadSpeeds) * 100) / 100,
      },
      upload: {
        avg: Math.round(avg(uploadSpeeds) * 100) / 100,
        min: Math.round(min(uploadSpeeds) * 100) / 100,
        max: Math.round(max(uploadSpeeds) * 100) / 100,
      },
      ping: {
        avg: Math.round(avg(pings) * 100) / 100,
        min: Math.round(min(pings) * 100) / 100,
        max: Math.round(max(pings) * 100) / 100,
      },
      jitter: {
        avg: Math.round(avg(jitters) * 100) / 100,
        min: Math.round(min(jitters) * 100) / 100,
        max: Math.round(max(jitters) * 100) / 100,
      },
      tests: tests.map((t: any) => ({
        id: t.id,
        roomName: t.room_name,
        downloadMbps: t.download_mbps,
        uploadMbps: t.upload_mbps,
        pingMs: t.ping_ms,
        jitterMs: t.jitter_ms,
        timestamp: t.timestamp,
      })),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('GET /api/analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
}

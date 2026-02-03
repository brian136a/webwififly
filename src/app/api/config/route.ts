import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    anomalySpeedThreshold: 0.5, // 50% deviation threshold (legacy)
    version: '1.0.0',
    // Speedtest configuration
    ANOMALY_SPEED_THRESHOLD: parseInt(process.env.ANOMALY_SPEED_THRESHOLD || '1000', 10),
    MAX_DISPLAY_MBPS: parseInt(process.env.MAX_DISPLAY_MBPS || '1000', 10),
    STREAMS_DEFAULT: parseInt(process.env.STREAMS_DEFAULT || '8', 10),
    CHUNK_SIZE_BYTES: parseInt(process.env.CHUNK_SIZE_BYTES || '1048576', 10),
    TEST_DURATION_MS: parseInt(process.env.TEST_DURATION_MS || '5000', 10), // Reduced to 5 seconds
    TEST_DURATION_MODEM_MS: parseInt(process.env.TEST_DURATION_MODEM_MS || '8000', 10), // 8 seconds for modem (includes ping/jitter/upload)
    WORKER_PATH: process.env.WORKER_PATH || '/librespeed/speedtest_worker.js',
    ALLOW_LOCALHOST_TESTS: process.env.ALLOW_LOCALHOST_TESTS === 'true',
  });
}

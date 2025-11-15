/**
 * Backend Speedtest Runner - Orchestrates speedtest flows via the new /api/speedtest/* endpoints
 * Replaces the LibreSpeed client-side runner with backend-coordinated testing
 */

export interface SpeedtestConfig {
  ANOMALY_SPEED_THRESHOLD: number;
  MAX_DISPLAY_MBPS: number;
  STREAMS_DEFAULT: number;
  CHUNK_SIZE_BYTES: number;
  TEST_DURATION_MS: number;
  WORKER_PATH: string;
  ALLOW_LOCALHOST_TESTS: boolean;
}

export interface TestRunResult {
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
  anomaly: boolean;
  displayDlMbps: number;
  displayUlMbps: number;
  note?: string;
}

/**
 * Fetch speedtest configuration from the API
 */
export async function getSpeedtestConfig(): Promise<SpeedtestConfig> {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  const data = await res.json();
  return {
    ANOMALY_SPEED_THRESHOLD: data.ANOMALY_SPEED_THRESHOLD,
    MAX_DISPLAY_MBPS: data.MAX_DISPLAY_MBPS,
    STREAMS_DEFAULT: data.STREAMS_DEFAULT,
    CHUNK_SIZE_BYTES: data.CHUNK_SIZE_BYTES,
    TEST_DURATION_MS: data.TEST_DURATION_MS,
    WORKER_PATH: data.WORKER_PATH,
    ALLOW_LOCALHOST_TESTS: data.ALLOW_LOCALHOST_TESTS,
  };
}

/**
 * Start a new speedtest run on the backend
 * Returns testRunId and configuration for the test
 */
export async function startSpeedtest(sessionId: string, roomName: string): Promise<{
  testRunId: string;
  streams: number;
  chunkSizeBytes: number;
  testDurationMs: number;
}> {
  const res = await fetch('/api/speedtest/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, roomName }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to start speedtest');
  }

  return res.json();
}

/**
 * Download chunks for speed measurement
 * Tracks bytes downloaded and duration
 */
export async function downloadChunk(size: number): Promise<Uint8Array> {
  const res = await fetch(`/api/speedtest/chunk?size=${size}`);
  if (!res.ok) throw new Error('Chunk download failed');
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Upload chunk for speed measurement
 * Posts data back to server to measure upload speed
 */
export async function uploadChunk(data: Uint8Array): Promise<void> {
  const res = await fetch('/api/speedtest/chunk', {
    method: 'POST',
    headers: { 'Content-Length': String(data.byteLength) },
    body: Buffer.from(data),
  });

  if (!res.ok) throw new Error('Chunk upload failed');
}

/**
 * Finish speedtest and record results on backend
 * Returns the persisted result with anomaly detection applied
 */
export async function finishSpeedtest(
  testRunId: string,
  sessionId: string,
  roomName: string,
  results: {
    dl: number;
    ul: number;
    ping: number;
    jitter: number;
  }
): Promise<TestRunResult> {
  const res = await fetch('/api/speedtest/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testRunId,
      sessionId,
      roomName,
      downloadMbps: results.dl,
      uploadMbps: results.ul,
      pingMs: results.ping,
      jitterMs: results.jitter,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to finish speedtest');
  }

  return res.json();
}

/**
 * Run a complete speedtest sequence using backend API
 * - Start test
 * - Download phase (measure speed)
 * - Ping measurement
 * - Upload phase (measure speed)
 * - Finish and persist results
 */
export async function runFullSpeedtest(
  sessionId: string,
  roomName: string,
  config: SpeedtestConfig,
  onProgress?: (state: string, progress: number) => void
): Promise<TestRunResult> {
  try {
    // Start test
    onProgress?.('Starting test', 0);
    const { testRunId, streams, chunkSizeBytes, testDurationMs } = await startSpeedtest(
      sessionId,
      roomName
    );

    // Download phase (25% -> 50%)
    onProgress?.('Downloading', 25);
    const downloadStartTime = Date.now();
    let downloadBytes = 0;
    const downloadEndTime = downloadStartTime + testDurationMs;

    while (Date.now() < downloadEndTime) {
      try {
        const chunk = await downloadChunk(chunkSizeBytes);
        downloadBytes += chunk.byteLength;
        const progress = 25 + ((Date.now() - downloadStartTime) / testDurationMs) * 25;
        onProgress?.('Downloading', Math.min(progress, 50));
      } catch (e) {
        console.warn('Download chunk error (continuing):', e);
        // Continue with remaining time
      }
    }

    const downloadDurationMs = Date.now() - downloadStartTime;
    const dlMbps = (downloadBytes * 8) / (downloadDurationMs / 1000) / 1_000_000;

    // Ping measurement (simple: measure response time of a ping request)
    onProgress?.('Measuring latency', 50);
    const pingStart = Date.now();
    await fetch('/api/config'); // Simple ping request
    const pingMs = Date.now() - pingStart;

    // Jitter estimation (measure variance in a few requests)
    const latencies: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await fetch('/api/config');
      latencies.push(Date.now() - start);
    }
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const jitterMs = Math.sqrt(
      latencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencies.length
    );

    // Upload phase (50% -> 100%)
    onProgress?.('Uploading', 50);
    const uploadStartTime = Date.now();
    let uploadBytes = 0;
    const uploadEndTime = uploadStartTime + testDurationMs;
    const uploadData = new Uint8Array(chunkSizeBytes);

    while (Date.now() < uploadEndTime) {
      try {
        await uploadChunk(uploadData);
        uploadBytes += uploadData.byteLength;
        const progress = 50 + ((Date.now() - uploadStartTime) / testDurationMs) * 50;
        onProgress?.('Uploading', Math.min(progress, 100));
      } catch (e) {
        console.warn('Upload chunk error (continuing):', e);
      }
    }

    const uploadDurationMs = Date.now() - uploadStartTime;
    const ulMbps = (uploadBytes * 8) / (uploadDurationMs / 1000) / 1_000_000;

    // Finish test and persist results
    onProgress?.('Saving results', 100);
    const result = await finishSpeedtest(testRunId, sessionId, roomName, {
      dl: Math.round(dlMbps),
      ul: Math.round(ulMbps),
      ping: Math.round(pingMs),
      jitter: Math.round(jitterMs),
    });

    return result;
  } catch (error) {
    console.error('Speedtest error:', error);
    throw error;
  }
}

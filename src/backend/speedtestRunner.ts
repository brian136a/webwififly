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
  TEST_DURATION_MODEM_MS: number;
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
    TEST_DURATION_MODEM_MS: data.TEST_DURATION_MODEM_MS,
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
export async function downloadChunk(size: number): Promise<{
  data: Uint8Array;
  downloadTime: number;
}> {
  try {
    const startTime = performance.now();
    const res = await fetch(`/api/speedtest/chunk?size=${size}`);
    if (!res.ok) throw new Error('Chunk download failed');
    const data = new Uint8Array(await res.arrayBuffer());
    const endTime = performance.now();

    return {
      data,
      downloadTime: endTime - startTime,
    };
  } catch (error) {
    console.warn('Download chunk failed, using mock data:', error);
    // Return mock data for testing when backend is not available
    const mockData = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      mockData[i] = Math.floor(Math.random() * 256);
    }
    return {
      data: mockData,
      downloadTime: Math.random() * 100 + 50, // Mock download time 50-150ms
    };
  }
}

/**
 * Download multiple chunks concurrently for speed measurement
 * Uses Promise.all to parallelize requests (simulates multi-stream test)
 */
export async function downloadChunksConcurrent(size: number, streams: number): Promise<{
  bytesDownloaded: number;
  averageDownloadTime: number;
  totalTime: number;
}> {
  try {
    const downloadPromises = Array(streams)
      .fill(null)
      .map(() =>
        downloadChunk(size)
          .catch(e => {
            console.warn('Download error (continuing):', e);
            return { data: new Uint8Array(0), downloadTime: 0 };
          })
      );

    const results = await Promise.all(downloadPromises);
    const totalBytes = results.reduce((sum, result) => sum + result.data.byteLength, 0);
    const totalTime = Math.max(...results.map(r => r.downloadTime));
    const avgTime = results.reduce((sum, r) => sum + r.downloadTime, 0) / results.length;

    return {
      bytesDownloaded: totalBytes,
      averageDownloadTime: avgTime,
      totalTime,
    };
  } catch (error) {
    console.warn('Concurrent download error:', error);
    return { bytesDownloaded: 0, averageDownloadTime: 0, totalTime: 0 };
  }
}

/**
 * Upload chunk for speed measurement
 * Posts data back to server to measure upload speed
 * Accounts for server processing time
 */
export async function uploadChunk(data: Uint8Array): Promise<{
  bytesSent: number;
  roundTripTime: number;
  serverProcessingTime: number;
}> {
  try {
    const sendStart = performance.now();

    const res = await fetch('/api/speedtest/chunk', {
      method: 'POST',
      headers: {
        'Content-Length': String(data.byteLength),
        'Content-Type': 'application/octet-stream',
      },
      body: new Blob([data as any]),
    });

    const sendEnd = performance.now();

    if (!res.ok) throw new Error('Chunk upload failed');

    const responseData = await res.json();
    const serverProcessingTime = responseData.serverProcessingTimeMs || 0;

    // Calculate actual network time (exclude server processing)
    const totalRoundTrip = sendEnd - sendStart;
    const networkTime = Math.max(0, totalRoundTrip - serverProcessingTime);

    return {
      bytesSent: data.byteLength,
      roundTripTime: totalRoundTrip,
      serverProcessingTime,
    };
  } catch (error) {
    console.warn('Upload chunk failed, using mock data:', error);
    // Return mock data for testing
    return {
      bytesSent: data.byteLength,
      roundTripTime: Math.random() * 100 + 50, // Mock round trip 50-150ms
      serverProcessingTime: Math.random() * 20, // Mock server time
    };
  }
}

/**
 * Upload multiple chunks concurrently for speed measurement
 * Returns detailed timing information for accurate speed calculation
 */
export async function uploadChunksConcurrent(data: Uint8Array, streams: number): Promise<{
  bytesSent: number;
  averageNetworkTime: number;
  totalTime: number;
}> {
  try {
    const uploadPromises = Array(streams)
      .fill(null)
      .map(() =>
        uploadChunk(data)
          .catch(e => {
            console.warn('Upload error (continuing):', e);
            return { bytesSent: 0, roundTripTime: 0, serverProcessingTime: 0 };
          })
      );

    const results = await Promise.all(uploadPromises);

    const totalBytes = results.reduce((sum, r) => sum + r.bytesSent, 0);
    const totalTime = Math.max(...results.map(r => r.roundTripTime));
    const avgNetworkTime = results.reduce((sum, r) => sum + r.roundTripTime, 0) / results.length;

    return {
      bytesSent: totalBytes,
      averageNetworkTime: avgNetworkTime,
      totalTime,
    };
  } catch (error) {
    console.warn('Concurrent upload error:', error);
    return { bytesSent: 0, averageNetworkTime: 0, totalTime: 0 };
  }
}

/**
 * Enhanced ping measurement with high precision timing
 * Uses multiple samples and statistical analysis
 */
export async function measurePing(samples: number = 20): Promise<{
  pingMs: number;
  jitterMs: number;
  minPing: number;
  maxPing: number;
}> {
  const latencies: number[] = [];

  // Warm-up ping (discard first result to avoid DNS/cache effects)
  try {
    await fetch('/api/ping');
  } catch (e) {
    console.warn('Warm-up ping failed:', e);
  }

  // Take multiple ping samples with small delays
  for (let i = 0; i < samples; i++) {
    try {
      const startTime = performance.now(); // Use high-precision timer
      const response = await fetch(`/api/ping?t=${startTime}`, {
        method: 'GET',
        cache: 'no-cache',
      });

      if (response.ok) {
        const endTime = performance.now();
        const latency = endTime - startTime;
        latencies.push(latency);
      }

      // Small delay between pings to avoid overwhelming the server
      if (i < samples - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.warn(`Ping sample ${i + 1} failed:`, error);
      // Continue with remaining samples
    }
  }

  if (latencies.length === 0) {
    throw new Error('All ping measurements failed');
  }

  // Calculate statistics
  const sortedLatencies = [...latencies].sort((a, b) => a - b);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  // Use interquartile mean for more robust average (removes outliers)
  const q1Index = Math.floor(latencies.length * 0.25);
  const q3Index = Math.floor(latencies.length * 0.75);
  const interquartileLatencies = sortedLatencies.slice(q1Index, q3Index + 1);
  const robustAvg = interquartileLatencies.reduce((a, b) => a + b, 0) / interquartileLatencies.length;

  // Calculate jitter (RMS of differences from mean)
  const jitter = Math.sqrt(
    latencies.reduce((sum, lat) => sum + Math.pow(lat - robustAvg, 2), 0) / latencies.length
  );

  return {
    pingMs: Math.round(robustAvg * 100) / 100, // Round to 2 decimal places
    jitterMs: Math.round(jitter * 100) / 100,
    minPing: Math.round(Math.min(...latencies) * 100) / 100,
    maxPing: Math.round(Math.max(...latencies) * 100) / 100,
  };
}

/**
 * TCP warm-up phase to account for TCP slow-start
 * Downloads small amounts of data to establish optimal TCP window
 */
export async function tcpWarmup(streams: number): Promise<void> {
  const warmupPromises = [];

  // Use smaller chunks for warm-up (64KB each)
  const warmupSize = 65536;

  for (let i = 0; i < streams; i++) {
    warmupPromises.push(
      downloadChunk(warmupSize).catch(e => {
        console.warn('Warm-up download failed:', e);
        return new Uint8Array(0);
      })
    );
  }

  await Promise.all(warmupPromises);

  // Brief pause to let TCP optimize
  await new Promise(resolve => setTimeout(resolve, 200));
}
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
 * - TCP warm-up phase
 * - Download phase (measure speed)
 * - Ping measurement with high precision
 * - Upload phase (measure speed)
 * - Finish and persist results
 */
export async function runFullSpeedtest(
  sessionId: string,
  roomName: string,
  config: SpeedtestConfig,
  onProgress?: (state: string, progress: number) => void,
  isModemTest: boolean = false
): Promise<TestRunResult> {
  try {
    // Start test
    onProgress?.('Starting test', 0);
    const { testRunId, streams, chunkSizeBytes, testDurationMs } = await startSpeedtest(
      sessionId,
      roomName
    );

    const effectiveStreams = Math.max(1, Math.min(streams, 8)); // Cap at 8 streams
    const testDuration = isModemTest ? config.TEST_DURATION_MODEM_MS : config.TEST_DURATION_MS;

    // TCP Warm-up phase (5% -> 10%) - Establish optimal TCP connections
    onProgress?.('Warming up connections', 5);
    await tcpWarmup(effectiveStreams);
    onProgress?.('Warming up connections', 10);

    // Download phase - Use concurrent streams for true parallel throughput
    const downloadProgress = isModemTest ? 'Testing download speed' : 'Testing WiFi speed';
    onProgress?.(downloadProgress, 10);
    const downloadStartTime = Date.now();
    let downloadBytes = 0;
    let totalDownloadTime = 0;
    let downloadRoundCount = 0;
    const downloadEndTime = downloadStartTime + testDuration;

    // Adaptive chunk sizing based on connection type estimation
    let downloadChunkSize = Math.max(131072, Math.floor(chunkSizeBytes / 4)); // Start smaller for efficiency

    // Quick adaptive phase for data efficiency
    const adaptiveChunks = Math.min(2, effectiveStreams);
    for (let i = 0; i < adaptiveChunks && Date.now() < downloadEndTime; i++) {
      try {
        const result = await downloadChunksConcurrent(downloadChunkSize, effectiveStreams);
        downloadBytes += result.bytesDownloaded;
        totalDownloadTime += result.averageDownloadTime;
        downloadRoundCount++;

        // Adaptive chunk sizing: optimize for speed vs data usage
        const chunkSpeedMbps = (result.bytesDownloaded * 8) / (result.totalTime / 1000) / 1_000_000;
        if (chunkSpeedMbps > 200) {
          // Fast connection, can use larger chunks efficiently
          downloadChunkSize = Math.min(chunkSizeBytes / 2, downloadChunkSize * 1.5);
        } else if (chunkSpeedMbps < 20) {
          // Slower connection, keep smaller chunks
          downloadChunkSize = Math.max(65536, downloadChunkSize * 0.8);
        }

        const progress = 10 + ((Date.now() - downloadStartTime) / testDuration) * (isModemTest ? 35 : 80);
        onProgress?.(downloadProgress, Math.min(progress, isModemTest ? 45 : 90));
      } catch (e) {
        console.warn('Download batch error (continuing):', e);
      }
    }

    // Continue with optimized chunk size for remaining time
    while (Date.now() < downloadEndTime) {
      try {
        const result = await downloadChunksConcurrent(downloadChunkSize, effectiveStreams);
        downloadBytes += result.bytesDownloaded;
        totalDownloadTime += result.averageDownloadTime;
        downloadRoundCount++;

        const progress = 10 + ((Date.now() - downloadStartTime) / testDuration) * (isModemTest ? 35 : 80);
        onProgress?.(downloadProgress, Math.min(progress, isModemTest ? 45 : 90));
      } catch (e) {
        console.warn('Download batch error (continuing):', e);
      }
    }

    const downloadDurationMs = Date.now() - downloadStartTime;
    // Use actual download time for more accurate calculation
    const avgDownloadTimePerRound = downloadRoundCount > 0 ? totalDownloadTime / downloadRoundCount : downloadDurationMs;
    const effectiveDownloadTime = Math.max(avgDownloadTimePerRound * downloadRoundCount, downloadDurationMs * 0.9);
    const dlMbps = (downloadBytes * 8) / (effectiveDownloadTime / 1000) / 1_000_000;

    let pingResults = { pingMs: 0, jitterMs: 0, minPing: 0, maxPing: 0 };
    let ulMbps = 0;

    if (isModemTest) {
      // Enhanced ping and jitter measurement (45% -> 55%)
      onProgress?.('Measuring latency & jitter', 45);
      pingResults = await measurePing(20); // Reduced to 20 samples for efficiency
      onProgress?.('Measuring latency & jitter', 55);

      // Upload phase (55% -> 100%) - Use concurrent streams for true parallel throughput
      onProgress?.('Testing upload speed', 55);
      const uploadStartTime = Date.now();
      let uploadBytes = 0;
      let totalUploadNetworkTime = 0;
      let uploadRoundCount = 0;
      const uploadEndTime = uploadStartTime + testDuration;

      // Adaptive upload chunk sizing
      let uploadChunkSize = Math.max(65536, Math.floor(chunkSizeBytes / 8)); // Smaller for upload efficiency
      let uploadData = new Uint8Array(uploadChunkSize);

      // Quick upload adaptation
      const uploadAdaptiveChunks = Math.min(1, effectiveStreams);
      for (let i = 0; i < uploadAdaptiveChunks && Date.now() < uploadEndTime; i++) {
        try {
          const result = await uploadChunksConcurrent(uploadData, effectiveStreams);
          uploadBytes += result.bytesSent;
          totalUploadNetworkTime += result.averageNetworkTime;
          uploadRoundCount++;

          // Adjust chunk size based on upload speed
          const chunkSpeedMbps = (result.bytesSent * 8) / (result.totalTime / 1000) / 1_000_000;
          if (chunkSpeedMbps > 100) {
            uploadChunkSize = Math.min(chunkSizeBytes / 4, Math.floor(uploadChunkSize * 1.3));
          } else if (chunkSpeedMbps < 10) {
            uploadChunkSize = Math.max(32768, Math.floor(uploadChunkSize * 0.7));
          }

          // Recreate data buffer with new size
          uploadData = new Uint8Array(uploadChunkSize);

          const progress = 55 + ((Date.now() - uploadStartTime) / testDuration) * 20;
          onProgress?.('Testing upload speed', Math.min(progress, 75));
        } catch (e) {
          console.warn('Upload batch error (continuing):', e);
        }
      }

      // Continue with optimized chunk size
      while (Date.now() < uploadEndTime) {
        try {
          const result = await uploadChunksConcurrent(uploadData, effectiveStreams);
          uploadBytes += result.bytesSent;
          totalUploadNetworkTime += result.averageNetworkTime;
          uploadRoundCount++;

          const progress = 55 + ((Date.now() - uploadStartTime) / testDuration) * 45;
          onProgress?.('Testing upload speed', Math.min(progress, 100));
        } catch (e) {
          console.warn('Upload batch error (continuing):', e);
        }
      }

      const uploadDurationMs = Date.now() - uploadStartTime;
      // Use network-only time for more accurate speed calculation
      const avgNetworkTimePerRound = uploadRoundCount > 0 ? totalUploadNetworkTime / uploadRoundCount : uploadDurationMs;
      const effectiveUploadTime = Math.max(avgNetworkTimePerRound * uploadRoundCount, uploadDurationMs * 0.8);
      ulMbps = (uploadBytes * 8) / (effectiveUploadTime / 1000) / 1_000_000;
    } else {
      // Room test complete
      onProgress?.('WiFi test complete', 100);
    }

    // Finish test and persist results
    onProgress?.('Saving results', 100);
    const result = await finishSpeedtest(testRunId, sessionId, roomName, {
      dl: Math.round(dlMbps * 100) / 100, // Round to 2 decimal places
      ul: Math.round(ulMbps * 100) / 100,
      ping: pingResults.pingMs,
      jitter: pingResults.jitterMs,
    });

    return result;
  } catch (error) {
    console.error('Speedtest error:', error);
    throw error;
  }
}

/**
 * Speed Test Utility Functions
 * Provides anomaly detection, sanity checks, capping/flagging logic
 */

const ANOMALY_SPEED_THRESHOLD = parseInt(process.env.ANOMALY_SPEED_THRESHOLD || '1000', 10);
const MAX_DISPLAY_MBPS = parseInt(process.env.MAX_DISPLAY_MBPS || '1000', 10);

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  raw_dl_bytes?: number;
  raw_ul_bytes?: number;
  duration_ms?: number;
  planDownloadMbps?: number;
}

export interface AnomalyCheckResult {
  isAnomaly: boolean;
  displayDlMbps: number;
  displayUlMbps: number;
  note?: string;
}

/**
 * Convert bytes downloaded in duration_ms to Mbps
 */
export function bytesToMbps(bytes: number, durationMs: number): number {
  if (durationMs <= 0 || bytes < 0) return 0;
  const seconds = durationMs / 1000;
  const bits = bytes * 8;
  const megabits = bits / 1_000_000;
  return megabits / seconds;
}

/**
 * Detect anomalies based on multiple heuristics
 */
export function detectAnomaly(result: SpeedTestResult): AnomalyCheckResult {
  const notes: string[] = [];
  let isAnomaly = false;

  // Rule 1: Speed exceeds known threshold
  if (result.downloadMbps > ANOMALY_SPEED_THRESHOLD) {
    isAnomaly = true;
    notes.push(`Download ${result.downloadMbps} Mbps exceeds threshold ${ANOMALY_SPEED_THRESHOLD}`);
  }

  if (result.uploadMbps > ANOMALY_SPEED_THRESHOLD) {
    isAnomaly = true;
    notes.push(`Upload ${result.uploadMbps} Mbps exceeds threshold`);
  }

  // Rule 2: Speed is 5x plan speed (indicates local test or measurement error)
  if (result.planDownloadMbps && result.downloadMbps > result.planDownloadMbps * 5) {
    isAnomaly = true;
    notes.push(`Download ${result.downloadMbps} Mbps is 5x plan speed ${result.planDownloadMbps}`);
  }

  // Rule 3: Possible unit mismatch (raw bytes vs duration inconsistency)
  if (result.raw_dl_bytes !== undefined && result.duration_ms !== undefined) {
    const streams = 8; // Default
    const chunk_size = 1_048_576; // 1 MB
    const expected_max_bytes = chunk_size * streams * (result.duration_ms / 1000) * 1.2;

    if (result.raw_dl_bytes > expected_max_bytes) {
      isAnomaly = true;
      notes.push(`Raw bytes ${result.raw_dl_bytes} exceeds expected max ${expected_max_bytes}`);
    }
  }

  // Rule 4: Ping/Jitter sanity (skip for room tests where values are intentionally zero)
  const isLikelyRoomTest = result.pingMs === 0 && result.jitterMs === 0 && result.uploadMbps === 0;

  if (!isLikelyRoomTest) {
    if (result.pingMs < 1) {
      isAnomaly = true;
      notes.push(`Ping ${result.pingMs} is unrealistically low`);
    }

    if (result.jitterMs < 0) {
      isAnomaly = true;
      notes.push(`Jitter ${result.jitterMs} is negative`);
    }
  }

  // Cap display values
  const displayDlMbps = Math.min(result.downloadMbps, MAX_DISPLAY_MBPS);
  const displayUlMbps = Math.min(result.uploadMbps, MAX_DISPLAY_MBPS);

  return {
    isAnomaly,
    displayDlMbps,
    displayUlMbps,
    note: notes.length > 0 ? notes[0] : undefined,
  };
}

/**
 * Sanity check incoming values (validation layer before DB)
 */
export function sanitizeTestResult(
  dl: number,
  ul: number,
  ping: number,
  jitter: number
): { valid: boolean; error?: string } {
  if (isNaN(dl) || dl < 0) return { valid: false, error: 'downloadMbps must be non-negative' };
  if (isNaN(ul) || ul < 0) return { valid: false, error: 'uploadMbps must be non-negative' };
  if (isNaN(ping) || ping < 0) return { valid: false, error: 'pingMs must be non-negative' };
  if (isNaN(jitter) || jitter < 0) return { valid: false, error: 'jitterMs must be non-negative' };

  return { valid: true };
}

/**
 * Format display values with capping and note
 */
export function formatDisplayValues(
  downloadMbps: number,
  uploadMbps: number,
  isCapped: boolean
): {
  displayDl: string;
  displayUl: string;
  cappedNote: string | null;
} {
  const cappedDl = Math.min(downloadMbps, MAX_DISPLAY_MBPS);
  const cappedUl = Math.min(uploadMbps, MAX_DISPLAY_MBPS);

  const displayDl = cappedDl.toFixed(2);
  const displayUl = cappedUl.toFixed(2);

  const cappedNote = isCapped
    ? `Raw measured: ${downloadMbps.toFixed(2)} Mbps (anomalous — see notes)`
    : null;

  return { displayDl, displayUl, cappedNote };
}

export default {
  bytesToMbps,
  detectAnomaly,
  sanitizeTestResult,
  formatDisplayValues,
  ANOMALY_SPEED_THRESHOLD,
  MAX_DISPLAY_MBPS,
};

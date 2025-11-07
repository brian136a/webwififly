/**
 * LibreSpeed Integration Utility
 * 
 * CRITICAL NOTE: LibreSpeed uses Web Workers with importModule/loadModule,
 * which are NOT supported by Turbopack in Next.js 16.0.1.
 * 
 * For development/testing, run with standard Webpack dev server:
 * - Use Next.js 15.x, or
 * - Use `--turbo=false` flag if available, or
 * - Build for production where this limitation doesn't apply
 */

import type { 
  LibreSpeedData,
  LibreSpeedTestPoint, 
  LibreSpeedServer,
} from '@/types/librespeed';

export interface SpeedtestSettings {
  server_list?: LibreSpeedServer[];
  time_dl?: number;
  time_ul?: number;
  count_ping?: number;
  test_order?: string;
  [key: string]: unknown;
}

export type SpeedtestInstance = {
  onupdate?: (data: LibreSpeedData) => void;
  onend?: (aborted: boolean) => void;
  start: (settings?: SpeedtestSettings) => void;
  abort: () => void;
  getState?: () => number;
};

declare global {
  interface Window {
    Speedtest?: new () => SpeedtestInstance;
  }
}

/**
 * Check if LibreSpeed script is loaded and available
 */
export function isSpeedtestAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.Speedtest !== 'undefined';
}

/**
 * Pre-flight check: verify the worker file is accessible
 * LibreSpeed v5.4.1 loads worker with relative path "speedtest_worker.js"
 * which resolves relative to the script's location (/librespeed/speedtest.js)
 * so the worker should be at /librespeed/speedtest_worker.js
 */
export async function checkWorkerAccessibility(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/librespeed/speedtest_worker.js', { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[LibreSpeed] Worker accessibility check failed:', error);
    return false;
  }
}

/**
 * Get a new Speedtest instance
 */
export function getSpeedtest(): SpeedtestInstance | null {
  if (!isSpeedtestAvailable()) return null;
  try {
    return new window.Speedtest!();
  } catch (error) {
    console.error('Failed to create Speedtest instance:', error);
    return null;
  }
}

/**
 * Initialize a Speedtest instance with optional configuration
 */
export function initializeSpeedtest(config?: SpeedtestSettings): SpeedtestInstance | null {
  const instance = getSpeedtest();
  if (!instance) return null;
  
  // Apply default settings if needed
  // Note: Settings are typically passed to start() method instead
  return instance;
}

/**
 * Start a speed test
 */
export function startTest(
  instance: SpeedtestInstance,
  settings?: SpeedtestSettings
): void {
  if (!instance) {
    throw new Error('Invalid Speedtest instance');
  }
  instance.start(settings);
}

/**
 * Abort an ongoing test
 */
export function abortTest(instance: SpeedtestInstance): void {
  if (!instance) return;
  try {
    instance.abort();
  } catch (error) {
    console.error('Failed to abort test:', error);
  }
}

/**
 * Set the update callback for live test data
 */
export function onTestUpdate(
  instance: SpeedtestInstance,
  callback: (data: LibreSpeedData) => void
): void {
  if (!instance) return;
  instance.onupdate = callback;
}

/**
 * Set the end callback for when the test completes
 * Note: LibreSpeed's onend receives (aborted: boolean), not a result object
 */
export function onTestEnd(
  instance: SpeedtestInstance,
  callback: (aborted: boolean) => void
): void {
  if (!instance) return;
  instance.onend = callback;
}

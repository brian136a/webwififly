import {
  bytesToMbps,
  detectAnomaly,
  sanitizeTestResult,
  formatDisplayValues,
  SpeedTestResult,
} from '@/backend/utils/speedtestUtils';

describe('speedtestUtils', () => {
  describe('bytesToMbps', () => {
    it('should convert bytes to Mbps correctly', () => {
      // 1 MB = 8 Mbits, in 1 second = 8 Mbps
      const mbps = bytesToMbps(1_000_000, 1000);
      expect(mbps).toBeCloseTo(8, 1);
    });

    it('should handle zero duration', () => {
      expect(bytesToMbps(1_000_000, 0)).toBe(0);
    });

    it('should handle negative bytes', () => {
      expect(bytesToMbps(-1_000_000, 1000)).toBe(0);
    });
  });

  describe('detectAnomaly', () => {
    it('should not flag normal results', () => {
      const result: SpeedTestResult = {
        downloadMbps: 100,
        uploadMbps: 20,
        pingMs: 15,
        jitterMs: 2,
        planDownloadMbps: 100,
      };

      const check = detectAnomaly(result);
      expect(check.isAnomaly).toBe(false);
      expect(check.displayDlMbps).toBe(100);
    });

    it('should flag speeds exceeding threshold (1000 Mbps)', () => {
      const result: SpeedTestResult = {
        downloadMbps: 1500,
        uploadMbps: 20,
        pingMs: 15,
        jitterMs: 2,
      };

      const check = detectAnomaly(result);
      expect(check.isAnomaly).toBe(true);
      expect(check.displayDlMbps).toBeLessThanOrEqual(1000);
      expect(check.note).toContain('exceeds threshold');
    });

    it('should flag speeds 5x plan speed', () => {
      const result: SpeedTestResult = {
        downloadMbps: 600,
        uploadMbps: 20,
        pingMs: 15,
        jitterMs: 2,
        planDownloadMbps: 100,
      };

      const check = detectAnomaly(result);
      expect(check.isAnomaly).toBe(true);
    });

    it('should flag unrealistically low ping', () => {
      const result: SpeedTestResult = {
        downloadMbps: 50,
        uploadMbps: 10,
        pingMs: 0.1,
        jitterMs: 0.05,
      };

      const check = detectAnomaly(result);
      expect(check.isAnomaly).toBe(true);
    });

    it('should flag negative jitter', () => {
      const result: SpeedTestResult = {
        downloadMbps: 50,
        uploadMbps: 10,
        pingMs: 15,
        jitterMs: -2,
      };

      const check = detectAnomaly(result);
      expect(check.isAnomaly).toBe(true);
    });

    it('should detect unit mismatch (bytes > expected)', () => {
      const result: SpeedTestResult = {
        downloadMbps: 100,
        uploadMbps: 20,
        pingMs: 15,
        jitterMs: 2,
        raw_dl_bytes: 1_000_000_000, // 1GB in 30s is ~266 Mbps, but we're claiming 100
        duration_ms: 30000,
      };

      const check = detectAnomaly(result);
      expect(check.isAnomaly).toBe(true);
    });

    it('should cap display values at MAX_DISPLAY_MBPS', () => {
      const result: SpeedTestResult = {
        downloadMbps: 1500,
        uploadMbps: 300,
        pingMs: 15,
        jitterMs: 2,
      };

      const check = detectAnomaly(result);
      expect(check.displayDlMbps).toBeLessThanOrEqual(1000);
      expect(check.displayUlMbps).toBeLessThanOrEqual(1000);
    });
  });

  describe('sanitizeTestResult', () => {
    it('should accept valid results', () => {
      const result = sanitizeTestResult(95.5, 8.2, 12.3, 1.5);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject NaN download', () => {
      const result = sanitizeTestResult(NaN, 8.2, 12.3, 1.5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('downloadMbps');
    });

    it('should reject negative upload', () => {
      const result = sanitizeTestResult(95.5, -8.2, 12.3, 1.5);
      expect(result.valid).toBe(false);
    });

    it('should reject negative ping', () => {
      const result = sanitizeTestResult(95.5, 8.2, -12.3, 1.5);
      expect(result.valid).toBe(false);
    });

    it('should reject negative jitter', () => {
      const result = sanitizeTestResult(95.5, 8.2, 12.3, -1.5);
      expect(result.valid).toBe(false);
    });
  });

  describe('formatDisplayValues', () => {
    it('should format uncapped values', () => {
      const result = formatDisplayValues(95.5, 8.2, false);
      expect(result.displayDl).toBe('95.50');
      expect(result.displayUl).toBe('8.20');
      expect(result.cappedNote).toBeNull();
    });

    it('should cap and note capped values', () => {
      const result = formatDisplayValues(1500, 300, true);
      expect(result.displayDl).toBe('1000.00');
      expect(result.displayUl).toBe('300.00');
      expect(result.cappedNote).toContain('anomalous');
    });
  });
});

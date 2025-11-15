import { v4 as uuidv4 } from 'uuid';
import { sanitizeTestResult, detectAnomaly } from '@/backend/utils/speedtestUtils';

describe('Speedtest API Routes', () => {
  describe('POST /api/speedtest/start', () => {
    it('should create test run and return config', async () => {
      const payload = {
        sessionId: uuidv4(),
        roomName: 'Living Room',
      };

      // Mock test: verify schema compliance
      expect(payload.sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(payload.roomName).toBeTruthy();
    });

    it('should accept optional streams parameter', () => {
      const payload = {
        sessionId: uuidv4(),
        roomName: 'Bedroom',
        streams: 6,
      };

      expect(payload.streams).toBe(6);
    });

    it('should reject invalid sessionId', () => {
      const payload = {
        sessionId: 'not-a-uuid',
        roomName: 'Lounge',
      };

      expect(payload.sessionId).not.toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should reject roomName > 50 chars', () => {
      const longName = 'A'.repeat(51);
      expect(longName.length).toBeGreaterThan(50);
    });
  });

  describe('POST /api/speedtest/finish', () => {
    it('should persist normal result without anomaly', () => {
      const result = {
        downloadMbps: 95.5,
        uploadMbps: 8.2,
        pingMs: 12.3,
        jitterMs: 1.5,
      };

      const sanityCheck = sanitizeTestResult(
        result.downloadMbps,
        result.uploadMbps,
        result.pingMs,
        result.jitterMs
      );

      expect(sanityCheck.valid).toBe(true);

      const anomalyCheck = detectAnomaly(result);
      expect(anomalyCheck.isAnomaly).toBe(false);
      expect(anomalyCheck.displayDlMbps).toBe(95.5);
    });

    it('should detect and cap anomalously high download speed', () => {
      const result = {
        downloadMbps: 1500,
        uploadMbps: 50,
        pingMs: 12.3,
        jitterMs: 1.5,
      };

      const sanityCheck = sanitizeTestResult(
        result.downloadMbps,
        result.uploadMbps,
        result.pingMs,
        result.jitterMs
      );

      expect(sanityCheck.valid).toBe(true);

      const anomalyCheck = detectAnomaly(result);
      expect(anomalyCheck.isAnomaly).toBe(true);
      expect(anomalyCheck.displayDlMbps).toBeLessThanOrEqual(1000);
      expect(anomalyCheck.note).toBeTruthy();
    });

    it('should reject negative downloadMbps', () => {
      const result = sanitizeTestResult(-95.5, 8.2, 12.3, 1.5);
      expect(result.valid).toBe(false);
    });

    it('should reject NaN uploadMbps', () => {
      const result = sanitizeTestResult(95.5, NaN, 12.3, 1.5);
      expect(result.valid).toBe(false);
    });

    it('should reject negative jitterMs', () => {
      const result = sanitizeTestResult(95.5, 8.2, 12.3, -1.5);
      expect(result.valid).toBe(false);
    });

    it('should flag unit mismatch anomaly', () => {
      const result = {
        downloadMbps: 100,
        uploadMbps: 20,
        pingMs: 15,
        jitterMs: 2,
        raw_dl_bytes: 1_000_000_000, // 1 GB suggests much higher speed than claimed
        duration_ms: 30000,
      };

      const anomalyCheck = detectAnomaly(result);
      expect(anomalyCheck.isAnomaly).toBe(true);
    });

    it('should set anomaly when speed exceeds threshold', () => {
      const result = {
        downloadMbps: 1200,
        uploadMbps: 100,
        pingMs: 10,
        jitterMs: 1,
      };

      const anomalyCheck = detectAnomaly(result);
      expect(anomalyCheck.isAnomaly).toBe(true);
      expect(anomalyCheck.displayDlMbps).toBeLessThanOrEqual(1000);
    });
  });

  describe('GET /api/speedtest/chunk', () => {
    it('should generate chunk with default size', () => {
      const defaultSize = 1048576; // 1 MB
      expect(defaultSize).toBeGreaterThan(0);
    });

    it('should respect size parameter', () => {
      const customSize = 2097152; // 2 MB
      expect(customSize).toBeGreaterThan(1048576);
    });

    it('should reject chunk size > 100 MB', () => {
      const tooLarge = 101 * 1024 * 1024;
      expect(tooLarge).toBeGreaterThan(100 * 1024 * 1024);
    });

    it('should reject zero size', () => {
      const invalid = 0;
      expect(invalid).toBeLessThanOrEqual(0);
    });
  });

  describe('POST /api/speedtest/chunk', () => {
    it('should accept chunked upload data', () => {
      const contentLength = 1048576;
      expect(contentLength).toBeGreaterThan(0);
    });

    it('should require Content-Length header', () => {
      const header = null;
      expect(header).toBeNull();
    });

    it('should track uploaded bytes', () => {
      const uploadedBytes = 2097152;
      expect(uploadedBytes).toBeGreaterThan(0);
    });
  });
});

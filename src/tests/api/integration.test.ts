import { v4 as uuidv4 } from 'uuid';
import { queryAsync, runAsync, closeDb } from '../../db/client';
import { sessionSchema, setupSchema, speedTestSchema } from '../../lib/validation';

describe('API Integration Tests', () => {
  // Helper to verify database records exist
  const verifySessionExists = async (sessionId: string) => {
    const session = await queryAsync('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    return session.length > 0;
  };

  const verifySetupExists = async (sessionId: string) => {
    const setup = await queryAsync('SELECT * FROM setups WHERE session_id = ?', [sessionId]);
    return setup.length > 0;
  };

  const verifySpeedTestExists = async (sessionId: string) => {
    const test = await queryAsync('SELECT * FROM speed_tests WHERE session_id = ?', [sessionId]);
    return test.length > 0;
  };

  describe('Session Schema Validation', () => {
    it('should validate valid session data', () => {
      const validSession = {
        sessionId: uuidv4(),
        createdAt: Date.now(),
      };

      expect(() => sessionSchema.parse(validSession)).not.toThrow();
    });

    it('should reject non-UUID sessionId', () => {
      const invalidSession = {
        sessionId: 'not-a-uuid',
        createdAt: Date.now(),
      };

      expect(() => sessionSchema.parse(invalidSession)).toThrow();
    });

    it('should reject non-number createdAt', () => {
      const invalidSession = {
        sessionId: uuidv4(),
        createdAt: 'not-a-number',
      };

      expect(() => sessionSchema.parse(invalidSession)).toThrow();
    });
  });

  describe('Setup Schema Validation', () => {
    it('should validate correct setup data', () => {
      const validSetup = {
        sessionId: uuidv4(),
        isp: 'Spark',
        planDownloadMbps: 100,
        monthlyCostNzd: 89.99,
      };

      expect(() => setupSchema.parse(validSetup)).not.toThrow();
    });

    it('should trim and validate ISP', () => {
      const setupWithSpaces = {
        sessionId: uuidv4(),
        isp: '  Vodafone  ',
        planDownloadMbps: 100,
        monthlyCostNzd: 89.99,
      };

      expect(() => setupSchema.parse(setupWithSpaces)).not.toThrow();
    });

    it('should reject negative download speed', () => {
      const invalidSetup = {
        sessionId: uuidv4(),
        isp: 'Spark',
        planDownloadMbps: -100,
        monthlyCostNzd: 89.99,
      };

      expect(() => setupSchema.parse(invalidSetup)).toThrow();
    });

    it('should reject negative monthly cost', () => {
      const invalidSetup = {
        sessionId: uuidv4(),
        isp: 'Spark',
        planDownloadMbps: 100,
        monthlyCostNzd: -50,
      };

      expect(() => setupSchema.parse(invalidSetup)).toThrow();
    });

    it('should allow zero monthly cost (free plans)', () => {
      const validSetup = {
        sessionId: uuidv4(),
        isp: 'Community WiFi',
        planDownloadMbps: 10,
        monthlyCostNzd: 0,
      };

      expect(() => setupSchema.parse(validSetup)).not.toThrow();
    });
  });

  describe('Speed Test Schema Validation', () => {
    it('should validate correct speed test data', () => {
      const validTest = {
        sessionId: uuidv4(),
        roomName: 'Living Room',
        downloadMbps: 95.5,
        uploadMbps: 8.2,
        pingMs: 12.3,
        jitterMs: 1.5,
      };

      expect(() => speedTestSchema.parse(validTest)).not.toThrow();
    });

    it('should reject negative speeds', () => {
      const invalidTest = {
        sessionId: uuidv4(),
        roomName: 'Living Room',
        downloadMbps: -95.5,
        uploadMbps: 8.2,
        pingMs: 12.3,
        jitterMs: 1.5,
      };

      expect(() => speedTestSchema.parse(invalidTest)).toThrow();
    });

    it('should allow zero speeds (no connection)', () => {
      const validTest = {
        sessionId: uuidv4(),
        roomName: 'Basement',
        downloadMbps: 0,
        uploadMbps: 0,
        pingMs: 0,
        jitterMs: 0,
      };

      expect(() => speedTestSchema.parse(validTest)).not.toThrow();
    });

    it('should reject invalid room names', () => {
      const invalidTest = {
        sessionId: uuidv4(),
        roomName: '', // Empty room name
        downloadMbps: 95.5,
        uploadMbps: 8.2,
        pingMs: 12.3,
        jitterMs: 1.5,
      };

      expect(() => speedTestSchema.parse(invalidTest)).toThrow();
    });

    it('should reject room names exceeding max length', () => {
      const invalidTest = {
        sessionId: uuidv4(),
        roomName: 'A'.repeat(51), // Exceeds 50 char limit
        downloadMbps: 95.5,
        uploadMbps: 8.2,
        pingMs: 12.3,
        jitterMs: 1.5,
      };

      expect(() => speedTestSchema.parse(invalidTest)).toThrow();
    });
  });

  describe('Database Operations', () => {
    it('should insert and retrieve a session', async () => {
      const sessionId = uuidv4();
      const createdAt = Date.now();

      await runAsync('INSERT INTO sessions (id, created_at) VALUES (?, ?)', [
        sessionId,
        createdAt,
      ]);

      const exists = await verifySessionExists(sessionId);
      expect(exists).toBe(true);
    });

    it('should insert and retrieve setup data', async () => {
      const sessionId = uuidv4();
      const setupId = uuidv4();

      // Create session first
      await runAsync('INSERT INTO sessions (id, created_at) VALUES (?, ?)', [
        sessionId,
        Date.now(),
      ]);

      // Insert setup
      await runAsync(
        `INSERT INTO setups (id, session_id, isp, plan_download_mbps, monthly_cost_nzd, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [setupId, sessionId, 'Spark', 100, 89.99, Date.now()]
      );

      const exists = await verifySetupExists(sessionId);
      expect(exists).toBe(true);
    });

    it('should enforce foreign key constraint on setup', async () => {
      const nonExistentSessionId = uuidv4();
      const setupId = uuidv4();

      // Try to insert setup with non-existent session (should fail with foreign key constraint)
      await expect(
        runAsync(
          `INSERT INTO setups (id, session_id, isp, plan_download_mbps, monthly_cost_nzd, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [setupId, nonExistentSessionId, 'Spark', 100, 89.99, Date.now()]
        )
      ).rejects.toThrow();
    });

    it('should retrieve aggregated speed test data', async () => {
      const sessionId = uuidv4();

      // Create session
      await runAsync('INSERT INTO sessions (id, created_at) VALUES (?, ?)', [
        sessionId,
        Date.now(),
      ]);

      // Insert multiple speed tests
      for (let i = 0; i < 3; i++) {
        await runAsync(
          `INSERT INTO speed_tests (id, session_id, room_name, download_mbps, upload_mbps, ping_ms, jitter_ms, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            sessionId,
            `Room ${i + 1}`,
            90 + i * 5,
            8 + i,
            12 + i,
            1.5 + i * 0.2,
            Date.now(),
          ]
        );
      }

      // Query all tests
      const tests = await queryAsync(
        'SELECT * FROM speed_tests WHERE session_id = ?',
        [sessionId]
      );

      expect(tests.length).toBe(3);
      expect(tests[0]).toHaveProperty('room_name');
      expect(tests[0]).toHaveProperty('download_mbps');
    });
  });
});

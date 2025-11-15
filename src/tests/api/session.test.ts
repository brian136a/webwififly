import { v4 as uuidv4 } from 'uuid';
import { sessionSchema } from '../../lib/validation';

// Mock test for schema validation
describe('Session API Schema', () => {
  it('should validate session response with UUID', () => {
    const testData = {
      sessionId: uuidv4(),
      createdAt: Date.now(),
    };

    expect(() => sessionSchema.parse(testData)).not.toThrow();
    expect(testData.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should reject invalid session data', () => {
    const invalidData = {
      sessionId: 'not-a-uuid',
      createdAt: 'invalid',
    };

    expect(() => sessionSchema.parse(invalidData)).toThrow();
  });
});

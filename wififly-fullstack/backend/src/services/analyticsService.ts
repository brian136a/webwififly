import fs from 'fs';
import path from 'path';

const logsDir = process.env.LOGS_DIR || './backend/logs';
const analyticsFile = path.join(logsDir, 'analytics.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function logAnalytics(sessionId: string, eventName: string, payload?: any) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      sessionId,
      eventName,
      payload: payload || {},
    };

    fs.appendFileSync(analyticsFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to log analytics to file:', error);
  }
}

export function getAnalyticsLog(): string[] {
  try {
    if (!fs.existsSync(analyticsFile)) {
      return [];
    }
    const content = fs.readFileSync(analyticsFile, 'utf-8');
    return content.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Failed to read analytics log:', error);
    return [];
  }
}

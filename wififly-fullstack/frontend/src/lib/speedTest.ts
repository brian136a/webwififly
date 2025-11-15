import { api } from './api';

export interface SpeedTestResult {
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
}

export async function runSpeedTest(roomName: string): Promise<SpeedTestResult> {
  try {
    // Ping (average of 3 measurements)
    const pings: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      await api.tests.ping();
      const end = performance.now();
      pings.push(end - start);
    }

    const ping = pings.reduce((a, b) => a + b) / pings.length;
    const jitter = Math.max(...pings) - Math.min(...pings);

    // Download (1MB file)
    const dlStart = performance.now();
    const dlResponse = await api.tests.download(1048576);
    const dlEnd = performance.now();

    const dlBlob = new Blob([dlResponse.data]);
    const dlSeconds = (dlEnd - dlStart) / 1000;
    const dlMbps = (dlBlob.size * 8) / (dlSeconds * 1000000);

    // Upload (1MB file)
    const uploadBuffer = new ArrayBuffer(1048576);
    const ulStart = performance.now();
    await api.tests.upload(uploadBuffer);
    const ulEnd = performance.now();

    const ulSeconds = (ulEnd - ulStart) / 1000;
    const ulMbps = (uploadBuffer.byteLength * 8) / (ulSeconds * 1000000);

    return {
      dl: Math.round(dlMbps * 100) / 100,
      ul: Math.round(ulMbps * 100) / 100,
      ping: Math.round(ping * 100) / 100,
      jitter: Math.round(jitter * 100) / 100,
    };
  } catch (error) {
    console.error('Speed test error:', error);
    throw error;
  }
}

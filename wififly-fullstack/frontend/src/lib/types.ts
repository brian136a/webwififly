export interface User {
  id?: number;
  sessionId: string;
  name?: string;
  email?: string;
  isp?: string;
  planSpeed?: number;
  monthlyCost?: number;
  modemRoom?: string;
  homeType?: string;
  modemModel?: string;
}

export interface SpeedTest {
  id?: number;
  sessionId: string;
  roomName: string;
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
  anomaly?: boolean;
}

export interface Submission {
  sessionId: string;
  userId?: number;
  name: string;
  email: string;
  modemModel?: string;
  homeType?: string;
  notes?: string;
  photo?: File;
}

export interface Config {
  anomalySpeedThreshold: number;
  backendUrl: string;
  environment: string;
}

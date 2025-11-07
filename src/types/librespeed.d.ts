// src/types/librespeed.d.ts

export interface LibreSpeedServer {
  server: string;
  name: string;
  dist: number;
  // Add other server properties if they exist
}

export interface LibreSpeedTestPoint {
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
  // Add other test point properties if they exist
}

export interface LibreSpeedData {
  testState: number; // -1=not started, 0=starting, 1=download, 2=ping+jitter, 3=upload, 4=finished, 5=aborted
  dlStatus: string;
  ulStatus: string;
  pingStatus: string;
  jitterStatus: string;
  dlProgress: number;
  ulProgress: number;
  pingProgress: number;
  clientIp: string;
}

export interface LibreSpeedState {
  status: 'idle' | 'starting' | 'testing' | 'success' | 'error';
  progress: number;
  dlStatus: string;
  ulStatus: string;
  pingStatus: string;
  jitterStatus: string;
  // Add other state properties if they exist
}

export interface RoomTestResult {
  room: string;
  result: LibreSpeedTestPoint;
  timestamp: number;
}

export interface LibreSpeedHandlers {
  onStateChange: (state: LibreSpeedState) => void;
  onTestPoint: (testPoint: LibreSpeedTestPoint) => void;
  onServerSelected: (server: LibreSpeedServer) => void;
  onFinish: (result: LibreSpeedTestPoint) => void;
  onError: (error: { message: string }) => void;
}

import axios, { AxiosInstance } from 'axios';
import { getOrCreateSessionId } from './session';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add session to every request
apiClient.interceptors.request.use((config) => {
  const sessionId = getOrCreateSessionId();
  config.headers['X-Session-Id'] = sessionId;
  return config;
});

export const api = {
  session: {
    start: (sessionId?: string) =>
      apiClient.post('/api/session/start', { sessionId }),
    get: (id: string) =>
      apiClient.get(`/api/session/${id}`),
  },
  tests: {
    result: (data: any) =>
      apiClient.post('/api/tests/result', data),
    download: (size: number) =>
      apiClient.get(`/test/download?size=${size}`, {
        responseType: 'arraybuffer',
      }),
    upload: (data: ArrayBuffer) =>
      apiClient.post('/test/upload', data, {
        headers: { 'Content-Type': 'application/octet-stream' },
      }),
    ping: () =>
      apiClient.get('/test/ping'),
  },
  users: {
    create: (data: any) =>
      apiClient.post('/api/users', data),
  },
  submissions: {
    create: (data: FormData) =>
      apiClient.post('/api/submissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  },
  analytics: {
    log: (eventName: string, payload?: any) =>
      apiClient.post('/api/analytics', { 
        sessionId: getOrCreateSessionId(),
        eventName, 
        payload 
      }),
  },
  config: {
    get: () =>
      apiClient.get('/api/config'),
  },
};

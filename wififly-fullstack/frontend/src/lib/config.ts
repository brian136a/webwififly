import { api } from './api';
import type { Config } from './types';

let config: Config | null = null;

export async function getConfig(): Promise<Config> {
  if (!config) {
    try {
      const response = await api.config.get();
      config = response.data;
    } catch (error) {
      console.error('Failed to fetch config:', error);
      config = {
        anomalySpeedThreshold: 1000,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
        environment: 'development',
      };
    }
  }
  return config;
}

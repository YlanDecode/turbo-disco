import { apiClient, publicClient } from '../client';
import type { HealthResponse, WebSocketStatus } from '../types';

// GET /ping - Health ping simple
export const ping = async (): Promise<{ status: string }> => {
  const response = await publicClient.get('/ping');
  return response.data;
};

// GET /system/health - Health check complet (DB, Redis, Ollama)
export const getSystemHealth = async (): Promise<HealthResponse> => {
  const response = await publicClient.get<HealthResponse>('/system/health');
  return response.data;
};

// GET /system/ping - Uptime check
export const systemPing = async (): Promise<{ status: string; uptime: number }> => {
  const response = await publicClient.get('/system/ping');
  return response.data;
};

// GET /ws/status - Status serveur WebSocket
export const getWebSocketStatus = async (): Promise<WebSocketStatus> => {
  const response = await apiClient.get<WebSocketStatus>('/ws/status');
  return response.data;
};

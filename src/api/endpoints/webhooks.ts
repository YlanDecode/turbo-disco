import { apiClient } from '../client';
import type {
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDeliveryListResponse,
  TestWebhookRequest,
  WebhookDelivery,
} from '../types';

// GET /{project_id}/webhooks - Liste des webhooks
export const listWebhooks = async (projectId: string): Promise<Webhook[]> => {
  const response = await apiClient.get<Webhook[]>(`/${projectId}/webhooks`);
  return response.data;
};

// POST /{project_id}/webhooks - Créer un webhook
export const createWebhook = async (
  projectId: string,
  data: CreateWebhookRequest
): Promise<Webhook> => {
  const response = await apiClient.post<Webhook>(`/${projectId}/webhooks`, data);
  return response.data;
};

// GET /{project_id}/webhooks/{webhook_id} - Détails d'un webhook
export const getWebhook = async (projectId: string, webhookId: string): Promise<Webhook> => {
  const response = await apiClient.get<Webhook>(
    `/${projectId}/webhooks/${webhookId}`
  );
  return response.data;
};

// POST /{project_id}/webhooks/{webhook_id}/update - Modifier un webhook
export const updateWebhook = async (
  projectId: string,
  webhookId: string,
  data: UpdateWebhookRequest
): Promise<Webhook> => {
  const response = await apiClient.post<Webhook>(
    `/${projectId}/webhooks/${webhookId}/update`,
    data
  );
  return response.data;
};

// DELETE /{project_id}/webhooks/{webhook_id} - Supprimer un webhook
export const deleteWebhook = async (projectId: string, webhookId: string): Promise<void> => {
  await apiClient.delete(`/${projectId}/webhooks/${webhookId}`);
};

// GET /{project_id}/webhooks/{webhook_id}/deliveries - Historique des livraisons
export const getWebhookDeliveries = async (
  projectId: string,
  webhookId: string,
  params?: { limit?: number; offset?: number }
): Promise<WebhookDeliveryListResponse> => {
  const response = await apiClient.get<WebhookDeliveryListResponse>(
    `/${projectId}/webhooks/${webhookId}/deliveries`,
    { params }
  );
  return response.data;
};

// POST /{project_id}/webhooks/{webhook_id}/test - Tester un webhook
export const testWebhook = async (
  projectId: string,
  webhookId: string,
  data?: TestWebhookRequest
): Promise<WebhookDelivery> => {
  const response = await apiClient.post<WebhookDelivery>(
    `/${projectId}/webhooks/${webhookId}/test`,
    data || {}
  );
  return response.data;
};

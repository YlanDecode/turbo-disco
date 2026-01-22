import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  WebhookDeliveryListResponse,
  TestWebhookRequest,
} from '../types';
import {
  listWebhooks,
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookDeliveries,
  testWebhook,
} from '../endpoints/webhooks';
import { getActiveProject } from '../client';

// Liste des webhooks d'un projet
export const useWebhooks = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<Webhook[]>({
    queryKey: ['webhooks', activeProjectId],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return listWebhooks(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

// Détails d'un webhook
export const useWebhook = (webhookId: string, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<Webhook>({
    queryKey: ['webhooks', activeProjectId, webhookId],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getWebhook(activeProjectId, webhookId);
    },
    enabled: !!activeProjectId && !!webhookId,
  });
};

// Créer un webhook
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation<Webhook, Error, { projectId?: string; data: CreateWebhookRequest }>({
    mutationFn: ({ projectId, data }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return createWebhook(activeProjectId, data);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['webhooks', activeProjectId] });
    },
  });
};

// Modifier un webhook
export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Webhook,
    Error,
    { projectId?: string; webhookId: string; data: UpdateWebhookRequest }
  >({
    mutationFn: ({ projectId, webhookId, data }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return updateWebhook(activeProjectId, webhookId, data);
    },
    onSuccess: (_, { projectId, webhookId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['webhooks', activeProjectId] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', activeProjectId, webhookId] });
    },
  });
};

// Supprimer un webhook
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { projectId?: string; webhookId: string }>({
    mutationFn: ({ projectId, webhookId }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteWebhook(activeProjectId, webhookId);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['webhooks', activeProjectId] });
    },
  });
};

// Historique des livraisons
export const useWebhookDeliveries = (
  webhookId: string,
  params?: { limit?: number; offset?: number },
  projectId?: string
) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<WebhookDeliveryListResponse>({
    queryKey: ['webhooks', activeProjectId, webhookId, 'deliveries', params],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getWebhookDeliveries(activeProjectId, webhookId, params);
    },
    enabled: !!activeProjectId && !!webhookId,
  });
};

// Tester un webhook
export const useTestWebhook = () => {
  return useMutation<
    WebhookDelivery,
    Error,
    { projectId?: string; webhookId: string; data: TestWebhookRequest }
  >({
    mutationFn: ({ projectId, webhookId, data }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return testWebhook(activeProjectId, webhookId, data);
    },
  });
};

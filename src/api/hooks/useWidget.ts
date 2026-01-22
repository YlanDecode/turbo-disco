import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  WidgetConfig,
  UpdateWidgetRequest,
  WidgetAvatarResponse,
  WidgetPreview,
  IntegrationCode,
} from '../types';
import {
  getWidgetConfig,
  updateWidgetConfig,
  resetWidgetConfig,
  uploadWidgetAvatar,
  deleteWidgetAvatar,
  getWidgetPreview,
  getIntegrationCode,
} from '../endpoints/widget';
import { getActiveProject } from '../client';

// Configuration du widget
export const useWidgetConfig = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<WidgetConfig>({
    queryKey: ['widget', activeProjectId],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getWidgetConfig(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

// Mettre à jour la configuration
export const useUpdateWidgetConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<WidgetConfig, Error, { projectId?: string; data: UpdateWidgetRequest }>({
    mutationFn: ({ projectId, data }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return updateWidgetConfig(activeProjectId, data);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['widget', activeProjectId] });
    },
  });
};

// Réinitialiser la configuration
export const useResetWidgetConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { projectId?: string }>({
    mutationFn: ({ projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return resetWidgetConfig(activeProjectId);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['widget', activeProjectId] });
    },
  });
};

// Upload d'avatar
export const useUploadWidgetAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<WidgetAvatarResponse, Error, { projectId?: string; file: File }>({
    mutationFn: ({ projectId, file }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return uploadWidgetAvatar(activeProjectId, file);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['widget', activeProjectId] });
    },
  });
};

// Supprimer l'avatar
export const useDeleteWidgetAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { projectId?: string }>({
    mutationFn: ({ projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteWidgetAvatar(activeProjectId);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['widget', activeProjectId] });
    },
  });
};

// Prévisualisation du widget
export const useWidgetPreview = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<WidgetPreview>({
    queryKey: ['widget', activeProjectId, 'preview'],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getWidgetPreview(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

// Code d'intégration
export const useIntegrationCode = (apiKey?: string, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<IntegrationCode>({
    queryKey: ['widget', activeProjectId, 'integration-code', apiKey],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getIntegrationCode(activeProjectId, apiKey);
    },
    enabled: !!activeProjectId,
  });
};

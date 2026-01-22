import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  APIKey,
  APIKeyWithSecret,
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  RotatedAPIKeyResponse,
  APIKeyUsage,
} from '../types';
import {
  listAPIKeys,
  createAPIKey,
  getAPIKey,
  updateAPIKey,
  rotateAPIKey,
  deleteAPIKey,
  getAPIKeyUsage,
} from '../endpoints/apiKeys';
import { getActiveProject } from '../client';

// Liste des clés API d'un projet
export const useAPIKeys = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<APIKey[]>({
    queryKey: ['api-keys', activeProjectId],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return listAPIKeys(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

// Détails d'une clé API
export const useAPIKey = (keyId: string, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<APIKey>({
    queryKey: ['api-keys', activeProjectId, keyId],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getAPIKey(activeProjectId, keyId);
    },
    enabled: !!activeProjectId && !!keyId,
  });
};

// Créer une clé API
export const useCreateAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation<
    APIKeyWithSecret,
    Error,
    { projectId?: string; data: CreateAPIKeyRequest }
  >({
    mutationFn: ({ projectId, data }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return createAPIKey(activeProjectId, data);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['api-keys', activeProjectId] });
    },
  });
};

// Modifier une clé API
export const useUpdateAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation<
    APIKey,
    Error,
    { projectId?: string; keyId: string; data: UpdateAPIKeyRequest }
  >({
    mutationFn: ({ projectId, keyId, data }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return updateAPIKey(activeProjectId, keyId, data);
    },
    onSuccess: (_, { projectId, keyId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['api-keys', activeProjectId] });
      queryClient.invalidateQueries({ queryKey: ['api-keys', activeProjectId, keyId] });
    },
  });
};

// Régénérer une clé API
export const useRotateAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation<RotatedAPIKeyResponse, Error, { projectId?: string; keyId: string }>({
    mutationFn: ({ projectId, keyId }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return rotateAPIKey(activeProjectId, keyId);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['api-keys', activeProjectId] });
    },
  });
};

// Supprimer une clé API
export const useDeleteAPIKey = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { projectId?: string; keyId: string }>({
    mutationFn: ({ projectId, keyId }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteAPIKey(activeProjectId, keyId);
    },
    onSuccess: (_, { projectId }) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['api-keys', activeProjectId] });
    },
  });
};

// Statistiques d'utilisation d'une clé
export const useAPIKeyUsage = (keyId: string, days?: number, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<APIKeyUsage>({
    queryKey: ['api-keys', activeProjectId, keyId, 'usage', days],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getAPIKeyUsage(activeProjectId, keyId, days);
    },
    enabled: !!activeProjectId && !!keyId,
  });
};

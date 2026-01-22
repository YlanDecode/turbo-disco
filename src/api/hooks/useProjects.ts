import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectResponse,
  ProjectListResponse,
  RevealKeyResponse,
  RotateKeyResponse,
  RevokeKeyResponse,
  RegenerateKeyResponse,
} from '../types';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  revealProjectApiKey,
  rotateProjectApiKey,
  revokeProjectApiKey,
  regenerateProjectApiKey,
} from '../endpoints/projects';

// Lister les projets
export const useProjects = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery<ProjectListResponse>({
    queryKey: ['projects', params],
    queryFn: () => listProjects(params),
  });
};

// Obtenir un projet
export const useProject = (projectId: string) => {
  return useQuery<ProjectResponse>({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });
};

// Créer un projet
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Mettre à jour un projet
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
      updateProject(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

// Supprimer un projet
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// ==================== API Key Management Hooks ====================

// Reveal API key (show full key)
export const useRevealApiKey = () => {
  return useMutation<RevealKeyResponse, Error, string>({
    mutationFn: (projectId: string) => revealProjectApiKey(projectId),
  });
};

// Rotate API key (24h grace period)
export const useRotateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<RotateKeyResponse, Error, string>({
    mutationFn: (projectId: string) => rotateProjectApiKey(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

// Revoke API key (disable project)
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<RevokeKeyResponse, Error, string>({
    mutationFn: (projectId: string) => revokeProjectApiKey(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

// Regenerate API key (immediate new key)
export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<RegenerateKeyResponse, Error, string>({
    mutationFn: (projectId: string) => regenerateProjectApiKey(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

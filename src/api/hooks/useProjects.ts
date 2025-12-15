import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectResponse,
  ProjectListResponse,
} from '../types';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  rotateProjectApiKey,
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

// Rotation de clé API
export const useRotateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => rotateProjectApiKey(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

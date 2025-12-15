import { apiClient, publicClient } from '../client';
import type {
  ProjectResponse,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  RotateKeyResponse,
} from '../types';

// Créer un projet
export const createProject = async (data: CreateProjectRequest): Promise<ProjectResponse> => {
  const response = await publicClient.post<ProjectResponse>('/projects', data);
  return response.data;
};

// Lister les projets
export const listProjects = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}): Promise<ProjectListResponse> => {
  const response = await publicClient.get<ProjectListResponse>('/projects', { params });
  return response.data;
};

// Obtenir un projet
export const getProject = async (projectId: string): Promise<ProjectResponse> => {
  const response = await publicClient.get<ProjectResponse>(`/projects/${projectId}`);
  return response.data;
};

// Mettre à jour un projet
export const updateProject = async (
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectResponse> => {
  const response = await apiClient.put<ProjectResponse>(`/projects/${projectId}`, data);
  return response.data;
};

// Supprimer un projet
export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};

// Rotation de clé API
export const rotateProjectApiKey = async (projectId: string): Promise<RotateKeyResponse> => {
  const response = await apiClient.post<RotateKeyResponse>(
    `/projects/${projectId}/rotate-key`
  );
  return response.data;
};

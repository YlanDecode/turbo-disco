import { apiClient } from '../client';
import type {
  ProjectResponse,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  RotateKeyResponse,
  RevealKeyResponse,
  RevokeKeyResponse,
  RegenerateKeyResponse,
} from '../types';

// Créer un projet (auth requise)
export const createProject = async (data: CreateProjectRequest): Promise<ProjectResponse> => {
  const response = await apiClient.post<ProjectResponse>('/projects', data);
  return response.data;
};

// Lister les projets (auth requise)
export const listProjects = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}): Promise<ProjectListResponse> => {
  const response = await apiClient.get<ProjectListResponse>('/projects', { params });
  return response.data;
};

// Obtenir un projet (auth requise)
export const getProject = async (projectId: string): Promise<ProjectResponse> => {
  const response = await apiClient.get<ProjectResponse>(`/projects/${projectId}`);
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

// ==================== API Key Management ====================

// POST /projects/{project_id}/reveal-key - Affiche la clé API complète (auth requise)
export const revealProjectApiKey = async (projectId: string): Promise<RevealKeyResponse> => {
  const response = await apiClient.post<RevealKeyResponse>(
    `/projects/${projectId}/reveal-key`
  );
  return response.data;
};

// POST /projects/{project_id}/rotate-key - Rotation de clé API (24h de grâce)
export const rotateProjectApiKey = async (projectId: string): Promise<RotateKeyResponse> => {
  const response = await apiClient.post<RotateKeyResponse>(
    `/projects/${projectId}/rotate-key`
  );
  return response.data;
};

// POST /projects/{project_id}/revoke-key - Révoque la clé (désactive le projet)
export const revokeProjectApiKey = async (projectId: string): Promise<RevokeKeyResponse> => {
  const response = await apiClient.post<RevokeKeyResponse>(
    `/projects/${projectId}/revoke-key`
  );
  return response.data;
};

// POST /projects/{project_id}/regenerate-key - Régénère une nouvelle clé immédiatement
export const regenerateProjectApiKey = async (projectId: string): Promise<RegenerateKeyResponse> => {
  const response = await apiClient.post<RegenerateKeyResponse>(
    `/projects/${projectId}/regenerate-key`
  );
  return response.data;
};

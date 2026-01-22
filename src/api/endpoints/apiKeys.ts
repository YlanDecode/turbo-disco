import { apiClient } from '../client';
import type {
  APIKey,
  APIKeyWithSecret,
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  RotatedAPIKeyResponse,
  APIKeyUsage,
} from '../types';

// GET /projects/{project_id}/api-keys - Liste des clés API
export const listAPIKeys = async (projectId: string): Promise<APIKey[]> => {
  const response = await apiClient.get<APIKey[]>(`/projects/${projectId}/api-keys`);
  return response.data;
};

// POST /projects/{project_id}/api-keys - Créer une clé API
export const createAPIKey = async (
  projectId: string,
  data: CreateAPIKeyRequest
): Promise<APIKeyWithSecret> => {
  const response = await apiClient.post<APIKeyWithSecret>(
    `/projects/${projectId}/api-keys`,
    data
  );
  return response.data;
};

// GET /projects/{project_id}/api-keys/{key_id} - Détails d'une clé
export const getAPIKey = async (projectId: string, keyId: string): Promise<APIKey> => {
  const response = await apiClient.get<APIKey>(`/projects/${projectId}/api-keys/${keyId}`);
  return response.data;
};

// PUT /projects/{project_id}/api-keys/{key_id} - Modifier une clé
export const updateAPIKey = async (
  projectId: string,
  keyId: string,
  data: UpdateAPIKeyRequest
): Promise<APIKey> => {
  const response = await apiClient.put<APIKey>(
    `/projects/${projectId}/api-keys/${keyId}`,
    data
  );
  return response.data;
};

// POST /projects/{project_id}/api-keys/{key_id}/rotate - Régénérer une clé
export const rotateAPIKey = async (
  projectId: string,
  keyId: string
): Promise<RotatedAPIKeyResponse> => {
  const response = await apiClient.post<RotatedAPIKeyResponse>(
    `/projects/${projectId}/api-keys/${keyId}/rotate`
  );
  return response.data;
};

// DELETE /projects/{project_id}/api-keys/{key_id} - Révoquer une clé
export const deleteAPIKey = async (projectId: string, keyId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/api-keys/${keyId}`);
};

// GET /projects/{project_id}/api-keys/{key_id}/usage - Stats d'utilisation
export const getAPIKeyUsage = async (
  projectId: string,
  keyId: string,
  days?: number
): Promise<APIKeyUsage> => {
  const response = await apiClient.get<APIKeyUsage>(
    `/projects/${projectId}/api-keys/${keyId}/usage`,
    { params: { days } }
  );
  return response.data;
};

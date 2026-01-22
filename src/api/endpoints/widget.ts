import { apiClient } from '../client';
import type {
  WidgetConfig,
  UpdateWidgetRequest,
  WidgetAvatarResponse,
  WidgetPreview,
  IntegrationCode,
} from '../types';

// GET /projects/{project_id}/widget - Configuration du widget
export const getWidgetConfig = async (projectId: string): Promise<WidgetConfig> => {
  const response = await apiClient.get<WidgetConfig>(`/projects/${projectId}/widget`);
  return response.data;
};

// PUT /projects/{project_id}/widget - Mettre à jour la configuration
export const updateWidgetConfig = async (
  projectId: string,
  data: UpdateWidgetRequest
): Promise<WidgetConfig> => {
  const response = await apiClient.put<WidgetConfig>(`/projects/${projectId}/widget`, data);
  return response.data;
};

// DELETE /projects/{project_id}/widget - Réinitialiser la configuration
export const resetWidgetConfig = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/widget`);
};

// POST /projects/{project_id}/widget/avatar - Upload d'avatar
export const uploadWidgetAvatar = async (
  projectId: string,
  file: File
): Promise<WidgetAvatarResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<WidgetAvatarResponse>(
    `/projects/${projectId}/widget/avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// DELETE /projects/{project_id}/widget/avatar - Supprimer l'avatar
export const deleteWidgetAvatar = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/widget/avatar`);
};

// GET /projects/{project_id}/widget/preview - Prévisualisation
export const getWidgetPreview = async (projectId: string): Promise<WidgetPreview> => {
  const response = await apiClient.get<WidgetPreview>(`/projects/${projectId}/widget/preview`);
  return response.data;
};

// GET /projects/{project_id}/integration-code - Code d'intégration
export const getIntegrationCode = async (
  projectId: string,
  apiKey?: string
): Promise<IntegrationCode> => {
  const response = await apiClient.get<IntegrationCode>(
    `/projects/${projectId}/integration-code`,
    { params: { api_key: apiKey } }
  );
  return response.data;
};

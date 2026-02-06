import { apiClient } from '../client';
import type {
  RAGFile,
  RAGFileListResponse,
} from '../types';

// ==================== Project-scoped RAG ====================

// GET /projects/{project_id}/rag/files - Liste des fichiers RAG du projet
export const listProjectFiles = async (projectId: string): Promise<RAGFileListResponse> => {
  const response = await apiClient.get<RAGFileListResponse>(`/projects/${projectId}/rag/files`);
  return response.data;
};

// POST /projects/{project_id}/rag/files - Upload d'un fichier pour le RAG
export const uploadProjectFile = async (
  projectId: string,
  file: File
): Promise<RAGFile> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<RAGFile>(`/projects/${projectId}/rag/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// GET /projects/{project_id}/rag/files/{filename} - Télécharger un fichier RAG
export const downloadProjectFile = async (projectId: string, filename: string): Promise<void> => {
  const response = await apiClient.get(`/projects/${projectId}/rag/files/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  });

  // Créer un lien de téléchargement et le déclencher
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// DELETE /projects/{project_id}/rag/files/{filename} - Supprimer un fichier RAG
export const deleteProjectFile = async (projectId: string, filename: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/rag/files/${encodeURIComponent(filename)}`);
};

// DELETE /projects/{project_id}/rag/files - Supprimer tous les fichiers RAG
export const deleteAllProjectFiles = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/rag/files`);
};

// POST /projects/{project_id}/rag/rebuild - Reconstruire l'index du projet
export const rebuildProjectIndex = async (projectId: string): Promise<{
  status: string;
  message: string;
}> => {
  const response = await apiClient.post(`/projects/${projectId}/rag/rebuild`);
  return response.data;
};

export const reindexProject = rebuildProjectIndex;

import { apiClient } from '../client';
import type {
  RAGDebugResponse,
  IngestBody,
  RebuildBody,
  IngestDirBody,
  FileListResponse,
  RAGFile,
  RAGFileListResponse,
} from '../types';

// ==================== Global RAG (if needed) ====================

// Debug RAG (global)
export const debugRAG = async (): Promise<RAGDebugResponse> => {
  const response = await apiClient.get<RAGDebugResponse>('/rag/debug');
  return response.data;
};

// Ingérer des documents textuels (global)
export const ingestDocuments = async (data: IngestBody): Promise<{
  status: string;
  added: number;
  total_docs: number;
}> => {
  const response = await apiClient.post('/rag/ingest', data);
  return response.data;
};

// Reconstruire les indexes (global)
export const rebuildIndexes = async (data?: RebuildBody): Promise<{
  status: string;
  doc_count: number;
  faiss_reset: boolean;
}> => {
  const response = await apiClient.post('/rag/rebuild', data || {});
  return response.data;
};

// Supprimer un contexte (global)
export const deleteContext = async (contextName: string): Promise<{
  status: string;
  removed: number;
  remaining: number;
}> => {
  const response = await apiClient.delete(`/rag/context/${contextName}`);
  return response.data;
};

// Supprimer tous les contextes (global)
export const deleteAllContexts = async (): Promise<{
  status: string;
  message: string;
  remaining: number;
}> => {
  const response = await apiClient.delete('/rag/contexts');
  return response.data;
};

// Upload de fichier (global)
export const uploadFile = async (file: File): Promise<{ status: string; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/rag/ingest_file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Lister les fichiers (global)
export const listFiles = async (): Promise<FileListResponse> => {
  const response = await apiClient.get<FileListResponse>('/rag/files');
  return response.data;
};

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

// DELETE /projects/{project_id}/rag/files/{file_id} - Supprimer un fichier RAG
export const deleteProjectFile = async (projectId: string, fileId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/rag/files/${fileId}`);
};

// POST /projects/{project_id}/rag/reindex - Réindexer les documents du projet
export const reindexProject = async (projectId: string): Promise<{
  status: string;
  message: string;
}> => {
  const response = await apiClient.post(`/projects/${projectId}/rag/reindex`);
  return response.data;
};

// ==================== Legacy Project RAG (backward compatibility) ====================

// Debug RAG (projet)
export const debugProjectRAG = async (projectId: string): Promise<RAGDebugResponse> => {
  const response = await apiClient.get<RAGDebugResponse>(`/projects/${projectId}/rag/debug`);
  return response.data;
};

// Ingérer des documents (projet)
export const ingestProjectDocuments = async (
  projectId: string,
  data: IngestBody
): Promise<{ status: string; added: number; total_docs: number }> => {
  const response = await apiClient.post(`/projects/${projectId}/rag/ingest`, data);
  return response.data;
};

// Reconstruire les indexes (projet) - legacy, use reindexProject instead
export const rebuildProjectIndexes = async (
  projectId: string,
  data?: RebuildBody
): Promise<{
  status: string;
  docs: number;
  tfidf: boolean;
  faiss: boolean;
  use_langchain: boolean;
}> => {
  const response = await apiClient.post(`/projects/${projectId}/rag/rebuild`, data || {});
  return response.data;
};

// Supprimer un contexte (projet)
export const deleteProjectContext = async (
  projectId: string,
  contextName: string
): Promise<{ status: string; removed: number; remaining: number }> => {
  const response = await apiClient.delete(`/projects/${projectId}/rag/context/${contextName}`);
  return response.data;
};

// Supprimer tous les contextes (projet)
export const deleteAllProjectContexts = async (projectId: string): Promise<{
  status: string;
  message: string;
}> => {
  const response = await apiClient.delete(`/projects/${projectId}/rag/contexts`);
  return response.data;
};

// Ingérer un répertoire (projet)
export const ingestProjectDirectory = async (
  projectId: string,
  data: IngestDirBody
): Promise<{ status: string; found: number; ingested: number }> => {
  const response = await apiClient.post(`/projects/${projectId}/rag/ingest_dir`, data);
  return response.data;
};

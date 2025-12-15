import { apiClient } from '../client';
import type {
  RAGDebugResponse,
  IngestBody,
  RebuildBody,
  IngestDirBody,
  FileListResponse,
} from '../types';

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

// === Endpoints par projet ===

// Debug RAG (projet)
export const debugProjectRAG = async (projectId: string): Promise<RAGDebugResponse> => {
  const response = await apiClient.get<RAGDebugResponse>(`/${projectId}/rag/debug`);
  return response.data;
};

// Ingérer des documents (projet)
export const ingestProjectDocuments = async (
  projectId: string,
  data: IngestBody
): Promise<{ status: string; added: number; total_docs: number }> => {
  const response = await apiClient.post(`/${projectId}/rag/ingest`, data);
  return response.data;
};

// Reconstruire les indexes (projet)
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
  const response = await apiClient.post(`/${projectId}/rag/rebuild`, data || {});
  return response.data;
};

// Supprimer un contexte (projet)
export const deleteProjectContext = async (
  projectId: string,
  contextName: string
): Promise<{ status: string; removed: number; remaining: number }> => {
  const response = await apiClient.delete(`/${projectId}/rag/context/${contextName}`);
  return response.data;
};

// Supprimer tous les contextes (projet)
export const deleteAllProjectContexts = async (projectId: string): Promise<{
  status: string;
  message: string;
}> => {
  const response = await apiClient.delete(`/${projectId}/rag/contexts`);
  return response.data;
};

// Upload de fichier (projet)
export const uploadProjectFile = async (
  projectId: string,
  file: File
): Promise<{ status: string; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/${projectId}/rag/ingest_file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Ingérer un répertoire (projet)
export const ingestProjectDirectory = async (
  projectId: string,
  data: IngestDirBody
): Promise<{ status: string; found: number; ingested: number }> => {
  const response = await apiClient.post(`/${projectId}/rag/ingest_dir`, data);
  return response.data;
};

// Lister les fichiers (projet)
export const listProjectFiles = async (projectId: string): Promise<FileListResponse> => {
  const response = await apiClient.get<FileListResponse>(`/${projectId}/rag/files`);
  return response.data;
};

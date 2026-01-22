import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  RAGDebugResponse,
  IngestBody,
  RebuildBody,
  IngestDirBody,
  FileListResponse,
  RAGFileListResponse,
} from '../types';
import {
  debugRAG,
  ingestDocuments,
  rebuildIndexes,
  deleteContext,
  deleteAllContexts,
  uploadFile,
  listFiles,
  debugProjectRAG,
  ingestProjectDocuments,
  rebuildProjectIndexes,
  deleteProjectContext,
  deleteAllProjectContexts,
  uploadProjectFile,
  ingestProjectDirectory,
  listProjectFiles,
  deleteProjectFile,
  reindexProject,
} from '../endpoints/rag';
import { getActiveProject } from '../client';

// ==================== Global RAG Hooks ====================

export const useRAGDebug = () => {
  return useQuery<RAGDebugResponse>({
    queryKey: ['rag', 'debug'],
    queryFn: debugRAG,
  });
};

export const useIngestDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IngestBody) => ingestDocuments(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'debug'] });
      queryClient.invalidateQueries({ queryKey: ['rag', 'files'] });
    },
  });
};

export const useRebuildIndexes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: RebuildBody) => rebuildIndexes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'debug'] });
    },
  });
};

export const useDeleteContext = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contextName: string) => deleteContext(contextName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'debug'] });
    },
  });
};

export const useDeleteAllContexts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllContexts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'debug'] });
      queryClient.invalidateQueries({ queryKey: ['rag', 'files'] });
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'debug'] });
      queryClient.invalidateQueries({ queryKey: ['rag', 'files'] });
    },
  });
};

export const useListFiles = () => {
  return useQuery<FileListResponse>({
    queryKey: ['rag', 'files'],
    queryFn: listFiles,
  });
};

// ==================== Project-scoped RAG Hooks ====================

export const useProjectRAGDebug = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<RAGDebugResponse>({
    queryKey: ['projects', activeProjectId, 'rag', 'debug'],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return debugProjectRAG(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

export const useIngestProjectDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId?: string; data: IngestBody }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return ingestProjectDocuments(activeProjectId, data);
    },
    onSuccess: (_, variables) => {
      const activeProjectId = variables.projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'files'],
      });
    },
  });
};

export const useRebuildProjectIndexes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId?: string; data?: RebuildBody }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return rebuildProjectIndexes(activeProjectId, data);
    },
    onSuccess: (_, variables) => {
      const activeProjectId = variables.projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
    },
  });
};

// Réindexer les documents du projet (nouvelle API)
export const useReindexProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId?: string) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return reindexProject(activeProjectId);
    },
    onSuccess: (_, projectId) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'files'],
      });
    },
  });
};

export const useDeleteProjectContext = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, contextName }: { projectId?: string; contextName: string }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteProjectContext(activeProjectId, contextName);
    },
    onSuccess: (_, variables) => {
      const activeProjectId = variables.projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
    },
  });
};

export const useDeleteAllProjectContexts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId?: string) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteAllProjectContexts(activeProjectId);
    },
    onSuccess: (_, projectId) => {
      const activeProjectId = projectId || getActiveProject();
      queryClient.invalidateQueries({ queryKey: ['projects', activeProjectId, 'rag', 'debug'] });
      queryClient.invalidateQueries({ queryKey: ['projects', activeProjectId, 'rag', 'files'] });
    },
  });
};

export const useUploadProjectFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, file }: { projectId?: string; file: File }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return uploadProjectFile(activeProjectId, file);
    },
    onSuccess: (_, variables) => {
      const activeProjectId = variables.projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'files'],
      });
    },
  });
};

// Supprimer un fichier RAG du projet (nouvelle API)
export const useDeleteProjectFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, fileId }: { projectId?: string; fileId: string }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteProjectFile(activeProjectId, fileId);
    },
    onSuccess: (_, variables) => {
      const activeProjectId = variables.projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'files'],
      });
    },
  });
};

export const useIngestProjectDirectory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId?: string; data: IngestDirBody }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return ingestProjectDirectory(activeProjectId, data);
    },
    onSuccess: (_, variables) => {
      const activeProjectId = variables.projectId || getActiveProject();
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', activeProjectId, 'rag', 'files'],
      });
    },
  });
};

export const useListProjectFiles = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<RAGFileListResponse>({
    queryKey: ['projects', activeProjectId, 'rag', 'files'],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return listProjectFiles(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

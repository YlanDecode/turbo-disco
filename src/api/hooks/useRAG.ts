import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  RAGDebugResponse,
  IngestBody,
  RebuildBody,
  IngestDirBody,
  FileListResponse,
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
} from '../endpoints/rag';

// === Hooks globaux ===

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

// === Hooks par projet ===

export const useProjectRAGDebug = (projectId: string) => {
  return useQuery<RAGDebugResponse>({
    queryKey: ['projects', projectId, 'rag', 'debug'],
    queryFn: () => debugProjectRAG(projectId),
    enabled: !!projectId,
  });
};

export const useIngestProjectDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: IngestBody }) =>
      ingestProjectDocuments(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'files'],
      });
    },
  });
};

export const useRebuildProjectIndexes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data?: RebuildBody }) =>
      rebuildProjectIndexes(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'debug'],
      });
    },
  });
};

export const useDeleteProjectContext = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, contextName }: { projectId: string; contextName: string }) =>
      deleteProjectContext(projectId, contextName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'debug'],
      });
    },
  });
};

export const useDeleteAllProjectContexts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteAllProjectContexts(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'rag', 'debug'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'rag', 'files'] });
    },
  });
};

export const useUploadProjectFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      uploadProjectFile(projectId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'files'],
      });
    },
  });
};

export const useIngestProjectDirectory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: IngestDirBody }) =>
      ingestProjectDirectory(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'debug'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'rag', 'files'],
      });
    },
  });
};

export const useListProjectFiles = (projectId: string) => {
  return useQuery<FileListResponse>({
    queryKey: ['projects', projectId, 'rag', 'files'],
    queryFn: () => listProjectFiles(projectId),
    enabled: !!projectId,
  });
};

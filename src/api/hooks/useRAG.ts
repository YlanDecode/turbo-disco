import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RAGFileListResponse } from '../types';
import {
  uploadProjectFile,
  listProjectFiles,
  deleteProjectFile,
  downloadProjectFile,
  reindexProject,
} from '../endpoints/rag';
import { getActiveProject } from '../client';

// ==================== Project-scoped RAG Hooks ====================

// Réindexer les documents du projet
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

// Supprimer un fichier RAG du projet par son nom
export const useDeleteProjectFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, filename }: { projectId?: string; filename: string }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return deleteProjectFile(activeProjectId, filename);
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

// Télécharger un fichier RAG du projet
export const useDownloadProjectFile = () => {
  return useMutation({
    mutationFn: ({ projectId, filename }: { projectId?: string; filename: string }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return downloadProjectFile(activeProjectId, filename);
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

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  getApiKey,
  setApiKey as setStoredApiKey,
  clearApiKey as clearStoredApiKey,
  getActiveProject,
  setActiveProject as setStoredActiveProject,
  clearActiveProject as clearStoredActiveProject,
} from '@/api/client';
import type { ProjectResponse } from '@/api/types';

interface ProjectContextType {
  projectId: string | null;
  apiKey: string | null;
  projectData: ProjectResponse | null;
  setProject: (projectId: string, apiKey: string, projectData?: ProjectResponse) => void;
  setProjectData: (data: ProjectResponse) => void;
  clearProject: () => void;
  isAuthenticated: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectResponse | null>(null);

  useEffect(() => {
    // Charger le projet actif au démarrage
    const storedProjectId = getActiveProject();
    const storedApiKey = getApiKey();

    if (storedProjectId && storedApiKey) {
      setProjectId(storedProjectId);
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    // Écouter les événements d'erreur d'authentification
    const handleAuthError = () => {
      setProjectId(null);
      setApiKey(null);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const setProject = (newProjectId: string, newApiKey: string, newProjectData?: ProjectResponse) => {
    setProjectId(newProjectId);
    setApiKey(newApiKey);
    if (newProjectData) {
      setProjectData(newProjectData);
    }
    setStoredActiveProject(newProjectId);
    setStoredApiKey(newApiKey);
  };

  const clearProject = () => {
    setProjectId(null);
    setApiKey(null);
    setProjectData(null);
    clearStoredActiveProject();
    clearStoredApiKey();
  };

  const value: ProjectContextType = {
    projectId,
    apiKey,
    projectData,
    setProject,
    setProjectData,
    clearProject,
    isAuthenticated: !!(projectId && apiKey),
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

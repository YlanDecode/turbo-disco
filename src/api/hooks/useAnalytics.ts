import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  AnalyticsOverview,
  AnalyticsTrend,
  AnalyticsTrendParams,
  TopQuestion,
  FailedQuery,
  SatisfactionStats,
  CostEstimate,
  CostEstimateParams,
} from '../types';
import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getTopQuestions,
  getFailedQueries,
  getSatisfactionStats,
  getCostEstimate,
  exportAnalytics,
} from '../endpoints/analytics';
import { getActiveProject } from '../client';

// Vue d'ensemble des analytics
export const useAnalyticsOverview = (days?: number, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', activeProjectId, 'overview', days],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getAnalyticsOverview(activeProjectId, days);
    },
    enabled: !!activeProjectId,
  });
};

// Tendances des analytics
export const useAnalyticsTrends = (params?: AnalyticsTrendParams, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<AnalyticsTrend[]>({
    queryKey: ['analytics', activeProjectId, 'trends', params],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getAnalyticsTrends(activeProjectId, params);
    },
    enabled: !!activeProjectId,
  });
};

// Questions les plus fréquentes
export const useTopQuestions = (
  params?: { days?: number; limit?: number },
  projectId?: string
) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<TopQuestion[]>({
    queryKey: ['analytics', activeProjectId, 'top-questions', params],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getTopQuestions(activeProjectId, params);
    },
    enabled: !!activeProjectId,
  });
};

// Requêtes échouées
export const useFailedQueries = (
  params?: { days?: number; limit?: number },
  projectId?: string
) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<FailedQuery[]>({
    queryKey: ['analytics', activeProjectId, 'failed-queries', params],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getFailedQueries(activeProjectId, params);
    },
    enabled: !!activeProjectId,
  });
};

// Statistiques de satisfaction
export const useSatisfactionStats = (projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<SatisfactionStats>({
    queryKey: ['analytics', activeProjectId, 'satisfaction'],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getSatisfactionStats(activeProjectId);
    },
    enabled: !!activeProjectId,
  });
};

// Estimation des coûts
export const useCostEstimate = (params: CostEstimateParams, projectId?: string) => {
  const activeProjectId = projectId || getActiveProject();

  return useQuery<CostEstimate>({
    queryKey: ['analytics', activeProjectId, 'costs', params],
    queryFn: () => {
      if (!activeProjectId) throw new Error('Project ID manquant');
      return getCostEstimate(activeProjectId, params);
    },
    enabled: !!activeProjectId && !!params.start_date && !!params.end_date,
  });
};

// Export des analytics
export const useExportAnalytics = () => {
  return useMutation<
    Blob,
    Error,
    {
      projectId?: string;
      params: { start_date: string; end_date: string; format?: 'json' | 'csv' };
    }
  >({
    mutationFn: ({ projectId, params }) => {
      const activeProjectId = projectId || getActiveProject();
      if (!activeProjectId) throw new Error('Project ID manquant');
      return exportAnalytics(activeProjectId, params);
    },
  });
};

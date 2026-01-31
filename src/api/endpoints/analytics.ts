import { apiClient } from '../client';
import type {
  AnalyticsOverview,
  AnalyticsTrend,
  AnalyticsTrendParams,
  TopQuestion,
  FailedQuery,
  SatisfactionStats,
  CostEstimate,
  CostEstimateParams,
  AnalyticsDashboard,
} from '../types';

// GET /api/v1/analytics/overview - Vue d'ensemble globale
export const getGlobalAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const response = await apiClient.get<AnalyticsOverview>('/analytics/overview');
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id} - Analytics d'un projet
export const getProjectAnalytics = async (projectId: string): Promise<AnalyticsOverview> => {
  const response = await apiClient.get<AnalyticsOverview>(
    `/analytics/projects/${projectId}`
  );
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id}/dashboard - Dashboard complet
export const getAnalyticsDashboard = async (projectId: string): Promise<AnalyticsDashboard> => {
  const response = await apiClient.get<AnalyticsDashboard>(
    `/analytics/projects/${projectId}/dashboard`
  );
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id}/trends - Tendances (alias pour compatibilité)
export const getAnalyticsOverview = async (
  projectId: string,
  days?: number
): Promise<AnalyticsOverview> => {
  const response = await apiClient.get<AnalyticsOverview>(
    `/analytics/projects/${projectId}`,
    { params: { days } }
  );
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id}/trends - Tendances
export const getAnalyticsTrends = async (
  projectId: string,
  params?: AnalyticsTrendParams
): Promise<AnalyticsTrend[]> => {
  const response = await apiClient.get<{ trends: AnalyticsTrend[] } | AnalyticsTrend[]>(
    `/analytics/projects/${projectId}/trends`,
    { params }
  );
  // Handle both { trends: [...] } and [...] response formats
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return data?.trends || [];
};

// GET /api/v1/analytics/projects/{project_id}/top-questions - Questions fréquentes
export const getTopQuestions = async (
  projectId: string,
  params?: { days?: number; limit?: number }
): Promise<TopQuestion[]> => {
  const response = await apiClient.get<{ questions: TopQuestion[] } | TopQuestion[]>(
    `/analytics/projects/${projectId}/top-questions`,
    { params }
  );
  // Handle both { questions: [...] } and [...] response formats
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return (data as { questions?: TopQuestion[] })?.questions || [];
};

// GET /api/v1/analytics/projects/{project_id}/failed-queries - Requêtes échouées (non dans la liste fournie)
export const getFailedQueries = async (
  projectId: string,
  params?: { days?: number; limit?: number }
): Promise<FailedQuery[]> => {
  const response = await apiClient.get<FailedQuery[]>(
    `/analytics/projects/${projectId}/failed-queries`,
    { params }
  );
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id}/satisfaction - Statistiques de satisfaction
export const getSatisfactionStats = async (projectId: string): Promise<SatisfactionStats> => {
  const response = await apiClient.get<SatisfactionStats>(
    `/analytics/projects/${projectId}/satisfaction`
  );
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id}/costs - Estimation des coûts
export const getCostEstimate = async (
  projectId: string,
  params: CostEstimateParams
): Promise<CostEstimate> => {
  const response = await apiClient.get<CostEstimate>(
    `/analytics/projects/${projectId}/costs`,
    { params }
  );
  return response.data;
};

// GET /api/v1/analytics/projects/{project_id}/export - Export des données
export const exportAnalytics = async (
  projectId: string,
  params: { start_date: string; end_date: string; format?: 'json' | 'csv' }
): Promise<Blob> => {
  const response = await apiClient.get(`/analytics/projects/${projectId}/export`, {
    params,
    responseType: 'blob',
  });
  return response.data;
};

// POST /api/v1/analytics/refresh - Rafraîchir les analytics
export const refreshAnalytics = async (): Promise<{ status: string; message: string }> => {
  const response = await apiClient.post('/analytics/refresh');
  return response.data;
};

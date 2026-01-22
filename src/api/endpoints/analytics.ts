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
} from '../types';

// GET /projects/{project_id}/analytics/overview - Vue d'ensemble
export const getAnalyticsOverview = async (
  projectId: string,
  days?: number
): Promise<AnalyticsOverview> => {
  const response = await apiClient.get<AnalyticsOverview>(
    `/projects/${projectId}/analytics/overview`,
    { params: { days } }
  );
  return response.data;
};

// GET /projects/{project_id}/analytics/trends - Tendances
export const getAnalyticsTrends = async (
  projectId: string,
  params?: AnalyticsTrendParams
): Promise<AnalyticsTrend[]> => {
  const response = await apiClient.get<AnalyticsTrend[]>(
    `/projects/${projectId}/analytics/trends`,
    { params }
  );
  return response.data;
};

// GET /projects/{project_id}/analytics/top-questions - Questions fréquentes
export const getTopQuestions = async (
  projectId: string,
  params?: { days?: number; limit?: number }
): Promise<TopQuestion[]> => {
  const response = await apiClient.get<TopQuestion[]>(
    `/projects/${projectId}/analytics/top-questions`,
    { params }
  );
  return response.data;
};

// GET /projects/{project_id}/analytics/failed-queries - Requêtes échouées
export const getFailedQueries = async (
  projectId: string,
  params?: { days?: number; limit?: number }
): Promise<FailedQuery[]> => {
  const response = await apiClient.get<FailedQuery[]>(
    `/projects/${projectId}/analytics/failed-queries`,
    { params }
  );
  return response.data;
};

// GET /projects/{project_id}/analytics/satisfaction - Statistiques de satisfaction
export const getSatisfactionStats = async (projectId: string): Promise<SatisfactionStats> => {
  const response = await apiClient.get<SatisfactionStats>(
    `/projects/${projectId}/analytics/satisfaction`
  );
  return response.data;
};

// GET /projects/{project_id}/analytics/costs - Estimation des coûts
export const getCostEstimate = async (
  projectId: string,
  params: CostEstimateParams
): Promise<CostEstimate> => {
  const response = await apiClient.get<CostEstimate>(
    `/projects/${projectId}/analytics/costs`,
    { params }
  );
  return response.data;
};

// GET /projects/{project_id}/analytics/export - Export des données
export const exportAnalytics = async (
  projectId: string,
  params: { start_date: string; end_date: string; format?: 'json' | 'csv' }
): Promise<Blob> => {
  const response = await apiClient.get(`/projects/${projectId}/analytics/export`, {
    params,
    responseType: 'blob',
  });
  return response.data;
};

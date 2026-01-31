import { apiClient } from '../client';
import type {
  Activity,
  ActivityListParams,
  ActivityListResponse,
  UnreadCountResponse,
  MarkReadRequest,
} from '../types';

// GET /activities - Lister les activités
export const listActivities = async (
  params?: ActivityListParams
): Promise<ActivityListResponse> => {
  const response = await apiClient.get<ActivityListResponse>('/activities', { params });
  return response.data;
};

// GET /activities/unread-count - Compteur des activités non-lues
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get<UnreadCountResponse>('/activities/unread-count');
  return response.data;
};

// POST /activities/{id}/read - Marquer une activité comme lue/non-lue
export const markActivityRead = async (
  activityId: string,
  data: MarkReadRequest
): Promise<Activity> => {
  const response = await apiClient.post<Activity>(
    `/activities/${activityId}/read`,
    data
  );
  return response.data;
};

// POST /activities/mark-all-read - Marquer toutes les activités comme lues
export const markAllActivitiesRead = async (): Promise<void> => {
  await apiClient.post('/activities/mark-all-read');
};

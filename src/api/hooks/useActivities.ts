import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Activity,
  ActivityListParams,
  ActivityListResponse,
  UnreadCountResponse,
  MarkReadRequest,
} from '../types';
import {
  listActivities,
  getUnreadCount,
  markActivityRead,
  markAllActivitiesRead,
} from '../endpoints/activities';

// Liste des activités
export const useActivities = (params?: ActivityListParams) => {
  return useQuery<ActivityListResponse>({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
  });
};

// Compteur des activités non-lues
export const useUnreadCount = () => {
  return useQuery<UnreadCountResponse>({
    queryKey: ['activities', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Marquer une activité comme lue/non-lue
export const useMarkActivityRead = () => {
  const queryClient = useQueryClient();

  return useMutation<Activity, Error, { activityId: string; data: MarkReadRequest }>({
    mutationFn: ({ activityId, data }) => markActivityRead(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

// Marquer toutes les activités comme lues
export const useMarkAllActivitiesRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: markAllActivitiesRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

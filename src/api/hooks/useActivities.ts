import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
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

// Context type for optimistic updates
interface MutationContext {
  previousActivities: [QueryKey, ActivityListResponse | undefined][];
  previousUnreadCount: UnreadCountResponse | undefined;
}

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

  return useMutation<
    Activity,
    Error,
    { activityId: string; data: MarkReadRequest },
    MutationContext
  >({
    mutationFn: ({ activityId, data }) => markActivityRead(activityId, data),
    onMutate: async ({ activityId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['activities'] });

      // Snapshot the previous values
      const previousActivities = queryClient.getQueriesData<ActivityListResponse>({
        queryKey: ['activities'],
      });
      const previousUnreadCount = queryClient.getQueryData<UnreadCountResponse>([
        'activities',
        'unread-count',
      ]);

      // Optimistically update activities lists
      queryClient.setQueriesData<ActivityListResponse>(
        { queryKey: ['activities'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            activities: old.activities.map((activity) =>
              activity.id === activityId
                ? { ...activity, read: data.read }
                : activity
            ),
          };
        }
      );

      // Optimistically update unread count
      if (previousUnreadCount) {
        queryClient.setQueryData<UnreadCountResponse>(
          ['activities', 'unread-count'],
          {
            count: data.read
              ? Math.max(0, previousUnreadCount.count - 1)
              : previousUnreadCount.count + 1,
          }
        );
      }

      return { previousActivities, previousUnreadCount };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousActivities) {
        context.previousActivities.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          ['activities', 'unread-count'],
          context.previousUnreadCount
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

// Marquer toutes les activités comme lues
export const useMarkAllActivitiesRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void, MutationContext>({
    mutationFn: markAllActivitiesRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });

      const previousActivities = queryClient.getQueriesData<ActivityListResponse>({
        queryKey: ['activities'],
      });
      const previousUnreadCount = queryClient.getQueryData<UnreadCountResponse>([
        'activities',
        'unread-count',
      ]);

      // Mark all as read optimistically
      queryClient.setQueriesData<ActivityListResponse>(
        { queryKey: ['activities'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            activities: old.activities.map((activity) => ({
              ...activity,
              read: true,
            })),
          };
        }
      );

      queryClient.setQueryData<UnreadCountResponse>(
        ['activities', 'unread-count'],
        { count: 0 }
      );

      return { previousActivities, previousUnreadCount };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousActivities) {
        context.previousActivities.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          ['activities', 'unread-count'],
          context.previousUnreadCount
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

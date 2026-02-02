import { apiClient } from '../client';
import type {
  Activity,
  ActivityType,
  ActivityListParams,
  ActivityListResponse,
  UnreadCountResponse,
  MarkReadRequest,
} from '../types';

// Mapping des types d'activité vers des titres lisibles
const activityTitleMap: Record<ActivityType, string> = {
  user_signup: 'Nouvel utilisateur inscrit',
  user_approved: 'Utilisateur approuvé',
  user_rejected: 'Utilisateur rejeté',
  user_login: 'Connexion utilisateur',
  project_created: 'Projet créé',
  project_updated: 'Projet mis à jour',
  project_deleted: 'Projet supprimé',
  file_uploaded: 'Fichier uploadé',
  file_deleted: 'Fichier supprimé',
  conversation_started: 'Nouvelle conversation',
  conversation_ended: 'Conversation terminée',
  webhook_created: 'Webhook créé',
  webhook_triggered: 'Webhook déclenché',
  api_key_created: 'Clé API créée',
  api_key_rotated: 'Clé API régénérée',
  system_alert: 'Alerte système',
  rag_indexed: 'Indexation RAG terminée',
  rag_failed: 'Échec indexation RAG',
};

// Interface pour la réponse brute de l'API
interface RawActivity {
  id: string;
  activity_type: ActivityType;
  actor_user_id?: string | null;
  actor_username?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  conversation_id?: string | null;
  end_user_id?: string | null;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  message: string;
}

interface RawActivityListResponse {
  activities: RawActivity[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Transforme une activité brute en activité formatée pour le frontend
const transformActivity = (raw: RawActivity): Activity => ({
  id: raw.id,
  type: raw.activity_type,
  title: activityTitleMap[raw.activity_type] || raw.activity_type,
  message: raw.message,
  data: {
    actor_user_id: raw.actor_user_id,
    actor_username: raw.actor_username,
    project_id: raw.project_id,
    project_name: raw.project_name,
    conversation_id: raw.conversation_id,
    end_user_id: raw.end_user_id,
    ...raw.metadata,
  },
  user_id: raw.actor_user_id || undefined,
  project_id: raw.project_id || undefined,
  created_at: raw.created_at,
  read: raw.is_read,
  read_at: null,
});

// GET /activities - Lister les activités
export const listActivities = async (
  params?: ActivityListParams
): Promise<ActivityListResponse> => {
  const response = await apiClient.get<RawActivityListResponse>('/activities', { params });

  const limit = params?.limit || 20;
  const offset = params?.offset || 0;
  const total = response.data.pagination?.total ?? response.data.activities.length;

  return {
    activities: response.data.activities.map(transformActivity),
    pagination: {
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: Math.ceil(total / limit),
      has_more: response.data.pagination?.has_more ?? false,
    },
  };
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

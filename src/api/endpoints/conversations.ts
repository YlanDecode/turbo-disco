import { apiClient } from '../client';
import type {
  ConversationResponse,
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationBody,
  MessageResponse,
} from '../types';

// Lister les conversations (utilise X-API-Key pour identifier le projet)
export const listConversations = async (
  params?: {
    page?: number;
    limit?: number;
    offset?: number;
  }
): Promise<ConversationListResponse> => {
  const response = await apiClient.get<ConversationListResponse>(
    `/conversations`,
    { params }
  );
  return response.data;
};

// Créer une conversation
export const createConversation = async (
  data?: CreateConversationBody
): Promise<ConversationResponse> => {
  const response = await apiClient.post<ConversationResponse>(
    `/conversations`,
    data || {}
  );
  return response.data;
};

// Obtenir une conversation avec ses messages
export const getConversation = async (
  conversationId: string,
  limit?: number
): Promise<ConversationDetailResponse> => {
  const response = await apiClient.get<ConversationDetailResponse>(
    `/conversations/${conversationId}`,
    { params: { limit } }
  );
  return response.data;
};

// GET /conversations/{id}/messages - Messages seuls
export const getConversationMessages = async (
  conversationId: string,
  params?: { limit?: number; offset?: number }
): Promise<MessageResponse[]> => {
  const response = await apiClient.get<MessageResponse[]>(
    `/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

// Supprimer une conversation
export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  await apiClient.delete(`/conversations/${conversationId}`);
};

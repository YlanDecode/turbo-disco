import { apiClient } from '../client';
import type {
  ConversationResponse,
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationBody,
} from '../types';

// Lister les conversations
export const listConversations = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ConversationListResponse> => {
  const response = await apiClient.get<ConversationListResponse>('/conversations', { params });
  return response.data;
};

// Créer une conversation
export const createConversation = async (
  data?: CreateConversationBody
): Promise<ConversationResponse> => {
  const response = await apiClient.post<ConversationResponse>('/conversations', data || {});
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

// Supprimer une conversation
export const deleteConversation = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/conversations/${conversationId}`);
};

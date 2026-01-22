import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationBody,
} from '../types';
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
} from '../endpoints/conversations';
import { getApiKey } from '../client';

// Lister les conversations (utilise X-API-Key pour identifier le projet)
export const useConversations = (params?: { page?: number; limit?: number; offset?: number }) => {
  const apiKey = getApiKey();

  return useQuery<ConversationListResponse>({
    queryKey: ['conversations', apiKey, params],
    queryFn: () => listConversations(params),
    enabled: !!apiKey,
  });
};

// Obtenir une conversation avec ses messages
export const useConversation = (conversationId: string, limit?: number) => {
  const apiKey = getApiKey();

  return useQuery<ConversationDetailResponse>({
    queryKey: ['conversations', apiKey, conversationId, limit],
    queryFn: () => getConversation(conversationId, limit),
    enabled: !!conversationId && !!apiKey,
  });
};

// Créer une conversation
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CreateConversationBody) => createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Supprimer une conversation
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

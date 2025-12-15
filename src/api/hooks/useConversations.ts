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

// Lister les conversations
export const useConversations = (params?: { page?: number; limit?: number }) => {
  return useQuery<ConversationListResponse>({
    queryKey: ['conversations', params],
    queryFn: () => listConversations(params),
  });
};

// Obtenir une conversation
export const useConversation = (conversationId: string, limit?: number) => {
  return useQuery<ConversationDetailResponse>({
    queryKey: ['conversations', conversationId, limit],
    queryFn: () => getConversation(conversationId, limit),
    enabled: !!conversationId,
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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';
import type { ChatRequest } from '../types';
import { sendChatMessage, sendChatMessageStream, type SSECallbacks } from '../endpoints/chat';
import { getApiKey } from '../client';

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRequest) => sendChatMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const sendMessage = useCallback(
    async (
      message: string,
      options: {
        conversationId?: string;
        k?: number;
        maxTokens?: number;
        onToken: (token: string) => void;
        onMeta?: (meta: { contexts?: string[]; conversation_id?: string }) => void;
        onComplete?: () => void;
      }
    ) => {
      setIsStreaming(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const apiKey = getApiKey();
      if (!apiKey) {
        const err = new Error('Clé API manquante');
        setError(err);
        setIsStreaming(false);
        return;
      }

      const callbacks: SSECallbacks = {
        onToken: options.onToken,
        onMeta: (meta) => options.onMeta?.(meta),
        onComplete: () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          options.onComplete?.();
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        onConversationId: (id) => {
          setConversationId(id);
        },
      };

      const chatRequest: ChatRequest = {
        message,
        conversation_id: options.conversationId || conversationId,
        max_tokens: options.maxTokens || 600,
        use_web_search: true,
      };

      await sendChatMessageStream(chatRequest, callbacks, apiKey, controller);
    },
    [conversationId]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    sendMessage,
    isStreaming,
    error,
    cancel,
    setConversationId,
    conversationId,
  };
};

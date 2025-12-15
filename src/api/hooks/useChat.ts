import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import type { ChatRequest } from '../types';
import { sendChatMessage, sendChatMessageStream, type SSECallbacks } from '../endpoints/chat';
import { getApiKey } from '../client';

// Hook pour envoyer un message (réponse complète)
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRequest) => sendChatMessage(data),
    onSuccess: () => {
      // Invalider le cache des conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Hook pour le chat streaming
export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      options: {
        conversationId?: string;
        k?: number;
        maxTokens?: number;
        onToken: (token: string) => void;
        onMeta?: (meta: { contexts: string[] }) => void;
        onComplete?: () => void;
      }
    ) => {
      setIsStreaming(true);
      setError(null);

      const controller = new AbortController();
      setAbortController(controller);

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
          setAbortController(null);
          options.onComplete?.();
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
          setAbortController(null);
        },
      };

      const chatRequest: ChatRequest = {
        message,
        conversation_id: options.conversationId,
        k: options.k || 3,
        max_tokens: options.maxTokens || 600,
        use_web_search: true,
      };

      await sendChatMessageStream(chatRequest, callbacks, apiKey, controller);
    },
    []
  );

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsStreaming(false);
  }, [abortController]);

  return {
    sendMessage,
    isStreaming,
    error,
    cancel,
  };
};

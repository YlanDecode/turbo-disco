import { apiClient } from '../client';
import type { ChatRequest, ChatResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://depressively-tetched-therese.ngrok-free.dev/api/v1';

// Chat avec réponse complète
export const sendChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>('/chat', data);
  return response.data;
};

// Interface pour les événements SSE
export interface SSEMetaEvent {
  contexts: string[];
}

export interface SSECallbacks {
  onToken: (token: string) => void;
  onMeta: (meta: SSEMetaEvent) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// Chat avec streaming SSE
export const sendChatMessageStream = async (
  data: ChatRequest,
  callbacks: SSECallbacks,
  apiKey: string,
  abortController?: AbortController
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'ngrok-skip-browser-warning': 'anyvalue',
      },
      body: JSON.stringify(data),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur lors du streaming');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream non disponible');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    let streamEnded = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done || streamEnded) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        // Détecter le type d'événement
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          
          // Si on reçoit event: done, on arrête le stream
          if (currentEvent === 'done') {
            streamEnded = true;
            callbacks.onComplete();
            break;
          }
          
          // Si on reçoit event: error, on prépare à gérer l'erreur
          if (currentEvent === 'error') {
            continue;
          }
          
          continue;
        }

        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            streamEnded = true;
            callbacks.onComplete();
            break;
          }

          // Si l'événement est "error", on lance l'erreur
          if (currentEvent === 'error') {
            callbacks.onError(new Error(data));
            currentEvent = '';
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            
            // Métadonnées (contextes)
            if (parsed.contexts) {
              callbacks.onMeta(parsed as SSEMetaEvent);
              currentEvent = '';
            } 
            // Métadonnées de fin (response_time_ms)
            else if (parsed.response_time_ms !== undefined) {
              // Ignorer les métadonnées de fin
              currentEvent = '';
            } 
            // Sinon c'est un token texte
            else {
              callbacks.onToken(data);
            }
          } catch {
            // C'est un token texte simple
            if (currentEvent !== 'meta' && currentEvent !== 'done') {
              callbacks.onToken(data);
            }
          }
          
          // Réinitialiser l'événement après traitement
          if (currentEvent === 'meta') {
            currentEvent = '';
          }
        }
      }
      
      if (streamEnded) break;
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // Stream annulé par l'utilisateur
      callbacks.onComplete();
    } else {
      callbacks.onError(error as Error);
    }
  }
};

// Health check du chatbot
export const checkChatbotHealth = async (): Promise<{ status: string; message: string }> => {
  const response = await apiClient.get('/chat/debug');
  return response.data;
};

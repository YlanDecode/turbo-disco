import axios, { AxiosError } from 'axios';
import { getErrorMessage, showErrorToast } from '@/lib/errors';
import { useAuthStore } from '@/store/authStore';

// Ensure HTTPS is always used for the API URL
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'https://chatbot-api.lantorian.com/api/v1';
export const API_BASE_URL = rawApiUrl.replace(/^http:\/\//i, 'https://');
export const IS_NGROK = /ngrok/i.test(String(API_BASE_URL));

// Gestion de la clé API projet (plain localStorage)
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem('madabest_api_key', apiKey);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem('madabest_api_key');
};

export const clearApiKey = (): void => {
  localStorage.removeItem('madabest_api_key');
};

// Gestion du projet actif
export const setActiveProject = (projectId: string): void => {
  localStorage.setItem('madabest_active_project', projectId);
};

export const getActiveProject = (): string | null => {
  return localStorage.getItem('madabest_active_project');
};

export const clearActiveProject = (): void => {
  localStorage.removeItem('madabest_active_project');
};

// Lecture des tokens JWT depuis le store Zustand
export const getAccessToken = (): string | null => {
  return useAuthStore.getState().accessToken;
};

export const getRefreshToken = (): string | null => {
  return useAuthStore.getState().refreshToken;
};

// Client Axios configuré
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

// Intercepteur de requête pour injecter X-API-Key et/ou Bearer token
apiClient.interceptors.request.use(
  (config) => {
    // Injecter le Bearer token JWT pour l'authentification utilisateur
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Injecter X-API-Key pour l'authentification projet (chat, conversations)
    const apiKey = getApiKey();
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }

    // Injecter l'entête ngrok si applicable
    if (IS_NGROK) {
      config.headers['ngrok-skip-browser-warning'] = 'anyvalue';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper pour déterminer si une erreur 401 est liée au projet (API key) ou au token utilisateur
const isProjectAuthError = (error: AxiosError<{ detail: string }>): boolean => {
  const url = error.config?.url || '';
  const detail = error.response?.data?.detail?.toLowerCase() || '';

  // Endpoints qui utilisent la clé API projet
  const projectEndpoints = ['/conversations', '/chat', '/documents', '/search'];
  const isProjectEndpoint = projectEndpoints.some(endpoint => url.includes(endpoint));

  // Messages d'erreur liés à la clé API
  const apiKeyErrorMessages = ['api key', 'api_key', 'apikey', 'x-api-key'];
  const isApiKeyError = apiKeyErrorMessages.some(msg => detail.includes(msg));

  // Vérifier si la requête avait un header X-API-Key
  const hadApiKeyHeader = !!error.config?.headers?.['X-API-Key'];

  return isProjectEndpoint || isApiKeyError || (hadApiKeyHeader && !detail.includes('token'));
};

// Endpoints qui gèrent leurs propres erreurs (pas de toast automatique)
const SILENT_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/refresh'];

// Vérifie si l'endpoint doit afficher un toast automatique
const shouldShowAutoToast = (url: string | undefined): boolean => {
  if (!url) return true;
  return !SILENT_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail: string }>) => {
    const url = error.config?.url;
    const showToast = shouldShowAutoToast(url);

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          if (isProjectAuthError(error)) {
            // Erreur liée à la clé API du projet
            clearApiKey();
            window.dispatchEvent(new Event('project-auth-error'));
            if (showToast) {
              showErrorToast(error);
            }
          } else {
            // Erreur liée au token JWT utilisateur
            window.dispatchEvent(new Event('auth-error'));
          }
          break;

        case 403:
        case 404:
        case 413:
        case 429:
        case 500:
        case 502:
        case 503:
        case 504:
          if (showToast) {
            showErrorToast(error);
          }
          break;

        default:
          if (showToast && status >= 400) {
            showErrorToast(error);
          }
      }
    } else if (error.request) {
      // Erreur réseau - pas de réponse du serveur
      if (showToast) {
        showErrorToast(error);
      }
    }

    // Attacher le message d'erreur traduit à l'erreur pour les composants
    (error as AxiosError & { userMessage?: string }).userMessage = getErrorMessage(error);

    return Promise.reject(error);
  }
);

// Client pour les requêtes sans authentification
export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

if (IS_NGROK) {
  publicClient.interceptors.request.use((config) => {
    config.headers['ngrok-skip-browser-warning'] = 'anyvalue';
    return config;
  });
}

export default apiClient;

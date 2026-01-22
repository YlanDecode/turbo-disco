import axios, { AxiosError } from 'axios';
import CryptoJS from 'crypto-js';
import { getErrorMessage, showErrorToast } from '@/lib/errors';

// Ensure HTTPS is always used for the API URL
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'https://chatbot-api.lantorian.com/api/v1';
const API_BASE_URL = rawApiUrl.replace(/^http:\/\//i, 'https://');
const IS_NGROK = /ngrok/i.test(String(API_BASE_URL));

const ENCRYPTION_KEY = 'madabest-secure-key-2024';

// Utilitaires de chiffrement
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Gestion sécurisée de la clé API
export const setApiKey = (apiKey: string): void => {
  const encrypted = encryptData(apiKey);
  localStorage.setItem('madabest_api_key', encrypted);
};

export const getApiKey = (): string | null => {
  const encrypted = localStorage.getItem('madabest_api_key');
  if (!encrypted) return null;
  try {
    return decryptData(encrypted);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return null;
  }
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

// Gestion du token JWT d'authentification utilisateur
export const getAccessToken = (): string | null => {
  const encrypted = localStorage.getItem('madabest_access_token');
  if (!encrypted) return null;
  try {
    return decryptData(encrypted);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  const encrypted = localStorage.getItem('madabest_refresh_token');
  if (!encrypted) return null;
  try {
    return decryptData(encrypted);
  } catch {
    return null;
  }
};

// Client Axios configuré
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

// Forcer l'entête ngrok pour éviter l'avertissement navigateur
if (IS_NGROK) {
  try {
    (apiClient.defaults.headers as any).common['ngrok-skip-browser-warning'] = 'anyvalue';
  } catch {}
}

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

    // Injecter l'entête ngrok à chaque requête si applicable
    try {
      (config.headers as Record<string, unknown>)['ngrok-skip-browser-warning'] = 'anyvalue';
    } catch {
      // Ignorer les erreurs
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
  try {
    (publicClient.defaults.headers as any).common['ngrok-skip-browser-warning'] = 'anyvalue';
  } catch {}
}

export default apiClient;

import axios, { AxiosError } from 'axios';
import CryptoJS from 'crypto-js';

// Ensure HTTPS is always used for the API URL
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'https://depressively-tetched-therese.ngrok-free.dev/api/v1';
const API_BASE_URL = rawApiUrl.replace(/^http:\/\//i, 'https://');
const IS_NGROK = /ngrok/i.test(String(API_BASE_URL));

// Clé de chiffrement pour le localStorage (NE PAS commit en production !)
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

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail: string }>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          if (isProjectAuthError(error)) {
            // Erreur liée à la clé API du projet
            console.error('❌ Clé API projet invalide ou manquante');
            // Effacer seulement la clé API, garder le projet sélectionné
            clearApiKey();
            // Événement spécifique pour les erreurs projet (ne déconnecte pas l'utilisateur)
            window.dispatchEvent(new Event('project-auth-error'));
          } else {
            // Erreur liée au token JWT utilisateur
            console.error('❌ Token utilisateur invalide ou expiré');
            window.dispatchEvent(new Event('auth-error'));
          }
          break;
        
        case 403:
          console.error('❌ Accès refusé à cette ressource');
          break;
        
        case 404:
          console.error('❌ Ressource introuvable');
          break;
        
        case 413:
          console.error('❌ Fichier trop volumineux');
          break;
        
        case 500:
          console.error('❌ Erreur serveur:', data?.detail || 'Erreur inconnue');
          break;
        
        default:
          console.error(`❌ Erreur ${status}:`, data?.detail || error.message);
      }
    } else if (error.request) {
      console.error('❌ Aucune réponse du serveur. Vérifiez que le backend est démarré.');
    } else {
      console.error('❌ Erreur de configuration:', error.message);
    }
    
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

import axios from 'axios';
import type {
  UserCreate,
  UserRead,
  Token,
  RefreshTokenRequest,
  LogoutRequest,
  LogoutResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://depressively-tetched-therese.ngrok-free.dev/api/v1';
const IS_NGROK = /ngrok/i.test(String(API_BASE_URL));

// Extraire la base URL sans /api/v1 pour les endpoints d'auth
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

// Client spécifique pour l'authentification (endpoints /api/auth/*)
const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

if (IS_NGROK) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (authClient.defaults.headers as any).common = {
      ...(authClient.defaults.headers.common || {}),
      'ngrok-skip-browser-warning': 'anyvalue',
    };
  } catch {
    // Ignorer les erreurs
  }
}

// Signup - Créer un nouveau compte
export const signup = async (data: UserCreate): Promise<UserRead> => {
  const response = await authClient.post<UserRead>('/api/auth/signup', data);
  return response.data;
};

// Login - Authentifier un utilisateur (application/x-www-form-urlencoded)
export const login = async (username: string, password: string): Promise<Token> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await authClient.post<Token>('/api/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

// Refresh - Rafraîchir le token d'accès
export const refreshToken = async (data: RefreshTokenRequest): Promise<Token> => {
  const response = await authClient.post<Token>('/api/auth/refresh', data);
  return response.data;
};

// Logout - Déconnecter l'utilisateur
export const logout = async (
  data: LogoutRequest,
  accessToken?: string
): Promise<LogoutResponse> => {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await authClient.post<LogoutResponse>('/api/auth/logout', data, {
    headers,
  });
  return response.data;
};

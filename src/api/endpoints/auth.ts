import { publicClient } from '../client';
import type {
  UserCreate,
  UserRead,
  Token,
  RefreshTokenRequest,
  LogoutRequest,
  LogoutResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  MessageResponse as GenericMessageResponse,
} from '../types';

// Signup - Créer un nouveau compte
export const signup = async (data: UserCreate): Promise<UserRead> => {
  const response = await publicClient.post<UserRead>('/auth/signup', data);
  return response.data;
};

// Login - Authentifier un utilisateur (application/x-www-form-urlencoded)
export const login = async (username: string, password: string): Promise<Token> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await publicClient.post<Token>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

// Refresh - Rafraîchir le token d'accès
export const refreshToken = async (data: RefreshTokenRequest): Promise<Token> => {
  const response = await publicClient.post<Token>('/auth/refresh', data);
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

  const response = await publicClient.post<LogoutResponse>('/auth/logout', data, {
    headers,
  });
  return response.data;
};

// Forgot Password - Demande de réinitialisation de mot de passe
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<GenericMessageResponse> => {
  const response = await publicClient.post<GenericMessageResponse>('/auth/forgot-password', data);
  return response.data;
};

// Reset Password - Réinitialisation du mot de passe avec token
export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await publicClient.post('/auth/reset-password', data);
};

// Verify Email - Vérification de l'email avec token
export const verifyEmail = async (data: VerifyEmailRequest): Promise<void> => {
  await publicClient.post('/auth/verify-email', data);
};

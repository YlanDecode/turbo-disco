import { apiClient } from '../client';
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  Consent,
  CreateConsentRequest,
  UserDataExport,
} from '../types';

// ==================== Profile ====================

// GET /users/me - Récupérer le profil utilisateur
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.post<UserProfile>('/users/me/update', data);
  return response.data;
};

// POST /users/me/change-password - Changer le mot de passe
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.post('/users/me/change-password', data);
};

// POST /users/me/resend-verification - Renvoyer l'email de vérification
export const resendVerificationEmail = async (): Promise<void> => {
  await apiClient.post('/users/me/resend-verification');
};

// GET /users/me/export - Export des données utilisateur (RGPD)
export const exportUserData = async (): Promise<UserDataExport> => {
  const response = await apiClient.get<UserDataExport>('/users/me/export');
  return response.data;
};

// DELETE /users/me - Supprimer le compte utilisateur
export const deleteAccount = async (data: DeleteAccountRequest): Promise<void> => {
  await apiClient.delete('/users/me', { data });
};

// ==================== Consents (RGPD) ====================

// GET /users/me/consents - Liste des consentements
export const getConsents = async (): Promise<Consent[]> => {
  const response = await apiClient.get<Consent[]>('/users/me/consents');
  return response.data;
};

// POST /users/me/consents - Enregistrer un consentement
export const createConsent = async (data: CreateConsentRequest): Promise<Consent> => {
  const response = await apiClient.post<Consent>('/users/me/consents', data);
  return response.data;
};

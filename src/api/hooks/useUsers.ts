import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  Consent,
  CreateConsentRequest,
} from '../types';
import {
  getProfile,
  updateProfile,
  changePassword,
  resendVerificationEmail,
  exportUserData,
  deleteAccount,
  getConsents,
  createConsent,
} from '../endpoints/users';

// ==================== Profile Hooks ====================

// Récupérer le profil utilisateur
export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
};

// Mettre à jour le profil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Changer le mot de passe
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
};

// Renvoyer l'email de vérification
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: () => resendVerificationEmail(),
  });
};

// Export des données utilisateur (RGPD)
export const useExportUserData = () => {
  return useMutation({
    mutationFn: () => exportUserData(),
  });
};

// Supprimer le compte
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (data: DeleteAccountRequest) => deleteAccount(data),
  });
};

// ==================== Consents Hooks ====================

// Liste des consentements
export const useConsents = () => {
  return useQuery<Consent[]>({
    queryKey: ['consents'],
    queryFn: getConsents,
  });
};

// Enregistrer un consentement
export const useCreateConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsentRequest) => createConsent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
};

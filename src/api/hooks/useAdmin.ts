import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  PendingUser,
  UserProfile,
  AdminUserListParams,
  ApproveUserRequest,
  RejectUserRequest,
  UpdateRoleRequest,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminChangePasswordRequest,
  AuditLogListParams,
  AuditLogListResponse,
  PaginationMetadata,
} from '../types';
import {
  getPendingUsers,
  getUsers,
  getUser,
  approveUser,
  rejectUser,
  updateUserRole,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  getAuditLogs,
} from '../endpoints/admin';

// ==================== User Management Hooks ====================

// Liste des utilisateurs en attente
export const usePendingUsers = () => {
  return useQuery<PendingUser[]>({
    queryKey: ['admin', 'pending-users'],
    queryFn: getPendingUsers,
  });
};

// Liste de tous les utilisateurs
export const useAdminUsers = (params?: AdminUserListParams) => {
  return useQuery<{ users: UserProfile[]; pagination: PaginationMetadata }>({
    queryKey: ['admin', 'users', params],
    queryFn: () => getUsers(params),
  });
};

// Alias for backward compatibility
export const useUsers = useAdminUsers;

// Détail d'un utilisateur
export const useUser = (userId: string | null) => {
  return useQuery<UserProfile>({
    queryKey: ['admin', 'user', userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });
};

// Approuver un utilisateur
export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data?: ApproveUserRequest }) =>
      approveUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Rejeter un utilisateur
export const useRejectUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data?: RejectUserRequest }) =>
      rejectUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Modifier le rôle d'un utilisateur
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateRoleRequest }) =>
      updateUserRole(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Modifier un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminUpdateUserRequest }) =>
      updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
    },
  });
};

// Modifier le mot de passe d'un utilisateur
export const useChangeUserPassword = () => {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminChangePasswordRequest }) =>
      changeUserPassword(userId, data),
  });
};

// Supprimer un utilisateur
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
    },
  });
};

// Alias for backward compatibility
export const useDeleteUser = useDeleteAdminUser;

// ==================== Audit Logs Hook ====================

export const useAuditLogs = (params?: AuditLogListParams) => {
  return useQuery<AuditLogListResponse>({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => getAuditLogs(params),
  });
};

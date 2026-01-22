import { apiClient } from '../client';
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

// ==================== User Management ====================

// GET /admin/users/pending - Liste des utilisateurs en attente d'approbation
export const getPendingUsers = async (): Promise<PendingUser[]> => {
  const response = await apiClient.get<PendingUser[]>('/admin/users/pending');
  return response.data;
};

// GET /admin/users - Liste de tous les utilisateurs
export const getUsers = async (params?: AdminUserListParams): Promise<{
  users: UserProfile[];
  pagination: PaginationMetadata;
}> => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

// GET /admin/users/{user_id} - Détail d'un utilisateur
export const getUser = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(`/admin/users/${userId}`);
  return response.data;
};

// POST /admin/users/{user_id}/approve - Approuver un utilisateur
export const approveUser = async (
  userId: string,
  data?: ApproveUserRequest
): Promise<void> => {
  await apiClient.post(`/admin/users/${userId}/approve`, data || {});
};

// POST /admin/users/{user_id}/reject - Rejeter un utilisateur
export const rejectUser = async (
  userId: string,
  data?: RejectUserRequest
): Promise<void> => {
  await apiClient.post(`/admin/users/${userId}/reject`, data || {});
};

// PUT /admin/users/{user_id}/role - Modifier le rôle d'un utilisateur
export const updateUserRole = async (
  userId: string,
  data: UpdateRoleRequest
): Promise<void> => {
  await apiClient.put(`/admin/users/${userId}/role`, data);
};

// POST /admin/users - Créer un utilisateur
export const createUser = async (data: AdminCreateUserRequest): Promise<UserProfile> => {
  const response = await apiClient.post<UserProfile>('/admin/users', data);
  return response.data;
};

// PATCH /admin/users/{user_id} - Modifier un utilisateur
export const updateUser = async (
  userId: string,
  data: AdminUpdateUserRequest
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>(`/admin/users/${userId}`, data);
  return response.data;
};

// PATCH /admin/users/{user_id}/password - Modifier le mot de passe d'un utilisateur
export const changeUserPassword = async (
  userId: string,
  data: AdminChangePasswordRequest
): Promise<void> => {
  await apiClient.patch(`/admin/users/${userId}/password`, data);
};

// DELETE /admin/users/{user_id} - Supprimer un utilisateur
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
};

// ==================== Audit Logs ====================

// GET /admin/audit-logs - Logs d'audit
export const getAuditLogs = async (
  params?: AuditLogListParams
): Promise<AuditLogListResponse> => {
  const response = await apiClient.get<AuditLogListResponse>('/admin/audit-logs', { params });
  return response.data;
};

import { apiClient } from '../client';
import type {
  PendingUser,
  UserProfile,
  AdminUserListParams,
  ApproveUserRequest,
  RejectUserRequest,
  UpdateRoleRequest,
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

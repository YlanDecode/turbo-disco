import React, { useState } from 'react';
import { useUsers, useApproveUser, useRejectUser, useUpdateUserRole, useDeleteUser, usePendingUsers } from '@/api/hooks/useAdmin';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  MoreVertical,
  Clock,
} from 'lucide-react';
import type { UserProfile, PendingUser } from '@/api/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  admin: 'Administrateur',
  super_admin: 'Super Admin',
};

const roleBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
  user: 'secondary',
  admin: 'default',
  super_admin: 'destructive',
};

export const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Queries
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: pendingUsers, isLoading: pendingLoading, refetch: refetchPending } = usePendingUsers();

  // Mutations
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleApprove = async (userId: string) => {
    try {
      await approveUser.mutateAsync({ userId });
      toast.success('Utilisateur approuvé');
      refetchPending();
      refetchUsers();
    } catch {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectUser.mutateAsync({ userId });
      toast.success('Utilisateur rejeté');
      refetchPending();
    } catch {
      toast.error('Erreur lors du rejet');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateRole.mutateAsync({ userId: selectedUser.id, data: { role: newRole } });
      toast.success('Rôle mis à jour');
      setShowRoleModal(false);
      setSelectedUser(null);
      refetchUsers();
    } catch {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser.id);
      toast.success('Utilisateur supprimé');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      refetchUsers();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const userColumns: Column<UserProfile>[] = [
    {
      key: 'full_name',
      header: 'Nom',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.full_name || '-'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      sortable: true,
      render: (user) => (
        <Badge variant={roleBadgeVariants[user.role] || 'secondary'}>
          {roleLabels[user.role] || user.role}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Statut',
      render: (user) => (
        <Badge variant={user.is_active ? 'success' : 'secondary'}>
          {user.is_active ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Inscription',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (user) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setActionMenuOpen(actionMenuOpen === user.id ? null : user.id);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {actionMenuOpen === user.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setActionMenuOpen(null)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border bg-card shadow-lg">
                <div className="p-1">
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role);
                      setShowRoleModal(true);
                      setActionMenuOpen(null);
                    }}
                  >
                    <Shield className="h-4 w-4" />
                    Modifier le rôle
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-muted"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteDialog(true);
                      setActionMenuOpen(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  const pendingColumns: Column<PendingUser>[] = [
    {
      key: 'full_name',
      header: 'Nom',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.full_name || '-'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'requested_at',
      header: 'Demande',
      render: (user) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {user.requested_at ? format(new Date(user.requested_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (user) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700"
            onClick={() => handleApprove(user.id)}
            disabled={approveUser.isPending}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => handleReject(user.id)}
            disabled={rejectUser.isPending}
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les utilisateurs et leurs permissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <Users className="mr-2 h-4 w-4" />
            Tous les utilisateurs
            {usersData?.users && (
              <Badge variant="secondary" className="ml-2">
                {usersData.users.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4" />
            En attente
            {pendingUsers && pendingUsers.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {usersLoading ? (
            <LoadingSpinner text="Chargement des utilisateurs..." />
          ) : usersData?.users && usersData.users.length > 0 ? (
            <DataTable
              data={usersData.users}
              columns={userColumns}
              searchPlaceholder="Rechercher un utilisateur..."
              searchKeys={['full_name', 'email'] as (keyof UserProfile)[]}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="Aucun utilisateur"
              description="Il n'y a pas encore d'utilisateurs enregistrés."
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingLoading ? (
            <LoadingSpinner text="Chargement des demandes..." />
          ) : pendingUsers && pendingUsers.length > 0 ? (
            <DataTable
              data={pendingUsers}
              columns={pendingColumns}
              searchable={false}
              emptyMessage="Aucune demande en attente"
            />
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Aucune demande en attente"
              description="Toutes les demandes d'inscription ont été traitées."
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="Modifier le rôle"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateRole} disabled={updateRole.isPending}>
              {updateRole.isPending ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Modifier le rôle de <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
          </p>
          <div className="space-y-2">
            {Object.entries(roleLabels).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted"
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={newRole === value}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin' | 'super_admin')}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {value === 'user' && 'Accès standard aux fonctionnalités'}
                    {value === 'admin' && 'Peut gérer les utilisateurs et les projets'}
                    {value === 'super_admin' && 'Accès complet à toutes les fonctionnalités'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedUser?.full_name || selectedUser?.email} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        isLoading={deleteUser.isPending}
        variant="destructive"
      />
    </div>
  );
};

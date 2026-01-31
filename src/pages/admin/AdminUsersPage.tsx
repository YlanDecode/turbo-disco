import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useUsers,
  useUser,
  useApproveUser,
  useRejectUser,
  useUpdateUserRole,
  useCreateUser,
  useUpdateUser,
  useChangeUserPassword,
  useDeleteUser,
  usePendingUsers,
} from '@/api/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonUserCard,
  SkeletonStats,
} from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  Trash2,
  MoreVertical,
  Clock,
  Search,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  UserCog,
  UserPlus,
  RefreshCw,
  Filter,
  ChevronDown,
  AlertCircle,
  Sparkles,
  Pencil,
  KeyRound,
  Mail,
  User,
  Link2,
  Power,
} from 'lucide-react';
import type { UserProfile, PendingUser, UserRole } from '@/api/types';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Role configuration - Only user and super_admin
const roleConfig: Record<UserRole, { label: string; variant: 'secondary' | 'destructive'; icon: React.ElementType; description: string }> = {
  user: {
    label: 'Utilisateur',
    variant: 'secondary',
    icon: Users,
    description: 'Acces standard aux fonctionnalites',
  },
  super_admin: {
    label: 'Super Admin',
    variant: 'destructive',
    icon: ShieldAlert,
    description: 'Acces complet a toutes les fonctionnalites',
  },
};

// Stats Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <div className={cn('rounded-xl p-3', color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <div className={cn('absolute inset-x-0 bottom-0 h-1 opacity-0 transition-opacity group-hover:opacity-100', color)} />
  </div>
);

// User Avatar Component
const UserAvatar: React.FC<{ user: UserProfile | PendingUser; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  const displayName = user.display_name;
  const emailStr = user.email || user.username || 'U';
  const initial = displayName?.[0]?.toUpperCase() || emailStr[0].toUpperCase();
  const avatarUrl = 'avatar_url' in user ? user.avatar_url : undefined;

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ];
  const colorIndex = emailStr.charCodeAt(0) % colors.length;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || emailStr}
        className={cn('rounded-full object-cover', sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white shadow-sm transition-transform group-hover:scale-105',
        sizeClasses[size],
        colors[colorIndex]
      )}
    >
      {initial}
    </div>
  );
};

// Action Menu Component
interface ActionMenuProps {
  onViewDetails: () => void;
  onEdit: () => void;
  onChangeRole: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onViewDetails, onEdit, onChangeRole, onChangePassword, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 208, // 208 = w-52 (13rem = 208px)
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
        data-state={isOpen ? 'open' : 'closed'}
        onClick={handleToggle}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            ref={menuRef}
            className="fixed z-50 w-52 animate-in fade-in-50 slide-in-from-top-2 duration-200"
            style={{ top: menuPosition.top, left: Math.max(8, menuPosition.left) }}
          >
            <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                onClick={() => { onViewDetails(); setIsOpen(false); }}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                Voir les details
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                onClick={() => { onEdit(); setIsOpen(false); }}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Modifier
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                onClick={() => { onChangeRole(); setIsOpen(false); }}
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                Modifier le role
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                onClick={() => { onChangePassword(); setIsOpen(false); }}
              >
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                Changer le mot de passe
              </button>
              <div className="h-px bg-border" />
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => { onDelete(); setIsOpen(false); }}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// User Card Component
interface UserCardProps {
  user: UserProfile;
  onViewDetails: () => void;
  onEdit: () => void;
  onChangeRole: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  isApproving?: boolean;
  index: number;
}

const UserCard: React.FC<UserCardProps> = ({ user, onViewDetails, onEdit, onChangeRole, onChangePassword, onDelete, onApprove, isApproving, index }) => {
  const roleInfo = roleConfig[user.role] || roleConfig.user;
  const RoleIcon = roleInfo.icon;
  const isPending = user.is_approved === false;

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-md cursor-pointer",
        isPending ? "border-orange-500/30 hover:border-orange-500/50" : "hover:border-primary/20"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onViewDetails}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <UserAvatar user={user} size="md" />
          {isPending ? (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
              <Clock className="h-2.5 w-2.5 text-white" />
            </div>
          ) : !user.is_active && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gray-400 flex items-center justify-center">
              <Power className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{user.display_name || user.username}</p>
            {user.email_verified && (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            )}
            {isPending && (
              <Badge variant="outline" className="text-orange-600 border-orange-500/50 text-xs">
                En attente
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isPending && onApprove && (
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-600 hover:bg-green-500/10 hover:text-green-600 hover:border-green-500"
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            disabled={isApproving}
          >
            {isApproving ? (
              <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4 mr-1.5" />
            )}
            Approuver
          </Button>
        )}
        <Badge variant={roleInfo.variant} className="hidden sm:flex items-center gap-1.5">
          <RoleIcon className="h-3 w-3" />
          {roleInfo.label}
        </Badge>
        {!isPending && (
          <Badge
            variant={user.is_active ? 'success' : 'secondary'}
            className="hidden md:flex"
          >
            {user.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        )}
        <span className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
          {user.last_login
            ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true, locale: fr })
            : 'Jamais connecte'}
        </span>
        <ActionMenu
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onChangeRole={onChangeRole}
          onChangePassword={onChangePassword}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

// Pending User Card Component
interface PendingUserCardProps {
  user: PendingUser;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  index: number;
}

const PendingUserCard: React.FC<PendingUserCardProps> = ({
  user,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  index,
}) => (
  <div
    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-md hover:border-orange-500/20"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar user={user} size="md" />
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
          <Clock className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate">{user.display_name || user.username}</p>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {user.requested_at
            ? formatDistanceToNow(new Date(user.requested_at), { addSuffix: true, locale: fr })
            : format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none border-green-500/50 text-green-600 hover:bg-green-500/10 hover:text-green-600 hover:border-green-500"
        onClick={(e) => { e.stopPropagation(); onApprove(); }}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4 mr-2" />
        )}
        Approuver
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
        onClick={(e) => { e.stopPropagation(); onReject(); }}
        disabled={isApproving || isRejecting}
      >
        {isRejecting ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserX className="h-4 w-4 mr-2" />
        )}
        Rejeter
      </Button>
    </div>
  </div>
);

// Create User Modal
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { email: string; password: string; display_name?: string; role: UserRole }) => void;
  isLoading: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleSubmit = () => {
    if (!email || !password) {
      toast.error('Email et mot de passe requis');
      return;
    }
    onSave({ email, password, display_name: displayName || undefined, role });
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setRole('user');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Creer un utilisateur"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !email || !password}>
            {isLoading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Creation...</>
            ) : (
              <><UserPlus className="h-4 w-4 mr-2" />Creer</>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mot de passe *</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nom d'affichage</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nom d'affichage (optionnel)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <div className="space-y-2">
            {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.user][]).map(([value, config]) => {
              const Icon = config.icon;
              const isSelected = role === value;
              return (
                <label
                  key={value}
                  className={cn(
                    'flex items-start gap-4 rounded-xl border-2 p-3 cursor-pointer transition-all duration-200',
                    isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                  )}
                >
                  <input
                    type="radio"
                    name="create-role"
                    value={value}
                    checked={isSelected}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <div className={cn('rounded-lg p-2 transition-colors', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Edit User Modal
interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { email?: string; display_name?: string; avatar_url?: string; is_active?: boolean }) => void;
  isLoading: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave, isLoading }) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  // Sync state with props during render (React recommended pattern)
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setEmail(user.email || '');
    setDisplayName(user.display_name || '');
    setAvatarUrl(user.avatar_url || '');
    setIsActive(user.is_active ?? true);
  }

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier l'utilisateur"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={() => onSave({ email, display_name: displayName || undefined, avatar_url: avatarUrl || undefined, is_active: isActive })} disabled={isLoading}>
            {isLoading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" />Enregistrer</>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <UserAvatar user={user} size="sm" />
          <div>
            <p className="font-medium">{user.display_name || user.username}</p>
            <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nom d'affichage</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nom d'affichage"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">URL de l'avatar</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="https://exemple.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <Power className={cn('h-5 w-5', isActive ? 'text-green-500' : 'text-gray-400')} />
            <div>
              <p className="font-medium text-sm">Compte actif</p>
              <p className="text-xs text-muted-foreground">L'utilisateur peut se connecter</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive(!isActive)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              isActive ? 'bg-green-500' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isActive ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Change Password Modal
interface ChangePasswordModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: string) => void;
  isLoading: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ user, isOpen, onClose, onSave, isLoading }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }
    onSave(password);
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Changer le mot de passe"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !password || password !== confirmPassword}>
            {isLoading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Modification...</>
            ) : (
              <><KeyRound className="h-4 w-4 mr-2" />Modifier</>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <UserAvatar user={user} size="sm" />
          <div>
            <p className="font-medium">{user.display_name || user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-600">
            Le nouveau mot de passe sera applique immediatement. L'utilisateur devra utiliser ce nouveau mot de passe pour se connecter.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nouveau mot de passe</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirmer le mot de passe</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// User Details Modal Component
interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onChangePassword: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  isOpen,
  onClose,
  onEdit,
  onChangeRole,
  onChangePassword,
  onDelete,
}) => {
  const { data: user, isLoading } = useUser(userId);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Details de l'utilisateur" size="lg">
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar user={user} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{user.display_name || user.username}</h3>
                  {user.email_verified && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verifie
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge variant={roleConfig[user.role]?.variant || 'secondary'} className="text-sm">
              {React.createElement(roleConfig[user.role]?.icon || Users, { className: 'h-3.5 w-3.5 mr-1.5' })}
              {roleConfig[user.role]?.label || user.role}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6 rounded-xl bg-muted/50 p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom d'utilisateur</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</p>
              <div className="flex items-center gap-2">
                {user.is_active ? (
                  <><div className="h-2 w-2 rounded-full bg-green-500" /><span className="font-medium text-green-600">Actif</span></>
                ) : (
                  <><div className="h-2 w-2 rounded-full bg-gray-400" /><span className="font-medium text-muted-foreground">Inactif</span></>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date d'inscription</p>
              <p className="font-medium">{format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Derniere connexion</p>
              <p className="font-medium">{user.last_login ? format(new Date(user.last_login), 'dd MMM yyyy a HH:mm', { locale: fr }) : 'Jamais'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approbation</p>
              <div className="flex items-center gap-2">
                {user.is_approved ? (
                  <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium text-green-600">Approuve</span></>
                ) : (
                  <><XCircle className="h-4 w-4 text-orange-500" /><span className="font-medium text-orange-600">En attente</span></>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email verifie</p>
              <div className="flex items-center gap-2">
                {user.email_verified ? (
                  <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-medium text-green-600">Oui</span></>
                ) : (
                  <><XCircle className="h-4 w-4 text-orange-500" /><span className="font-medium text-orange-600">Non</span></>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => onEdit(user)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" onClick={() => onChangeRole(user)}>
              <Shield className="h-4 w-4 mr-2" />
              Changer le role
            </Button>
            <Button variant="outline" onClick={() => onChangePassword(user)}>
              <KeyRound className="h-4 w-4 mr-2" />
              Mot de passe
            </Button>
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50" onClick={() => onDelete(user)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Utilisateur non trouve</p>
          <p className="text-sm text-muted-foreground">L'utilisateur demande n'existe pas ou a ete supprime.</p>
        </div>
      )}
    </Modal>
  );
};

// Role Selection Modal
interface RoleModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleModal: React.FC<RoleModalProps> = ({ user, isOpen, onClose, onSave, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  // Sync state with props during render (React recommended pattern)
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setSelectedRole(user.role);
  }

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le role"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
          <Button onClick={() => onSave(selectedRole)} disabled={isLoading || selectedRole === user.role}>
            {isLoading ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>) : (<><CheckCircle2 className="h-4 w-4 mr-2" />Enregistrer</>)}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <UserAvatar user={user} size="sm" />
          <div>
            <p className="font-medium">{user.display_name || user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.user][]).map(([value, config]) => {
            const Icon = config.icon;
            const isSelected = selectedRole === value;
            return (
              <label
                key={value}
                className={cn(
                  'flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
                  isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                )}
              >
                <input type="radio" name="role" value={value} checked={isSelected} onChange={(e) => setSelectedRole(e.target.value as UserRole)} className="sr-only" />
                <div className={cn('rounded-lg p-2 transition-colors', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{config.label}</p>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

// Filter Dropdown
interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'all', label: 'Tous les roles' },
    { value: 'user', label: 'Utilisateurs' },
    { value: 'super_admin', label: 'Super Admins' },
  ];

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" className="w-full sm:w-auto justify-between" onClick={() => setIsOpen(!isOpen)}>
        <Filter className="h-4 w-4 mr-2" />
        {selectedOption?.label}
        <ChevronDown className={cn('h-4 w-4 ml-2 transition-transform', isOpen && 'rotate-180')} />
      </Button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="rounded-lg border bg-card shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                className={cn('flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors', value === option.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
              >
                {value === option.value && <CheckCircle2 className="h-4 w-4" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Queries
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: pendingUsers, isLoading: pendingLoading, refetch: refetchPending } = usePendingUsers();

  // Mutations
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updateRole = useUpdateUserRole();
  const changePassword = useChangeUserPassword();
  const deleteUser = useDeleteUser();

  const users = useMemo(() => {
    const data = usersData?.users;
    return Array.isArray(data) ? data : [];
  }, [usersData?.users]);

  const pendingFromApi = useMemo(() => {
    return Array.isArray(pendingUsers) ? pendingUsers : [];
  }, [pendingUsers]);

  const pendingFromUsers = useMemo(() =>
    users.filter(u => u.is_approved === false).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      display_name: u.display_name,
      created_at: u.created_at,
      requested_at: u.created_at,
    } as PendingUser)),
    [users]
  );

  const pending = useMemo(() => {
    const allPending = [...pendingFromApi];
    const existingIds = new Set(allPending.map(p => p.id));

    pendingFromUsers.forEach(user => {
      if (!existingIds.has(user.id)) {
        allPending.push(user);
      }
    });

    return allPending;
  }, [pendingFromApi, pendingFromUsers]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'super_admin').length,
    pending: pending.length,
  }), [users, pending]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !searchQuery ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Handlers
  const handleApprove = useCallback(async (userId: string) => {
    try {
      await approveUser.mutateAsync({ userId });
      toast.success('Utilisateur approuve avec succes');
      refetchPending();
      refetchUsers();
    } catch {
      toast.error("Erreur lors de l'approbation de l'utilisateur");
    }
  }, [approveUser, refetchPending, refetchUsers]);

  const handleReject = useCallback(async (userId: string) => {
    try {
      await rejectUser.mutateAsync({ userId });
      toast.success('Utilisateur rejete');
      refetchPending();
    } catch {
      toast.error("Erreur lors du rejet de l'utilisateur");
    }
  }, [rejectUser, refetchPending]);

  const handleCreateUser = useCallback(async (data: { email: string; password: string; display_name?: string; role: UserRole }) => {
    try {
      await createUser.mutateAsync(data);
      toast.success('Utilisateur cree avec succes');
      setShowCreateModal(false);
      refetchUsers();
    } catch {
      toast.error("Erreur lors de la creation de l'utilisateur");
    }
  }, [createUser, refetchUsers]);

  const handleUpdateUser = useCallback(async (data: { email?: string; display_name?: string; avatar_url?: string; is_active?: boolean }) => {
    if (!selectedUser) return;
    try {
      await updateUser.mutateAsync({ userId: selectedUser.id, data });
      toast.success('Utilisateur modifie avec succes');
      setShowEditModal(false);
      setSelectedUser(null);
      refetchUsers();
    } catch {
      toast.error("Erreur lors de la modification de l'utilisateur");
    }
  }, [selectedUser, updateUser, refetchUsers]);

  const handleUpdateRole = useCallback(async (role: UserRole) => {
    if (!selectedUser) return;
    try {
      await updateRole.mutateAsync({ userId: selectedUser.id, data: { role } });
      toast.success('Role mis a jour avec succes');
      setShowRoleModal(false);
      setSelectedUser(null);
      refetchUsers();
    } catch {
      toast.error('Erreur lors de la mise a jour du role');
    }
  }, [selectedUser, updateRole, refetchUsers]);

  const handleChangePassword = useCallback(async (password: string) => {
    if (!selectedUser) return;
    try {
      await changePassword.mutateAsync({ userId: selectedUser.id, data: { new_password: password } });
      toast.success('Mot de passe modifie avec succes');
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch {
      toast.error('Erreur lors de la modification du mot de passe');
    }
  }, [selectedUser, changePassword]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser.id);
      toast.success('Utilisateur supprime avec succes');
      setShowDeleteDialog(false);
      setShowDetailsModal(false);
      setSelectedUser(null);
      setSelectedUserId(null);
      refetchUsers();
    } catch {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  }, [selectedUser, deleteUser, refetchUsers]);

  const openDetails = useCallback((user: UserProfile) => {
    setSelectedUserId(user.id);
    setShowDetailsModal(true);
  }, []);

  const openEditModal = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setShowEditModal(true);
  }, []);

  const openRoleModal = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  }, []);

  const openPasswordModal = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  }, []);

  const openDeleteDialog = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">Gerez les comptes utilisateurs, les roles et les approbations</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      {usersLoading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-animation">
          <StatCard title="Total utilisateurs" value={stats.total} icon={Users} color="bg-blue-500" />
          <StatCard title="Utilisateurs actifs" value={stats.active} icon={Activity} color="bg-green-500" />
          <StatCard title="Super Admins" value={stats.admins} icon={Shield} color="bg-purple-500" />
          <StatCard title="En attente" value={stats.pending} icon={Clock} color="bg-orange-500" />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">
              <Users className="h-4 w-4 mr-2" />
              Tous les utilisateurs
              {!usersLoading && <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">{users.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">
              <Clock className="h-4 w-4 mr-2" />
              En attente
              {!pendingLoading && pending.length > 0 && <Badge variant="destructive" className="ml-2">{pending.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {activeTab === 'all' && (
            <div className="flex gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <FilterDropdown value={roleFilter} onChange={setRoleFilter} />
            </div>
          )}
        </div>

        {/* All Users Tab */}
        <TabsContent value="all" className="mt-6">
          {usersLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonUserCard key={i} />)}</div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-3 stagger-animation">
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  index={index}
                  onViewDetails={() => openDetails(user)}
                  onEdit={() => openEditModal(user)}
                  onChangeRole={() => openRoleModal(user)}
                  onChangePassword={() => openPasswordModal(user)}
                  onDelete={() => openDeleteDialog(user)}
                  onApprove={user.is_approved === false ? () => handleApprove(user.id) : undefined}
                  isApproving={approveUser.isPending}
                />
              ))}
            </div>
          ) : searchQuery || roleFilter !== 'all' ? (
            <EmptyState
              icon={Search}
              title="Aucun resultat"
              description="Aucun utilisateur ne correspond a vos criteres de recherche."
              action={{ label: 'Effacer les filtres', onClick: () => { setSearchQuery(''); setRoleFilter('all'); } }}
            />
          ) : (
            <EmptyState icon={Users} title="Aucun utilisateur" description="Il n'y a pas encore d'utilisateurs enregistres." />
          )}
        </TabsContent>

        {/* Pending Users Tab */}
        <TabsContent value="pending" className="mt-6">
          {pendingLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonUserCard key={i} />)}</div>
          ) : pending.length > 0 ? (
            <div className="space-y-3 stagger-animation">
              {pending.map((user, index) => (
                <PendingUserCard
                  key={user.id}
                  user={user}
                  index={index}
                  onApprove={() => handleApprove(user.id)}
                  onReject={() => handleReject(user.id)}
                  isApproving={approveUser.isPending}
                  isRejecting={rejectUser.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Sparkles} title="Aucune demande en attente" description="Toutes les demandes d'inscription ont ete traitees. Bravo !" />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleCreateUser} isLoading={createUser.isPending} />

      <EditUserModal user={selectedUser} isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedUser(null); }} onSave={handleUpdateUser} isLoading={updateUser.isPending} />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedUserId(null); }}
        onEdit={(user) => { setShowDetailsModal(false); openEditModal(user); }}
        onChangeRole={(user) => { setShowDetailsModal(false); openRoleModal(user); }}
        onChangePassword={(user) => { setShowDetailsModal(false); openPasswordModal(user); }}
        onDelete={(user) => { setShowDetailsModal(false); openDeleteDialog(user); }}
      />

      <RoleModal user={selectedUser} isOpen={showRoleModal} onClose={() => { setShowRoleModal(false); setSelectedUser(null); }} onSave={handleUpdateRole} isLoading={updateRole.isPending} />

      <ChangePasswordModal user={selectedUser} isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setSelectedUser(null); }} onSave={handleChangePassword} isLoading={changePassword.isPending} />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setSelectedUser(null); }}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        description={`Etes-vous sur de vouloir supprimer ${selectedUser?.display_name || selectedUser?.username || selectedUser?.email} ? Cette action est irreversible et toutes les donnees associees seront perdues.`}
        confirmText="Supprimer"
        isLoading={deleteUser.isPending}
        variant="destructive"
      />
    </div>
  );
};

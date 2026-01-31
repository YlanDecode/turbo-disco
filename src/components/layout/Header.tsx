import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  UserPlus,
  UserCheck,
  UserX,
  FolderPlus,
  FileUp,
  MessageSquare,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import type { NotificationType, WebSocketNotification } from '@/api/types';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

// Icônes par type de notification
const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  user_signup: UserPlus,
  user_approved: UserCheck,
  user_rejected: UserX,
  project_created: FolderPlus,
  file_uploaded: FileUp,
  conversation_started: MessageSquare,
  system_alert: AlertTriangle,
};

// Couleurs par type de notification
const notificationColors: Record<NotificationType, string> = {
  user_signup: 'text-blue-500',
  user_approved: 'text-green-500',
  user_rejected: 'text-red-500',
  project_created: 'text-purple-500',
  file_uploaded: 'text-orange-500',
  conversation_started: 'text-cyan-500',
  system_alert: 'text-yellow-500',
};

// Formater le temps relatif
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString();
};

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenuButton = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { clearProject } = useProjectContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Utiliser le hook de notifications WebSocket
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleLogout = async () => {
    try {
      clearProject();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleNotificationClick = (notification: WebSocketNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder={t('nav.searchPlaceholder')}
              className="w-64 pl-10"
              aria-label={t('common.search')}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <LanguageSwitcher variant="icon" />

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
            aria-label={t('nav.notifications')}
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <Bell className={cn('h-5 w-5', isConnected && 'text-foreground')} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg animate-in fade-in-50 slide-in-from-top-2" role="dialog" aria-label={t('notifications.title')}>
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="font-semibold">{t('notifications.title')}</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={markAllAsRead}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        {t('notifications.markAllRead', 'Tout lire')}
                      </Button>
                    )}
                    <Badge variant="secondary">{unreadCount}</Badge>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 10).map((notif) => {
                      const Icon = notificationIcons[notif.type] || Bell;
                      const iconColor = notificationColors[notif.type] || 'text-muted-foreground';

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn(
                            'flex items-start gap-3 border-b p-4 last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors',
                            !notif.read && 'bg-muted/30'
                          )}
                        >
                          <div className={cn('mt-0.5 shrink-0', iconColor)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm', !notif.read && 'font-medium')}>{notif.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notif.created_at)}</p>
                          </div>
                          {!notif.read && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('notifications.empty', 'Aucune notification')}</p>
                    </div>
                  )}
                </div>
                {notifications.length > 10 && (
                  <div className="border-t p-2">
                    <Button variant="ghost" className="w-full" size="sm">
                      {t('notifications.viewAll', 'Voir toutes les notifications')}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
            </div>
            <span className="hidden md:inline-block max-w-[150px] truncate">
              {user?.display_name || user?.username || t('common.user')}
            </span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-card shadow-lg" role="menu">
                <div className="border-b p-4">
                  <p className="font-medium truncate">{user?.display_name || user?.username || t('common.user')}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email || user?.username}</p>
                  <Badge variant="outline" className="mt-2">
                    {user?.role || 'user'}
                  </Badge>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    role="menuitem"
                  >
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t('nav.myProfile')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    role="menuitem"
                  >
                    <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t('common.settings')}
                  </Button>
                </div>
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t('auth.logout')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

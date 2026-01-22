import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenuButton = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
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

  // Notifications with translations
  const notifications = [
    { id: 1, title: t('notifications.newUserPending'), time: t('activity.timeAgo.minutesAgo', { count: 5 }), unread: true },
    { id: 2, title: t('notifications.webhookTriggered'), time: t('activity.timeAgo.hoursAgo', { count: 1 }), unread: true },
    { id: 3, title: t('notifications.systemUpdate'), time: t('activity.timeAgo.yesterday'), unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

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
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadCount}
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
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg" role="dialog" aria-label={t('notifications.title')}>
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="font-semibold">{t('notifications.title')}</h3>
                  <Badge variant="secondary">{unreadCount} {t('notifications.new')}</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex items-start gap-3 border-b p-4 last:border-b-0',
                        notif.unread && 'bg-muted/50'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          notif.unread ? 'bg-primary' : 'bg-transparent'
                        )}
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-2">
                  <Button variant="ghost" className="w-full" size="sm">
                    {t('notifications.viewAll')}
                  </Button>
                </div>
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
              {user?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
            </div>
            <span className="hidden md:inline-block max-w-[150px] truncate">
              {user?.full_name || user?.email || t('common.user')}
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
                  <p className="font-medium truncate">{user?.full_name || t('common.user')}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
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

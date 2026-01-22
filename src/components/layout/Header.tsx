import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenuButton = false }) => {
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

  // Fake notifications for demo
  const notifications = [
    { id: 1, title: 'Nouvel utilisateur en attente', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Webhook déclenché', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Mise à jour du système', time: 'Hier', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="w-64 pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
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
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="font-semibold">Notifications</h3>
                  <Badge variant="secondary">{unreadCount} nouvelles</Badge>
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
                    Voir toutes les notifications
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
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {user?.full_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
            </div>
            <span className="hidden md:inline-block max-w-[150px] truncate">
              {user?.full_name || user?.email || 'Utilisateur'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-card shadow-lg">
                <div className="border-b p-4">
                  <p className="font-medium truncate">{user?.full_name || 'Utilisateur'}</p>
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
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                </div>
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
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

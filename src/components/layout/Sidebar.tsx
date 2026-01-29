import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Users,
  FileText,
  Key,
  Webhook,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Bot,
  Database,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.chat', href: '/chat', icon: MessageSquare },
  { labelKey: 'nav.projects', href: '/projects', icon: FolderKanban },
  { labelKey: 'nav.rag', href: '/rag', icon: Database },
];

const adminNavItems: NavItem[] = [
  { labelKey: 'nav.users', href: '/admin/users', icon: Users, adminOnly: true },
  { labelKey: 'nav.auditLogs', href: '/admin/audit-logs', icon: FileText, adminOnly: true },
];

const settingsNavItems: NavItem[] = [
  { labelKey: 'nav.apiKeys', href: '/settings/api-keys', icon: Key },
  { labelKey: 'nav.webhooks', href: '/settings/webhooks', icon: Webhook },
  { labelKey: 'nav.analytics', href: '/settings/analytics', icon: BarChart3 },
  { labelKey: 'nav.notifications', href: '/settings/notifications', icon: Bell },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const renderNavItem = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return null;

    const Icon = item.icon;
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

    return (
      <NavLink
        key={item.href}
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            : 'text-muted-foreground'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {!collapsed && (
          <>
            <span className="flex-1">{t(item.labelKey)}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      role="navigation"
      aria-label={t('nav.main')}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          {!collapsed && <span className="text-lg font-bold">ChatAdmin</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Main */}
        <div className="space-y-1" role="group" aria-label={t('nav.main')}>
          {!collapsed && (
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              {t('nav.main')}
            </h4>
          )}
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="space-y-1" role="group" aria-label={t('nav.administration')}>
            {!collapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                {t('nav.administration')}
              </h4>
            )}
            {adminNavItems.map(renderNavItem)}
          </div>
        )}

        {/* Settings */}
        <div className="space-y-1" role="group" aria-label={t('nav.configuration')}>
          {!collapsed && (
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              {t('nav.configuration')}
            </h4>
          )}
          {settingsNavItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Toggle button */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : t('nav.collapse')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('nav.collapse')}
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

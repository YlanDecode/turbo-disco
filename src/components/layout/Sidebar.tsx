import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Users,
  FileText,
  Settings,
  Key,
  Webhook,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Projets', href: '/projects', icon: FolderKanban },
];

const adminNavItems: NavItem[] = [
  { label: 'Utilisateurs', href: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Logs d\'audit', href: '/admin/audit-logs', icon: FileText, adminOnly: true },
];

const settingsNavItems: NavItem[] = [
  { label: 'Clés API', href: '/settings/api-keys', icon: Key },
  { label: 'Webhooks', href: '/settings/webhooks', icon: Webhook },
  { label: 'Analytics', href: '/settings/analytics', icon: BarChart3 },
  { label: 'Paramètres', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
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
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            : 'text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
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
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold">ChatAdmin</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Main */}
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Principal
            </h4>
          )}
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                Administration
              </h4>
            )}
            {adminNavItems.map(renderNavItem)}
          </div>
        )}

        {/* Settings */}
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Configuration
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
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Réduire
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

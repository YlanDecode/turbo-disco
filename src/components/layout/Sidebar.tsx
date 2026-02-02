import React, { memo, useCallback, useMemo } from 'react';
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
  BarChart3,
  Bell,
  Bot,
  Database,
  type LucideIcon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  requiredRole?: 'super_admin';
}

interface NavGroup {
  id: string;
  labelKey: string;
  items: NavItem[];
  requiredRole?: 'super_admin';
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ============================================================================
// Configuration
// ============================================================================

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    labelKey: 'nav.main',
    items: [
      { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
      { labelKey: 'nav.chat', href: '/chat', icon: MessageSquare },
      { labelKey: 'nav.projects', href: '/projects', icon: FolderKanban },
      { labelKey: 'nav.rag', href: '/rag', icon: Database },
    ],
  },
  {
    id: 'admin',
    labelKey: 'nav.administration',
    requiredRole: 'super_admin',
    items: [
      { labelKey: 'nav.users', href: '/admin/users', icon: Users },
      { labelKey: 'nav.auditLogs', href: '/admin/audit-logs', icon: FileText },
    ],
  },
  {
    id: 'settings',
    labelKey: 'nav.configuration',
    items: [
      { labelKey: 'nav.apiKeys', href: '/settings/api-keys', icon: Key },
      { labelKey: 'nav.analytics', href: '/settings/analytics', icon: BarChart3 },
      { labelKey: 'nav.notifications', href: '/settings/notifications', icon: Bell },
    ],
  },
];

// ============================================================================
// Sub-components
// ============================================================================

interface NavItemLinkProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const NavItemLink = memo<NavItemLinkProps>(({ item, isActive, collapsed, onClick }) => {
  const { t } = useTranslation();
  const Icon = item.icon;

  const linkContent = (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-accent/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
          : 'text-muted-foreground hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/30" />
      )}

      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-transform duration-200",
          !isActive && "group-hover:scale-110"
        )}
        aria-hidden="true"
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{t(item.labelKey)}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <Badge
              variant={isActive ? "secondary" : "default"}
              className={cn(
                "ml-auto shrink-0 text-xs",
                isActive && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {t(item.labelKey)}
          {item.badge !== undefined && item.badge > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
});

NavItemLink.displayName = 'NavItemLink';

interface NavGroupSectionProps {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}

const NavGroupSection = memo<NavGroupSectionProps>(({ group, collapsed, pathname, onNavigate }) => {
  const { t } = useTranslation();

  const isItemActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + '/'),
    [pathname]
  );

  return (
    <div className="space-y-1" role="group" aria-label={t(group.labelKey)}>
      {!collapsed && (
        <h4 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {t(group.labelKey)}
        </h4>
      )}
      {collapsed && <div className="mx-auto my-2 h-px w-6 bg-border" />}
      {group.items.map((item) => (
        <NavItemLink
          key={item.href}
          item={item}
          isActive={isItemActive(item.href)}
          collapsed={collapsed}
          onClick={onNavigate}
        />
      ))}
    </div>
  );
});

NavGroupSection.displayName = 'NavGroupSection';

// ============================================================================
// Sidebar Content (shared between desktop and mobile)
// ============================================================================

interface SidebarContentProps {
  collapsed: boolean;
  visibleGroups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
}

const SidebarContent = memo<SidebarContentProps>(({
  collapsed,
  visibleGroups,
  pathname,
  onNavigate,
  onToggle,
  showToggle = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <NavLink to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Bot className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight">ChatAdmin</span>
              <span className="text-[10px] text-muted-foreground">v1.0</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3 scrollbar-thin">
        {visibleGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Footer - Toggle button */}
      {showToggle && (
        <div className="border-t p-3">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full gap-2 text-muted-foreground hover:text-foreground',
                  collapsed ? 'justify-center' : 'justify-start'
                )}
                onClick={onToggle}
                aria-label={collapsed ? t('nav.expand', 'Agrandir') : t('nav.collapse')}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <>
                    <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">{t('nav.collapse')}</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {t('nav.expand', 'Agrandir')}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      )}
    </div>
  );
});

SidebarContent.displayName = 'SidebarContent';

// ============================================================================
// Main Component
// ============================================================================

export const Sidebar: React.FC<SidebarProps> = memo(({
  collapsed,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const userRole = useAuthStore((state) => state.user?.role);

  // Filter groups based on user role
  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.filter((group) => {
      if (!group.requiredRole) return true;
      if (group.requiredRole === 'super_admin') return userRole === 'super_admin';
      return false;
    });
  }, [userRole]);

  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const handleMobileNavigate = useCallback(() => {
    onMobileClose?.();
  }, [onMobileClose]);

  // Mobile: Render Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('nav.main')}</SheetTitle>
          </SheetHeader>
          <SidebarContent
            collapsed={false}
            visibleGroups={visibleGroups}
            pathname={location.pathname}
            onNavigate={handleMobileNavigate}
            showToggle={false}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render fixed sidebar
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
      role="navigation"
      aria-label={t('nav.main')}
    >
      <SidebarContent
        collapsed={collapsed}
        visibleGroups={visibleGroups}
        pathname={location.pathname}
        onToggle={handleToggle}
        showToggle={true}
      />
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

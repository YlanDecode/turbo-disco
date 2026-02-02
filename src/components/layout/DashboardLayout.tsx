import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DashboardLayoutProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  requireAuth = true,
  requireAdmin = false,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'super_admin';

  // Initialize theme from localStorage
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auth guard
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate]);

  // Admin guard
  useEffect(() => {
    if (!isLoading && requireAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isLoading, requireAdmin, isAdmin, navigate]);

  // Handlers
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileSidebarOpen(prev => !prev);
  }, []);

  const handleMobileSidebarClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Chargement..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Sidebar - Mobile (Sheet) */}
      <Sidebar
        collapsed={false}
        onToggle={handleSidebarToggle}
        isMobile={true}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />

      {/* Main content */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
        )}
      >
        <Header
          showMenuButton
          onMenuToggle={handleMobileMenuToggle}
        />

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

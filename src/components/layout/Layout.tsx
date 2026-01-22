import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, FolderKanban, FileText, Settings, LogOut, Menu, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { projectId, clearProject } = useProjectContext();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Chat', href: '/chat', icon: MessageSquare, requiresProject: true },
    { name: 'Projets', href: '/projects', icon: FolderKanban, requiresProject: false },
    { name: 'RAG', href: '/rag', icon: FileText, requiresProject: true },
    { name: 'Paramètres', href: '/settings', icon: Settings, requiresProject: false },
  ];

  const handleLogout = async () => {
    try {
      clearProject();
      await logout();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                {import.meta.env.VITE_APP_NAME || 'Assistant'}
              </span>
            </Link>
            {isAuthenticated && (
              <nav className="flex items-center space-x-6 text-sm font-medium">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  const isDisabled = item.requiresProject && !projectId;
                  return (
                    <Link
                      key={item.name}
                      to={isDisabled ? '#' : item.href}
                      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                      className={cn(
                        'transition-colors',
                        isDisabled
                          ? 'text-foreground/30 cursor-not-allowed'
                          : 'hover:text-foreground/80',
                        isActive && !isDisabled ? 'text-foreground' : !isDisabled && 'text-foreground/60'
                      )}
                      title={isDisabled ? 'Sélectionnez un projet d\'abord' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </button>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                {user && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t">
            <nav className="container py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                const isDisabled = item.requiresProject && !projectId;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={isDisabled ? '#' : item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                      isDisabled
                        ? 'text-foreground/30 cursor-not-allowed'
                        : isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground/60 hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

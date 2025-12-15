import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, FolderKanban, FileText, Settings, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { projectId, clearProject } = useProjectContext();
  const location = useLocation();

  const navigation = [
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Projets', href: '/projects', icon: FolderKanban },
    { name: 'RAG', href: '/rag', icon: FileText },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    clearProject();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              {import.meta.env.VITE_APP_NAME || 'Assistant'}
            </span>
          </Link>
          {projectId && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'transition-colors hover:text-foreground/80',
                      isActive ? 'text-foreground' : 'text-foreground/60'
                    )}
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
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {projectId && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

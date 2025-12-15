import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ChatPage: React.FC = () => {
  const { isAuthenticated } = useProjectContext();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <h2 className="text-2xl font-bold">Authentification requise</h2>
              <p className="text-muted-foreground text-center">
                Vous devez sélectionner ou créer un projet avant d'utiliser le chat.
              </p>
              <div className="flex gap-2">
                <Link to="/projects/new">
                  <Button>Créer un projet</Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline">Sélectionner un projet</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChatInterface />
    </div>
  );
};

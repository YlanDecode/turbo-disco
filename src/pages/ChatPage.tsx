import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateConversation } from '@/api/hooks/useConversations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated: isUserAuthenticated } = useAuth();
  const { projectId, isAuthenticated: isProjectAuthenticated, projectData } = useProjectContext();
  const createConversation = useCreateConversation();

  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isUserAuthenticated, navigate]);

  const handleSelectConversation = useCallback((id: string) => {
    navigate(`/chat/${id}`);
  }, [navigate]);

  const handleNewChat = useCallback(async () => {
    try {
      const newConv = await createConversation.mutateAsync(undefined);
      navigate(`/chat/${newConv.id}`);
    } catch {
      console.error('Impossible de créer une conversation');
    }
  }, [createConversation, navigate]);

  if (!isUserAuthenticated) {
    return null;
  }

  if (!projectId || !isProjectAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>{t('chat.noProjectSelected', 'Aucun projet sélectionné')}</CardTitle>
            <CardDescription>
              {t('chat.selectProjectFirst', 'Sélectionnez un projet pour commencer à discuter.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/projects')}>
              {t('chat.goToProjects', 'Voir les projets')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col -m-4 lg:-m-6 h-[calc(100vh-4rem)]">
      {/* Project name header */}
      {projectData && (
        <div className="border-b px-4 py-2 bg-muted/30 shrink-0">
          <span className="text-sm text-muted-foreground">
            {t('chat.currentProject', 'Projet')}: <span className="font-medium text-foreground">{projectData.name}</span>
          </span>
        </div>
      )}

      {/* Chat interface */}
      <div className="flex flex-1 min-h-0">
        <aside className="w-72 hidden md:flex flex-col border-r bg-card shrink-0">
          <ConversationSidebar
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </aside>
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex-1 min-h-0">
            <ChatInterface conversationId={conversationId} />
          </div>
        </main>
      </div>
    </div>
  );
};

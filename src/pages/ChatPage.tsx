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
    <div className="flex h-full flex-col">
      {/* Project name header */}
      {projectData && (
        <div className="border-b px-4 py-2 bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {t('chat.currentProject', 'Projet')}: <span className="font-medium text-foreground">{projectData.name}</span>
          </span>
        </div>
      )}

      {/* Chat interface */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 hidden md:block border-r">
          <ConversationSidebar
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto h-full">
            <ChatInterface conversationId={conversationId} />
          </div>
        </main>
      </div>
    </div>
  );
};

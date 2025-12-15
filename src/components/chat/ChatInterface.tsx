import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStream } from '@/api/hooks/useChat';
import { useConversation, useCreateConversation } from '@/api/hooks/useConversations';
import { useProject } from '@/api/hooks/useProjects';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import type { MessageResponse } from '@/api/types';

interface ChatInterfaceProps {
  conversationId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId: initialConvId }) => {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [contexts, setContexts] = useState<string[]>([]);
  const [pendingUserMessage, setPendingUserMessage] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);

  const { sendMessage, isStreaming, error, cancel } = useChatStream();
  const createConversation = useCreateConversation();
  const { projectId, projectData, setProjectData } = useProjectContext();

  const { data: conversation, isLoading, refetch } = useConversation(conversationId || '', 50);
  
  // Récupérer les données du projet actif
  const { data: project } = useProject(projectId || '');

  // Mettre à jour projectData dans le contexte quand les données sont chargées
  useEffect(() => {
    if (project && !projectData) {
      setProjectData(project);
    }
  }, [project, projectData, setProjectData]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    }
  }, [error]);

  const handleSendMessage = async (message: string) => {
    // Créer une conversation si nécessaire
    let convId = conversationId;
    if (!convId) {
      try {
        const newConv = await createConversation.mutateAsync(undefined);
        convId = newConv.id;
        setConversationId(convId);
      } catch (err) {
        toast.error('Impossible de créer une conversation');
        return;
      }
    }

    // Stocker le message de l'utilisateur pour l'affichage immédiat
    setPendingUserMessage(message);
    setStreamingMessage('');
    setContexts([]);
    
    // Afficher le skeleton après 300ms si le streaming n'a pas commencé
    const skeletonTimer = setTimeout(() => {
      if (!streamingMessage) {
        setShowSkeleton(true);
      }
    }, 300);

    await sendMessage(message, {
      conversationId: convId,
      k: 3,
      maxTokens: 600,
      onToken: (token) => {
        clearTimeout(skeletonTimer);
        setShowSkeleton(false);
        setStreamingMessage((prev) => prev + token);
      },
      onMeta: (meta) => {
        setContexts(meta.contexts);
      },
      onComplete: () => {
        clearTimeout(skeletonTimer);
        // Nettoyer immédiatement le streaming
        setShowSkeleton(false);
        setStreamingMessage('');
        setContexts([]);
        setPendingUserMessage('');
        // Recharger la conversation pour afficher les nouveaux messages
        refetch();
      },
    });
  };

  const messages: MessageResponse[] = conversation?.messages || [];

  // Créer un message temporaire pour l'utilisateur si un message est en attente
  const displayMessages = [...messages];
  if (pendingUserMessage && !streamingMessage) {
    displayMessages.push({
      id: 'temp-user',
      conversation_id: conversationId || '',
      role: 'user',
      content: pendingUserMessage,
      created_at: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto w-full border rounded-2xl shadow-xl bg-background overflow-hidden">
      <div className="border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <h2 className="font-semibold text-lg">
          {conversationId ? `Conversation` : 'Nouvelle conversation'}
        </h2>
        {conversationId && (
          <p className="text-xs text-muted-foreground mt-1">ID: {conversationId.substring(0, 8)}...</p>
        )}
      </div>

      <MessageList
        messages={displayMessages}
        isLoading={isLoading}
        streamingMessage={streamingMessage}
        contexts={contexts.length > 0 ? contexts : undefined}
        showUserPending={!!pendingUserMessage && !!streamingMessage}
        pendingUserMessage={pendingUserMessage}
        showSkeleton={showSkeleton}
        projectData={projectData}
      />

      <div className="border-t px-6 py-5 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          isLoading={isStreaming}
          onCancel={isStreaming ? cancel : undefined}
        />
      </div>
    </div>
  );
};

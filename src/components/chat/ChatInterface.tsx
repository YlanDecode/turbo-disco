import React, { useState, useEffect, useMemo } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStream } from '@/api/hooks/useChat';
import { useConversation } from '@/api/hooks/useConversations';
import { useProject } from '@/api/hooks/useProjects';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import type { MessageResponse } from '@/api/types';

interface ChatInterfaceProps {
  conversationId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId: initialConvId }) => {
  // Use initialConvId directly as dependency to reset states
  const [streamingMessage, setStreamingMessage] = useState('');
  const [contexts, setContexts] = useState<string[]>([]);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageResponse[]>([]);

  const { sendMessage, isStreaming, error, cancel } = useChatStream();
  const { projectId, projectData, setProjectData } = useProjectContext();

  const { data: conversation, isLoading, refetch } = useConversation(initialConvId || '', 50);
  const { data: project } = useProject(projectId || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setOptimisticMessages([]);
      setStreamingMessage('');
      setContexts([]);
      setShowSkeleton(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [initialConvId]);

  useEffect(() => {
    if (project && !projectData) {
      setProjectData(project);
    }
  }, [project, projectData, setProjectData]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Erreur lors de l'envoi du message");
    }
  }, [error]);

  const displayedMessages = useMemo(() => {
    return [...(conversation?.messages || []), ...optimisticMessages];
  }, [conversation?.messages, optimisticMessages]);

  const handleSendMessage = async (message: string) => {
    const tempUserMessage: MessageResponse = {
      id: `temp-${Date.now()}`,
      conversation_id: initialConvId || 'new',
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    setOptimisticMessages((prev) => [...prev, tempUserMessage]);

    setStreamingMessage('');
    setContexts([]);
    setShowSkeleton(false);

    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, 300);

    await sendMessage(message, {
      conversationId: initialConvId,
      k: 3,
      maxTokens: 600,
      onToken: (token) => {
        clearTimeout(skeletonTimer);
        setShowSkeleton(false);
        setStreamingMessage((prev) => prev + token);
      },
      onMeta: (meta) => {
        setContexts(meta.contexts || []);
      },
      onComplete: () => {
        clearTimeout(skeletonTimer);
        setShowSkeleton(false);
        setStreamingMessage('');
        setContexts([]);
        setOptimisticMessages([]);
        refetch();
      },
    });
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-2xl shadow-xl bg-background overflow-hidden">
      <div className="border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <h2 className="font-semibold text-lg">
          {conversation?.id ? 'Conversation' : 'Nouvelle conversation'}
        </h2>
        {conversation?.id && (
          <p className="text-xs text-muted-foreground mt-1">
            ID: {conversation.id.substring(0, 8)}...
          </p>
        )}
      </div>

      <MessageList
        messages={displayedMessages}
        isLoading={isLoading}
        streamingMessage={streamingMessage}
        contexts={contexts.length > 0 ? contexts : undefined}
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
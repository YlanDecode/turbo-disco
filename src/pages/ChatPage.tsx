import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useCreateConversation } from '@/api/hooks/useConversations';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useProjectContext();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSelectConversation = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const createConversation = useCreateConversation();

  const handleNewChat = async () => {
    try {
      const newConv = await createConversation.mutateAsync(undefined);
      navigate(`/chat/${newConv.id}`);
    } catch {
      console.error('Impossible de créer une conversation');
    }
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-full">
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
  );
};
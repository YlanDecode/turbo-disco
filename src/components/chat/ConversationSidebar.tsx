import React from 'react';
import { Plus, MessageSquare, Trash2, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConversations, useDeleteConversation } from '@/api/hooks/useConversations';
import { type ConversationResponse } from '@/api/types';

interface ConversationSidebarProps {
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  className = "",
}) => {
  // Récupérer les conversations (limité aux 50 dernières par défaut)
  const { data, isLoading } = useConversations({ limit: 50 });
  const deleteConversation = useDeleteConversation();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      await deleteConversation.mutateAsync(id);
      if (currentConversationId === id) {
        onNewChat();
      }
    }
  };

  // Simplified assignment for conversations
  const conversations: ConversationResponse[] = data?.conversations || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex flex-col h-full border-r bg-muted/10 ${className}`}>
      <div className="p-4 border-b">
        <Button 
          onClick={onNewChat} 
          className="w-full justify-start gap-2" 
          variant="default"
        >
          <Plus className="h-4 w-4" />
          Nouveau chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Aucune conversation
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`
                  group flex items-center justify-between p-3 rounded-lg text-sm transition-colors cursor-pointer
                  ${currentConversationId === conv.id 
                    ? "bg-accent text-accent-foreground font-medium bg-slate-100 dark:bg-slate-800" 
                    : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900"}
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className="truncate">
                      {formatDate(conv.created_at) || "Nouvelle conversation"}
                    </span>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      {conv.username && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {conv.username}
                        </span>
                      )}
                      <span>{conv.message_count} msg</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 
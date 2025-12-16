import React, { useRef, useEffect, useState } from 'react';
import { MessageItem } from './MessageItem';
import type { MessageResponse, ProjectResponse } from '@/api/types';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageResponse[];
  isLoading?: boolean;
  streamingMessage?: string;
  contexts?: string[];
  showUserPending?: boolean;
  pendingUserMessage?: string;
  showSkeleton?: boolean;
  projectData?: ProjectResponse | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  streamingMessage,
  contexts,
  showSkeleton,
  projectData,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());

  // Extraire les infos du projet avec typage explicite
  const cfg = projectData?.config as { assistant_name?: string; company_name?: string } | undefined;
  const assistantName: string = cfg?.assistant_name ?? 'Assistant';
  const companyName: string = cfg?.company_name ?? projectData?.name ?? 'Assistant';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const toggleContexts = (messageId: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !streamingMessage && (
        <div className="flex items-center justify-center h-full text-center text-muted-foreground">
          <div className="max-w-md">
            <p className="text-2xl font-semibold mb-3">Bienvenue chez {companyName} !</p>
            <p className="text-base">Posez votre question pour découvrir nos services.</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          showContexts={expandedContexts.has(message.id)}
          onToggleContexts={() => toggleContexts(message.id)}
          assistantName={assistantName}
        />
      ))}

      {showSkeleton && (
        <div className="flex gap-4 max-w-[85%]">
          <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="flex-1 space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-2xl rounded-tl-sm shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{assistantName}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Réflexion en cours...
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-muted/50 rounded animate-pulse w-4/6"></div>
            </div>
          </div>
        </div>
      )}

      {streamingMessage && (
        <div className="flex gap-4 max-w-[85%]">
          <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="flex-1 space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-2xl rounded-tl-sm shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{assistantName}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                En train d'écrire...
              </span>
            </div>
            <div className="text-base leading-relaxed whitespace-pre-wrap">{streamingMessage}</div>
            {contexts && contexts.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {contexts.length} source{contexts.length > 1 ? 's' : ''} consultée{contexts.length > 1 ? 's' : ''}
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                  {contexts.map((context, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-muted">
                      {context.substring(0, 200)}{context.length > 200 ? '...' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && !streamingMessage && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

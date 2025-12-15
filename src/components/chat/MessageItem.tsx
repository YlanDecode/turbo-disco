import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/helpers';
import { Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import type { MessageResponse } from '@/api/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatMarkdownText } from '@/utils/markdown';

interface MessageItemProps {
  message: MessageResponse;
  contexts?: string[];
  showContexts?: boolean;
  onToggleContexts?: () => void;
  assistantName?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  contexts,
  showContexts,
  onToggleContexts,
  assistantName = 'Assistant',
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-4',
        isUser && 'justify-end',
        isAssistant && 'justify-start'
      )}
    >
      {isAssistant && (
        <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div className={cn(
        'flex-1 max-w-[85%] space-y-3',
        isUser && 'bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-2xl rounded-tr-sm shadow-md',
        isAssistant && 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-2xl rounded-tl-sm shadow-sm'
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-semibold text-base',
            isUser && 'text-blue-50',
            isAssistant && 'text-foreground'
          )}>
            {isUser ? 'Vous' : assistantName}
          </span>
          <span className={cn(
            'text-xs',
            isUser && 'text-blue-100',
            isAssistant && 'text-muted-foreground'
          )}>
            {formatRelativeTime(message.created_at)}
          </span>
        </div>

        <div className={cn(
          'text-base leading-relaxed prose prose-sm max-w-none',
          isUser && 'text-white prose-invert',
          isAssistant && 'prose-blue'
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({children}) => <ul className="mb-3 ml-4 list-disc">{children}</ul>,
              ol: ({children}) => <ol className="mb-3 ml-4 list-decimal">{children}</ol>,
              li: ({children}) => <li className="mb-1">{children}</li>,
              h1: ({children}) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
              h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-2 first:mt-0">{children}</h3>,
              strong: ({children}) => <strong className="font-semibold">{children}</strong>,
              code: ({children}) => <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm">{children}</code>,
              pre: ({children}) => <pre className="bg-black/10 dark:bg-white/10 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
            }}
          >
            {formatMarkdownText(message.content)}
          </ReactMarkdown>
        </div>

        {contexts && contexts.length > 0 && (
          <div className="mt-4 space-y-3">
            <button
              onClick={onToggleContexts}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-black/20"
            >
              {showContexts ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Masquer les sources ({contexts.length})
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Voir les sources ({contexts.length})
                </>
              )}
            </button>

            {showContexts && (
              <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                {contexts.map((context, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-muted">
                    {context}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

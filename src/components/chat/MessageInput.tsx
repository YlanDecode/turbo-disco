import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Square } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, isLoading, onCancel }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        ref={textareaRef}
        placeholder="Posez votre question... (Ctrl+Enter pour envoyer)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="min-h-[100px] max-h-[300px] resize-none pr-14 text-base rounded-xl border-2 focus:border-blue-500 transition-colors"
        rows={3}
      />
      {isLoading && onCancel ? (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          onClick={handleCancel}
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all"
          title="Arrêter la génération"
        >
          <Square className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled}
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      )}
    </form>
  );
};

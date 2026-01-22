import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CopyButtonProps {
  value: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  showText?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  className,
  variant = 'ghost',
  size = 'icon',
  showText = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copié dans le presse-papier');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('transition-all', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          {showText && <span className="ml-2">Copié!</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {showText && <span className="ml-2">Copier</span>}
        </>
      )}
    </Button>
  );
};

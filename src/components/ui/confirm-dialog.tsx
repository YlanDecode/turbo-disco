import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { Modal, ModalFooter } from './modal';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'destructive' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonVariant: 'destructive' as const,
  },
  destructive: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    buttonVariant: 'default' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonVariant: 'default' as const,
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  isLoading = false,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            config.iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <ModalFooter className="justify-center border-0 pt-6">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={config.buttonVariant}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'icon';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className,
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <div className={cn('flex gap-1', className)}>
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language === lang.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeLanguage(lang.code)}
            className="min-w-[60px]"
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.code.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('common.language')}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Languages className="h-5 w-5" />
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border bg-card shadow-lg"
              role="listbox"
              aria-label={t('common.language')}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                    'hover:bg-accent first:rounded-t-lg last:rounded-b-lg',
                    i18n.language === lang.code && 'bg-accent'
                  )}
                  role="option"
                  aria-selected={i18n.language === lang.code}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {i18n.language === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default: dropdown variant
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[120px] justify-between"
        aria-label={t('common.language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2">
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-full z-50 mt-1 w-full min-w-[120px] rounded-lg border bg-card shadow-lg"
            role="listbox"
            aria-label={t('common.language')}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent first:rounded-t-lg last:rounded-b-lg',
                  i18n.language === lang.code && 'bg-accent'
                )}
                role="option"
                aria-selected={i18n.language === lang.code}
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {i18n.language === lang.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

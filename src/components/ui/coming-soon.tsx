import React from 'react';
import { cn } from '@/lib/utils';
import { Construction, Rocket, Sparkles, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  features?: string[];
  className?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = 'Cette fonctionnalite est actuellement en cours de developpement.',
  icon: Icon = Construction,
  features,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[60vh] px-4', className)}>
      {/* Animated background elements */}
      <div className="relative">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Icon container */}
        <div className="relative">
          <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20 p-8 backdrop-blur-sm border border-primary/10">
            <div className="rounded-2xl bg-card p-6 shadow-xl">
              <Icon className="h-16 w-16 text-primary" />
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-3 -right-3 rounded-full bg-orange-500 p-2 shadow-lg animate-bounce">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 rounded-full bg-purple-500 p-2 shadow-lg animate-pulse">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 text-center max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-600 mb-4">
          <Rocket className="h-4 w-4" />
          En cours de developpement
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
        <p className="text-muted-foreground text-lg">{description}</p>

        {/* Feature list */}
        {features && features.length > 0 && (
          <div className="mt-8 text-left">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Fonctionnalites a venir :
            </p>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8 w-full max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progression</span>
            <span>Bientot disponible</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

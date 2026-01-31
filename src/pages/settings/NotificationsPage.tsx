import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useActivities,
  useUnreadCount,
  useMarkActivityRead,
  useMarkAllActivitiesRead,
} from '@/api/hooks/useActivities';
import type { Activity, ActivityType } from '@/api/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Bell,
  UserPlus,
  UserCheck,
  UserX,
  LogIn,
  FolderPlus,
  FolderCog,
  Trash2,
  FileUp,
  FileX,
  MessageSquare,
  MessageSquareOff,
  Key,
  RefreshCw,
  AlertTriangle,
  Database,
  XCircle,
  CheckCheck,
  Loader2,
  Filter,
} from 'lucide-react';

// Activity type configuration
const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string; bgColor: string }> = {
  user_signup: { icon: UserPlus, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  user_approved: { icon: UserCheck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  user_rejected: { icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  user_login: { icon: LogIn, color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
  project_created: { icon: FolderPlus, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  project_updated: { icon: FolderCog, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  project_deleted: { icon: Trash2, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  file_uploaded: { icon: FileUp, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  file_deleted: { icon: FileX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  conversation_started: { icon: MessageSquare, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  conversation_ended: { icon: MessageSquareOff, color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
  webhook_created: { icon: Bell, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  webhook_triggered: { icon: Bell, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  api_key_created: { icon: Key, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  api_key_rotated: { icon: RefreshCw, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  system_alert: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  rag_indexed: { icon: Database, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  rag_failed: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

// Activity Card Component
interface ActivityCardProps {
  activity: Activity;
  onMarkRead: (read: boolean) => void;
  isMarking: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onMarkRead, isMarking }) => {
  const config = activityConfig[activity.type] || { icon: Bell, color: 'text-muted-foreground', bgColor: 'bg-muted' };
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-all',
        !activity.read ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/50'
      )}
    >
      <div className={cn('rounded-xl p-2.5 shrink-0', config.bgColor)}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn('font-medium', !activity.read && 'text-foreground')}>
              {activity.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{activity.message}</p>
          </div>
          {!activity.read && (
            <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onMarkRead(!activity.read)}
            disabled={isMarking}
          >
            {isMarking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : activity.read ? (
              'Marquer non lu'
            ) : (
              'Marquer lu'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Filter tabs
type FilterTab = 'all' | 'unread';

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Queries
  const { data: activitiesData, isLoading, refetch } = useActivities({
    read: activeTab === 'unread' ? false : undefined,
    limit: 50,
  });
  const { data: unreadData } = useUnreadCount();

  // Mutations
  const markRead = useMarkActivityRead();
  const markAllRead = useMarkAllActivitiesRead();

  const activities = activitiesData?.activities || [];
  const unreadCount = unreadData?.count || 0;

  const handleMarkRead = async (activityId: string, read: boolean) => {
    setMarkingId(activityId);
    try {
      await markRead.mutateAsync({ activityId, data: { read } });
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('notifications.title', 'Notifications')}</h1>
            <p className="text-muted-foreground">
              {t('notifications.subtitle', 'Historique de vos activites et alertes')}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              {markAllRead.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Tout marquer lu
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('notifications.total', 'Total')}</CardDescription>
              <CardTitle className="text-2xl">{activitiesData?.pagination?.total || activities.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('notifications.unread', 'Non lues')}</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {unreadCount}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">Nouveau</Badge>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Toutes
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Non lues
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onMarkRead={(read) => handleMarkRead(activity.id, read)}
                    isMarking={markingId === activity.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title={t('notifications.empty', 'Aucune notification')}
                description={t('notifications.emptyDesc', 'Vous n\'avez pas encore de notifications.')}
              />
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onMarkRead={(read) => handleMarkRead(activity.id, read)}
                    isMarking={markingId === activity.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCheck}
                title={t('notifications.allRead', 'Tout est lu !')}
                description={t('notifications.allReadDesc', 'Vous avez lu toutes vos notifications.')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Users,
  FolderKanban,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
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
  MessageSquareOff,
  Key,
  RefreshCw,
  AlertTriangle,
  Database,
  XCircle,
  Check,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useProjects } from '@/api/hooks/useProjects';
import {
  useAnalyticsOverview,
  useAnalyticsTrends,
  useTopQuestions,
} from '@/api/hooks/useAnalytics';
import { useActivities, useMarkActivityRead } from '@/api/hooks/useActivities';
import type { ActivityType } from '@/api/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Activity type configuration for icons
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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const { projectId } = useProjectContext();

  // Fetch real data from API
  const { data: projectsData } = useProjects({ limit: 100 });
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview(30, projectId || undefined);
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends({ days: 7, granularity: 'day' }, projectId || undefined);
  const { data: topQuestions, isLoading: questionsLoading } = useTopQuestions({ days: 7, limit: 5 }, projectId || undefined);

  // Fetch recent activities
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({ limit: 4 });
  const markRead = useMarkActivityRead();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const recentActivities = activitiesData?.activities || [];

  const handleMarkRead = async (activityId: string) => {
    setMarkingId(activityId);
    try {
      await markRead.mutateAsync({ activityId, data: { read: true } });
    } finally {
      setMarkingId(null);
    }
  };

  // Transform trends data for chart
  const conversationData = trends?.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    count: trend.conversations,
    messages: trend.messages,
  })) || [];

  // Transform top questions data for chart
  const topQuestionsData = topQuestions?.map((q) => ({
    question: q.question.length > 30 ? q.question.substring(0, 30) + '...' : q.question,
    count: q.count,
  })) || [];

  // Calculate trend percentage (comparing this week to last week)
  const calculateTrend = () => {
    if (!trends || trends.length < 2) return null;
    const recent = trends.slice(-3).reduce((sum, t) => sum + t.conversations, 0);
    const older = trends.slice(0, 3).reduce((sum, t) => sum + t.conversations, 0);
    if (older === 0) return null;
    const change = ((recent - older) / older) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  const trend = calculateTrend();

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const hasProject = !!projectId;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('dashboard.welcome', { name: user?.display_name || user?.username || t('common.user') })}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.overview')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <FolderKanban className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('dashboard.myProjects')}
          </Button>
          <Button onClick={() => navigate('/chat')}>
            <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('dashboard.newChat')}
          </Button>
        </div>
      </div>

      {/* No project warning */}
      {!hasProject && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Sélectionnez un projet pour voir les statistiques détaillées
            </p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Statistics">
        <StatCard
          title={t('dashboard.conversations')}
          value={overviewLoading ? '...' : formatNumber(overview?.total_conversations || 0)}
          description={t('dashboard.totalThisMonth')}
          icon={MessageSquare}
          trend={trend || undefined}
        />
        <StatCard
          title={t('dashboard.activeUsers')}
          value={overviewLoading ? '...' : formatNumber(overview?.unique_users || 0)}
          description={t('dashboard.thisWeek')}
          icon={Users}
        />
        <StatCard
          title={t('dashboard.activeProjects')}
          value={projectsData?.projects?.filter(p => p.is_active).length.toString() || '0'}
          description={t('dashboard.inProgress')}
          icon={FolderKanban}
        />
        <StatCard
          title={t('dashboard.satisfactionRate')}
          value={overviewLoading ? '...' : `${Math.round(overview?.satisfaction_rate || 0)}%`}
          description={t('dashboard.basedOnFeedback')}
          icon={TrendingUp}
          trend={overview?.satisfaction_rate && overview.satisfaction_rate > 80
            ? { value: Math.round(overview.satisfaction_rate - 80), isPositive: true }
            : undefined
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversations chart */}
        <div className="rounded-lg border bg-card p-6" role="region" aria-label={t('dashboard.conversations')}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t('dashboard.conversations')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.last7Days')}</p>
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                )}
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </div>
            )}
          </div>
          <div className="h-64">
            {trendsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : conversationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Conversations"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Top questions chart */}
        <div className="rounded-lg border bg-card p-6" role="region" aria-label={t('dashboard.frequentQuestions')}>
          <div className="mb-4">
            <h3 className="font-semibold">{t('dashboard.frequentQuestions')}</h3>
            <p className="text-sm text-muted-foreground">{t('dashboard.top5ThisWeek')}</p>
          </div>
          <div className="h-64">
            {questionsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topQuestionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topQuestionsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis
                    dataKey="question"
                    type="category"
                    width={150}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity & Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="rounded-lg border bg-card p-6 lg:col-span-2" role="region" aria-label={t('dashboard.recentActivity')}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{t('dashboard.recentActivity')}</h3>
          </div>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const config = activityConfig[activity.type] || { icon: Bell, color: 'text-muted-foreground', bgColor: 'bg-muted' };
                const Icon = config.icon;
                return (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0",
                      !activity.read && "bg-primary/5 -mx-2 px-2 py-2 rounded-lg"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", config.bgColor)}>
                      <Icon className={cn("h-5 w-5", config.color)} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={cn("text-sm font-medium", !activity.read && "text-foreground")}>
                            {activity.title}
                          </p>
                          {activity.message && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {activity.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                        {!activity.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleMarkRead(activity.id)}
                            disabled={markingId === activity.id}
                            title="Marquer comme lu"
                          >
                            {markingId === activity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
          </div>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/settings/notifications')}>
            {t('dashboard.viewAllActivity')}
          </Button>
        </div>

        {/* Quick actions */}
        <div className="rounded-lg border bg-card p-6" role="region" aria-label={t('dashboard.quickActions')}>
          <h3 className="mb-4 font-semibold">{t('dashboard.quickActions')}</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/projects/new')}>
              <FolderKanban className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('dashboard.createProject')}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/chat')}>
              <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('dashboard.testChatbot')}
            </Button>
            {isAdmin && (
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/users')}>
                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('dashboard.manageUsers')}
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings/api-keys')}>
              {t('dashboard.manageApiKeys')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

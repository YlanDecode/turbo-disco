import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useAnalyticsOverview, useAnalyticsTrends, useTopQuestions } from '@/api/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Users,
  Clock,
  ThumbsUp,
  Minus,
  BarChart3,
  HelpCircle,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId, isAuthenticated, projectData } = useProjectContext();

  // Use individual analytics endpoints
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useAnalyticsOverview(7, projectId || undefined);
  const { data: trends, isLoading: trendsLoading } = useAnalyticsTrends({ days: 7, granularity: 'day' }, projectId || undefined);
  const { data: topQuestions, isLoading: questionsLoading } = useTopQuestions({ days: 7, limit: 5 }, projectId || undefined);

  const isLoading = overviewLoading || trendsLoading || questionsLoading;
  const error = overviewError;

  // Si pas de projet sélectionné
  if (!projectId || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>{t('analytics.noProject', 'Aucun projet sélectionné')}</CardTitle>
            <CardDescription>
              {t('analytics.selectProjectFirst', 'Sélectionnez un projet pour voir les analytics.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/projects')}>
              {t('analytics.goToProjects', 'Voir les projets')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('analytics.errorLoading', 'Impossible de charger les analytics')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe data extraction with defaults
  const safeOverview = overview || {
    total_conversations: 0,
    total_messages: 0,
    unique_users: 0,
    avg_response_time_ms: 0,
    avg_messages_per_conversation: 0,
    satisfaction_rate: 0,
    rag_usage_rate: 0,
  };

  // Safe arrays
  const safeTrends = Array.isArray(trends) ? trends : [];
  const safeTopQuestions = Array.isArray(topQuestions) ? topQuestions : [];

  // Calculate totals from trends if overview is missing data
  const calculatedOverview = {
    total_conversations: safeOverview.total_conversations || safeTrends.reduce((sum, t) => sum + (t.conversations || 0), 0),
    total_messages: safeOverview.total_messages || safeTrends.reduce((sum, t) => sum + (t.messages || 0), 0),
    unique_users: safeOverview.unique_users || 0,
    avg_response_time_ms: safeOverview.avg_response_time_ms || 0,
    satisfaction_rate: safeOverview.satisfaction_rate || 0,
  };

  // Satisfaction data (derived from overview if available)
  const satisfactionRate = calculatedOverview.satisfaction_rate || 0;

  // Icône de tendance (toujours stable pour l'instant car pas de données historiques)
  const TrendIcon = Minus;
  const trendColor = 'text-muted-foreground';

  // Formater le temps de réponse
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t('analytics.title', 'Analytics')}</h1>
          <p className="text-muted-foreground">
            {t('analytics.subtitle', 'Statistiques pour')} <span className="font-medium text-foreground">{projectData?.name}</span>
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.totalConversations', 'Conversations')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatedOverview.total_conversations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {calculatedOverview.total_messages.toLocaleString()} {t('analytics.messages', 'messages')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.uniqueUsers', 'Utilisateurs uniques')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculatedOverview.unique_users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {t('analytics.activeUsers', 'utilisateurs actifs')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.avgResponseTime', 'Temps de réponse')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatResponseTime(calculatedOverview.avg_response_time_ms)}</div>
              <p className="text-xs text-muted-foreground">
                {t('analytics.average', 'en moyenne')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.satisfaction', 'Satisfaction')}
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{satisfactionRate.toFixed(0)}%</span>
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('analytics.basedOnFeedback', 'basé sur les retours')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {t('analytics.topQuestions', 'Questions fréquentes')}
              </CardTitle>
              <CardDescription>
                {t('analytics.topQuestionsDesc', 'Les 5 questions les plus posées')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeTopQuestions.length > 0 ? (
                <div className="space-y-4">
                  {safeTopQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.question}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.count} {t('analytics.occurrences', 'occurrences')}
                        </p>
                      </div>
                      <Badge variant="secondary">{q.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('analytics.noQuestions', 'Aucune question enregistrée')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('analytics.recentTrends', 'Tendances récentes')}
              </CardTitle>
              <CardDescription>
                {t('analytics.recentTrendsDesc', 'Activité des derniers jours')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeTrends.length > 0 ? (
                <div className="space-y-3">
                  {safeTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(trend.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{trend.conversations}</span>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (trend.messages / Math.max(...safeTrends.map(t => t.messages), 1)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {trend.messages} msg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('analytics.noTrends', 'Aucune donnée disponible')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjects, useRotateApiKey, useRevokeApiKey, useRegenerateApiKey, useRevealApiKey } from '@/api/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw,
  Ban,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Clock,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/helpers';

export const ApiKeysPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: projectsData, isLoading, refetch } = useProjects({ limit: 100 });

  const rotateApiKey = useRotateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const regenerateApiKey = useRegenerateApiKey();
  const revealApiKey = useRevealApiKey();

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'rotate' | 'revoke' | 'regenerate';
    projectId: string;
    projectName: string;
  } | null>(null);

  const toggleKeyVisibility = (projectId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const handleCopyKey = async (projectId: string) => {
    try {
      // Révéler la clé via l'API puis la copier
      const response = await revealApiKey.mutateAsync(projectId);
      await navigator.clipboard.writeText(response.api_key);
      setCopiedId(projectId);
      toast.success(t('apiKeys.keyCopied'));
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error(t('apiKeys.errorCopy'));
    }
  };

  const handleRotateKey = async (projectId: string) => {
    try {
      await rotateApiKey.mutateAsync(projectId);
      toast.success(t('apiKeys.rotateSuccess'));
      setConfirmAction(null);
      refetch();
    } catch {
      toast.error(t('apiKeys.errorRotate'));
    }
  };

  const handleRevokeKey = async (projectId: string) => {
    try {
      await revokeApiKey.mutateAsync(projectId);
      toast.success(t('apiKeys.revokeSuccess'));
      setConfirmAction(null);
      refetch();
    } catch {
      toast.error(t('apiKeys.errorRevoke'));
    }
  };

  const handleRegenerateKey = async (projectId: string) => {
    try {
      await regenerateApiKey.mutateAsync(projectId);
      toast.success(t('apiKeys.regenerateSuccess'));
      setConfirmAction(null);
      refetch();
    } catch {
      toast.error(t('apiKeys.errorRegenerate'));
    }
  };

  const getActionDescription = (type: 'rotate' | 'revoke' | 'regenerate') => {
    switch (type) {
      case 'rotate':
        return t('apiKeys.rotateDescription');
      case 'revoke':
        return t('apiKeys.revokeDescription');
      case 'regenerate':
        return t('apiKeys.regenerateDescription');
    }
  };

  const getActionWarning = (type: 'rotate' | 'revoke' | 'regenerate') => {
    switch (type) {
      case 'rotate':
        return t('apiKeys.rotateWarning');
      case 'revoke':
        return t('apiKeys.revokeWarning');
      case 'regenerate':
        return t('apiKeys.regenerateWarning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6" />
          {t('apiKeys.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('apiKeys.subtitle')}
        </p>
      </div>

      {/* Security notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
        <CardContent className="flex items-start gap-3 pt-6">
          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium">{t('apiKeys.securityNotice')}</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
              <li>{t('apiKeys.securityTip1')}</li>
              <li>{t('apiKeys.securityTip2')}</li>
              <li>{t('apiKeys.securityTip3')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Projects list with API keys */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projectsData?.projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('apiKeys.noProjects')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projectsData?.projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {project.name}
                      <Badge variant={project.is_active ? 'default' : 'secondary'}>
                        {project.is_active ? t('apiKeys.active') : t('apiKeys.inactive')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {t('apiKeys.createdAt')}: {formatDate(project.created_at)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key display */}
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 font-mono text-sm">
                      {visibleKeys[project.id] ? (
                        <span className="break-all">{project.api_key}</span>
                      ) : (
                        <span>{project.api_key_masked}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKeyVisibility(project.id)}
                        title={visibleKeys[project.id] ? t('apiKeys.hide') : t('apiKeys.reveal')}
                      >
                        {visibleKeys[project.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyKey(project.id)}
                        title={t('apiKeys.copy')}
                      >
                        {copiedId === project.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'rotate', projectId: project.id, projectName: project.name })}
                    disabled={!project.is_active}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('apiKeys.rotate')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'regenerate', projectId: project.id, projectName: project.name })}
                    disabled={!project.is_active}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('apiKeys.regenerate')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'revoke', projectId: project.id, projectName: project.name })}
                    disabled={!project.is_active}
                    className="text-destructive hover:text-destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {t('apiKeys.revoke')}
                  </Button>
                </div>

                {/* Info badges */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {project.is_active && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {t('apiKeys.rotateInfo')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {confirmAction.type === 'rotate' && t('apiKeys.confirmRotate')}
                {confirmAction.type === 'revoke' && t('apiKeys.confirmRevoke')}
                {confirmAction.type === 'regenerate' && t('apiKeys.confirmRegenerate')}
              </CardTitle>
              <CardDescription>
                {t('apiKeys.forProject')}: <strong>{confirmAction.projectName}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{getActionDescription(confirmAction.type)}</p>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  {getActionWarning(confirmAction.type)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmAction(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant={confirmAction.type === 'revoke' ? 'destructive' : 'default'}
                  className="flex-1"
                  onClick={() => {
                    switch (confirmAction.type) {
                      case 'rotate':
                        handleRotateKey(confirmAction.projectId);
                        break;
                      case 'revoke':
                        handleRevokeKey(confirmAction.projectId);
                        break;
                      case 'regenerate':
                        handleRegenerateKey(confirmAction.projectId);
                        break;
                    }
                  }}
                  disabled={rotateApiKey.isPending || revokeApiKey.isPending || regenerateApiKey.isPending}
                >
                  {(rotateApiKey.isPending || revokeApiKey.isPending || regenerateApiKey.isPending) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('common.confirm')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

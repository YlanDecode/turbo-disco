import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects, useDeleteProject, useRevealApiKey } from '@/api/hooks/useProjects';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, Check, Trash2, User } from 'lucide-react';
import { formatDate, maskApiKey } from '@/lib/helpers';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { Link } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projectId: activeProjectId, apiKey: activeApiKey, setProject, clearProject } = useProjectContext();
  const { data, isLoading } = useProjects({ page: 1, limit: 20 });
  const deleteProject = useDeleteProject();
  const revealApiKey = useRevealApiKey();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelectProject = async (id: string) => {
    setSelectingId(id);
    try {
      const response = await revealApiKey.mutateAsync(id);
      setProject(id, response.api_key);
      toast.success(t('common.success'));
      navigate('/chat');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSelectingId(null);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`${t('common.confirm')} - ${name} ?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProject.mutateAsync(id);
      toast.success(t('common.success'));

      // Si c'est le projet actif, le déselectionner
      if (activeProjectId === id) {
        clearProject();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Projets</h1>
            <p className="text-muted-foreground">
              Gérez vos projets et leurs clés API
            </p>
          </div>
          <Link to="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {data && data.projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Aucun projet trouvé</p>
              <Link to="/projects/new">
                <Button>Créer votre premier projet</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {data?.projects.map((project) => (
            <Card key={project.id} className={activeProjectId === project.id ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {project.name}
                      {activeProjectId === project.id && (
                        activeApiKey ? (
                          <span className="flex items-center gap-1 text-xs font-normal text-primary">
                            <Check className="h-3 w-3" />
                            {t('projects.active')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-normal text-amber-600">
                            ⚠️ {t('projects.invalidKey')}
                          </span>
                        )
                      )}
                    </CardTitle>
                    {project.description && (
                      <CardDescription>{project.description}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    disabled={deletingId === project.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Slug</p>
                    <p className="font-mono">{project.slug}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clé API</p>
                    <p className="font-mono">{maskApiKey(project.api_key_masked)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Créé le</p>
                    <p>{formatDate(project.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    <p>{project.is_active ? 'Actif' : 'Inactif'}</p>
                  </div>
                  {project.owner_username && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Créé par</p>
                      <p className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {project.owner_username}
                      </p>
                    </div>
                  )}
                </div>

                {activeProjectId === project.id && !activeApiKey ? (
                  <Button
                    variant="outline"
                    className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                    onClick={() => handleSelectProject(project.id)}
                    disabled={selectingId === project.id}
                  >
                    {selectingId === project.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('projects.invalidKeyClickToChange')}
                  </Button>
                ) : activeProjectId !== project.id ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSelectProject(project.id)}
                    disabled={selectingId === project.id}
                  >
                    {selectingId === project.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('projects.selectProject')}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

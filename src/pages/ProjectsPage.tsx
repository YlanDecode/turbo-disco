import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects, useDeleteProject } from '@/api/hooks/useProjects';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, Check, Trash2, User } from 'lucide-react';
import { formatDate, maskApiKey } from '@/lib/helpers';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projectId: activeProjectId, apiKey: activeApiKey, setProject, clearProject } = useProjectContext();
  const { data, isLoading } = useProjects({ page: 1, limit: 20 });
  const deleteProject = useDeleteProject();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setApiKeyInput('');
  };

  const handleConfirmApiKey = () => {
    if (!apiKeyInput.trim() || !selectedProjectId) {
      toast.error('Veuillez saisir une clé API valide');
      return;
    }
    setProject(selectedProjectId, apiKeyInput);
    toast.success('Projet sélectionné');
    setSelectedProjectId(null);
    setApiKeyInput('');
    navigate('/chat');
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${name}" ?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Projet supprimé');
      
      // Si c'est le projet actif, le déselectionner
      if (activeProjectId === id) {
        clearProject();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du projet');
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
                  >
                    {t('projects.invalidKeyClickToChange')}
                  </Button>
                ) : activeProjectId !== project.id ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    {t('projects.selectProject')}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialogue pour saisir la clé API */}
        {selectedProjectId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Saisir la clé API</CardTitle>
                <CardDescription>
                  Entrez la clé API du projet pour l'activer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Clé API</label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Collez votre clé API ici"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedProjectId(null);
                      setApiKeyInput('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirmApiKey}
                  >
                    Confirmer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

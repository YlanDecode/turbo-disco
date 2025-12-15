import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/api/hooks/useProjects';
import { useProjectContext } from '@/contexts/ProjectContext';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ApiKeyDisplay } from '@/components/projects/ApiKeyDisplay';
import { Button } from '@/components/ui/button';
import type { CreateProjectRequest } from '@/api/types';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { setProject } = useProjectContext();
  const createProject = useCreateProject();
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const handleSubmit = async (data: CreateProjectRequest) => {
    try {
      const project = await createProject.mutateAsync(data);
      if (project.api_key) {
        setCreatedApiKey(project.api_key);
        setCreatedProjectId(project.id);
        toast.success('Projet créé avec succès !');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du projet');
    }
  };

  const handleContinue = () => {
    if (createdProjectId && createdApiKey) {
      setProject(createdProjectId, createdApiKey);
      navigate('/chat');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nouveau Projet</h1>
        </div>

        {!createdApiKey ? (
          <ProjectForm onSubmit={handleSubmit} isLoading={createProject.isPending} />
        ) : (
          <div className="space-y-6">
            <ApiKeyDisplay apiKey={createdApiKey} isSensitive />
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continuer vers le chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

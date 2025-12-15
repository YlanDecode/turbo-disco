import React from 'react';
import { Link } from 'react-router-dom';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FolderKanban, FileText, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useProjectContext();

  if (isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Bienvenue sur {import.meta.env.VITE_APP_NAME || 'Assistant IA'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {import.meta.env.VITE_APP_DESCRIPTION || 'Votre assistant IA avec capacités RAG'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  Conversez avec l'assistant et obtenez des réponses en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/chat">
                  <Button variant="outline" className="w-full">
                    Commencer <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Gestion RAG</CardTitle>
                <CardDescription>
                  Uploadez et gérez les documents de contexte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/rag">
                  <Button variant="outline" className="w-full">
                    Gérer <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FolderKanban className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Projets</CardTitle>
                <CardDescription>
                  Gérez vos projets et leurs configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/projects">
                  <Button variant="outline" className="w-full">
                    Voir <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold">
          {import.meta.env.VITE_APP_NAME || 'Assistant IA'}
        </h1>
        <p className="text-xl text-muted-foreground">
          Un assistant IA intelligent avec capacités de recherche dans vos documents (RAG)
        </p>

        <div className="space-y-4">
          <Link to="/projects/new">
            <Button size="lg" className="w-full md:w-auto">
              Créer mon premier projet
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Ou{' '}
            <Link to="/projects" className="underline">
              sélectionner un projet existant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

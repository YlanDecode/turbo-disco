import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateProjectRequest } from '@/api/types';

const projectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  slug: z.string().max(100).optional(),
  description: z.string().optional(),
  assistant_name: z.string().max(100).default('Assistant'),
  company_name: z.string().max(255).default('Company'),
  assistant_role: z.string().max(255).default('assistant'),
  assistant_tone: z.string().max(255).default('professionnel et clair'),
  max_context_messages: z.number().min(1).max(50).default(10),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onSubmit: (data: CreateProjectRequest) => void;
  isLoading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      assistant_name: 'Assistant',
      company_name: 'Company',
      assistant_role: 'assistant',
      assistant_tone: 'professionnel et clair',
      max_context_messages: 10,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un nouveau projet</CardTitle>
        <CardDescription>
          Configurez votre assistant IA. La clé API sera affichée une seule fois après la création.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom du projet *</label>
            <Input {...register('name')} placeholder="Mon Projet" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input {...register('slug')} placeholder="mon-projet" />
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea {...register('description')} placeholder="Description du projet" rows={3} />
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Configuration de l'assistant</h3>

            <div>
              <label className="text-sm font-medium">Nom de l'assistant</label>
              <Input {...register('assistant_name')} placeholder="Assistant" />
            </div>

            <div>
              <label className="text-sm font-medium">Nom de l'entreprise</label>
              <Input {...register('company_name')} placeholder="Company" />
            </div>

            <div>
              <label className="text-sm font-medium">Rôle de l'assistant</label>
              <Input {...register('assistant_role')} placeholder="assistant" />
            </div>

            <div>
              <label className="text-sm font-medium">Ton de l'assistant</label>
              <Input {...register('assistant_tone')} placeholder="professionnel et clair" />
            </div>

            <div>
              <label className="text-sm font-medium">Messages de contexte maximum</label>
              <Input type="number" {...register('max_context_messages', { valueAsNumber: true })} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer le projet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

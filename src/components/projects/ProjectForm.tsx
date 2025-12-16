import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Bot, Mail, Phone, Globe, ChevronRight, ChevronLeft, Check } from 'lucide-react';
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
  contact_email: z.string().email('Email invalide').optional().or(z.literal('')),
  contact_phone: z.string().max(50).optional(),
  contact_website: z.string().url('URL invalide').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onSubmit: (data: CreateProjectRequest) => void;
  isLoading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      assistant_name: 'Assistant',
      company_name: 'Company',
      assistant_role: 'assistant',
      assistant_tone: 'professionnel et clair',
      max_context_messages: 10,
      contact_email: '',
      contact_phone: '',
      contact_website: '',
    },
  });

  const formData = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof ProjectFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'slug', 'description', 'max_context_messages'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['assistant_name', 'company_name', 'assistant_role', 'assistant_tone'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    if (currentStep === totalSteps) {
      onSubmit(data);
    }
  };

  const steps = [
    { number: 1, title: 'Projet', icon: FolderOpen, color: 'blue' },
    { number: 2, title: 'Assistant', icon: Bot, color: 'purple' },
    { number: 3, title: 'Contact', icon: Mail, color: 'green' },
  ];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Créer un nouveau projet</CardTitle>
        <CardDescription>
          Configurez votre assistant IA en 3 étapes simples
        </CardDescription>

        {/* Indicateur de progression */}
        <div className="flex items-center justify-between pt-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isActive ? `bg-${step.color}-600 text-white shadow-lg scale-110` : ''}
                      ${isCompleted ? `bg-${step.color}-600 text-white` : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${currentStep > step.number ? `bg-${steps[index + 1].color}-600` : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" onKeyDown={(e) => {
          // Empêcher la soumission sur Enter si on n'est pas à la dernière étape
          if (e.key === 'Enter' && currentStep < totalSteps) {
            e.preventDefault();
            handleNext();
          }
        }}>
          {/* Étape 1: Informations du projet */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="flex items-center gap-2 text-xl font-semibold text-blue-600">
                <FolderOpen className="h-6 w-6" />
                <h3>Informations du projet</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium block mb-2">Nom du projet *</label>
                  <Input 
                    {...register('name')} 
                    placeholder="Ex: Agence de voyage Madagascar" 
                    className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1.5">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Slug (identifiant URL)</label>
                  <Input 
                    {...register('slug')} 
                    placeholder="agence-madagascar" 
                    className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Laissez vide pour générer automatiquement</p>
                  {errors.slug && <p className="text-sm text-destructive mt-1.5">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Description</label>
                  <Textarea 
                    {...register('description')} 
                    placeholder="Décrivez brièvement votre projet..." 
                    rows={4}
                    className="transition-all focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Usage interne uniquement</p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Messages de contexte maximum</label>
                  <Input 
                    type="number" 
                    {...register('max_context_messages', { valueAsNumber: true })} 
                    className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Nombre de messages gardés en mémoire (1-50)</p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Configuration de l'assistant */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="flex items-center gap-2 text-xl font-semibold text-purple-600">
                <Bot className="h-6 w-6" />
                <h3>Personnalité de l'assistant</h3>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium block mb-2">Nom de l'assistant</label>
                    <Input 
                      {...register('assistant_name')} 
                      placeholder="Marie" 
                      className="h-11 transition-all focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Comment il se présente</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Nom de l'entreprise</label>
                    <Input 
                      {...register('company_name')} 
                      placeholder="Madabest Travel" 
                      className="h-11 transition-all focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Affiché dans les conversations</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Rôle de l'assistant</label>
                  <Input 
                    {...register('assistant_role')} 
                    placeholder="conseiller en voyages spécialisé Madagascar" 
                    className="h-11 transition-all focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Son expertise et domaine</p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Ton de communication</label>
                  <Input 
                    {...register('assistant_tone')} 
                    placeholder="amical, professionnel et enthousiaste" 
                    className="h-11 transition-all focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Style de réponse (formel, décontracté, technique...)</p>
                </div>

                {/* Aperçu */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-2">APERÇU</p>
                  <p className="text-sm text-foreground">
                    "Bonjour ! Je suis <strong>{formData.assistant_name || 'Assistant'}</strong>, {formData.assistant_role || 'assistant'} chez <strong>{formData.company_name || 'Company'}</strong>. 
                    Je suis là pour vous aider avec un ton {formData.assistant_tone || 'professionnel et clair'}."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Coordonnées */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="flex items-center gap-2 text-xl font-semibold text-green-600">
                <Mail className="h-6 w-6" />
                <h3>Coordonnées</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    Email de contact
                  </label>
                  <Input 
                    type="email" 
                    {...register('contact_email')} 
                    placeholder="contact@example.com" 
                    className="h-11 transition-all focus:ring-2 focus:ring-green-500"
                  />
                  {errors.contact_email && <p className="text-sm text-destructive mt-1.5">{errors.contact_email.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1.5">L'assistant pourra communiquer cet email</p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    Téléphone de contact
                  </label>
                  <Input 
                    {...register('contact_phone')} 
                    placeholder="+33 1 42 86 82 00" 
                    className="h-11 transition-all focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Numéro à partager avec les utilisateurs</p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    Site web
                  </label>
                  <Input 
                    type="url" 
                    {...register('contact_website')} 
                    placeholder="https://www.example.com" 
                    className="h-11 transition-all focus:ring-2 focus:ring-green-500"
                  />
                  {errors.contact_website && <p className="text-sm text-destructive mt-1.5">{errors.contact_website.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1.5">Lien vers votre site officiel</p>
                </div>

                {/* Récapitulatif */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-5 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                  <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-3">RÉCAPITULATIF</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projet :</span>
                      <span className="font-medium">{formData.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assistant :</span>
                      <span className="font-medium">{formData.assistant_name || 'Assistant'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entreprise :</span>
                      <span className="font-medium">{formData.company_name || 'Company'}</span>
                    </div>
                    {formData.contact_email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email :</span>
                        <span className="font-medium">{formData.contact_email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t border-green-300 dark:border-green-700">
                    <p className="text-xs text-muted-foreground italic">
                      ⚠️ La clé API sera générée et affichée une seule fois après la création
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4 border-t">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 h-11"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className={`flex-1 h-11 ${currentStep === 1 ? 'w-full' : ''}`}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Créer le projet
                  </span>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

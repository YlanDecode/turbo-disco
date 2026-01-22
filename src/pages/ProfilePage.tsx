import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile, useChangePassword, useExportUserData } from '@/api/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Shield,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Mot de passe actuel requis'),
  new_password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { user, setUser } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const exportData = useExportUserData();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || user?.full_name || '',
      email: profile?.email || user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      resetProfile({
        full_name: profile.full_name || '',
        email: profile.email || '',
      });
    }
  }, [profile, resetProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const updatedProfile = await updateProfile.mutateAsync(data);
      setUser(updatedProfile);
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Mot de passe modifié');
      resetPassword();
    } catch {
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData.mutateAsync();
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Données exportées');
      setShowExportDialog(false);
    } catch {
      toast.error("Erreur lors de l'export des données");
    }
  };

  if (profileLoading) {
    return <LoadingSpinner fullScreen text="Chargement du profil..." />;
  }

  const displayProfile = profile || user;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {displayProfile?.full_name?.[0]?.toUpperCase() || displayProfile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayProfile?.full_name || 'Utilisateur'}</h1>
            <p className="text-muted-foreground">{displayProfile?.email}</p>
            <Badge variant="outline" className="mt-2">
              <Shield className="mr-1 h-3 w-3" />
              {displayProfile?.role || 'user'}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowExportDialog(true)}>
          <Download className="mr-2 h-4 w-4" />
          Exporter mes données
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Informations personnelles</h2>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nom complet</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...registerProfile('full_name')}
                      placeholder="Votre nom"
                      className="pl-10"
                    />
                  </div>
                  {profileErrors.full_name && (
                    <p className="mt-1 text-sm text-destructive">{profileErrors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...registerProfile('email')}
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-destructive">{profileErrors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Account info */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="mb-3 font-medium">Informations du compte</h3>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Inscrit le:</span>
                    <span>
                      {displayProfile?.created_at
                        ? format(new Date(displayProfile.created_at), 'dd MMMM yyyy', { locale: fr })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Rôle:</span>
                    <Badge variant="secondary">{displayProfile?.role || 'user'}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!profileDirty || updateProfile.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Changer le mot de passe</h2>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label className="text-sm font-medium">Mot de passe actuel</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...registerPassword('current_password')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe actuel"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Nouveau mot de passe</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...registerPassword('new_password')}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Entrez votre nouveau mot de passe"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...registerPassword('confirm_password')}
                    type="password"
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="pl-10"
                  />
                </div>
                {passwordErrors.confirm_password && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.confirm_password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={changePassword.isPending}>
                  <Lock className="mr-2 h-4 w-4" />
                  {changePassword.isPending ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </div>
            </form>
          </div>

          {/* Security tips */}
          <div className="mt-6 rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-4 font-semibold">Conseils de sécurité</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Utilisez un mot de passe d'au moins 8 caractères</li>
              <li>• Incluez des majuscules, minuscules, chiffres et caractères spéciaux</li>
              <li>• N'utilisez pas le même mot de passe sur plusieurs sites</li>
              <li>• Ne partagez jamais votre mot de passe avec qui que ce soit</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export data dialog */}
      <ConfirmDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleExportData}
        title="Exporter mes données"
        description="Vous allez télécharger un fichier JSON contenant toutes vos données personnelles. Ce fichier est conforme au RGPD."
        confirmText="Télécharger"
        isLoading={exportData.isPending}
      />
    </div>
  );
};

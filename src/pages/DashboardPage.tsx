import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  FolderKanban,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
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

// Mock data for charts
const conversationData = [
  { date: 'Lun', count: 45 },
  { date: 'Mar', count: 52 },
  { date: 'Mer', count: 49 },
  { date: 'Jeu', count: 63 },
  { date: 'Ven', count: 58 },
  { date: 'Sam', count: 32 },
  { date: 'Dim', count: 28 },
];

const topQuestionsData = [
  { question: 'Comment créer un compte ?', count: 156 },
  { question: 'Où trouver mes factures ?', count: 124 },
  { question: 'Comment réinitialiser mon mot de passe ?', count: 98 },
  { question: 'Quels sont vos tarifs ?', count: 87 },
  { question: 'Comment contacter le support ?', count: 76 },
];

const recentActivity = [
  { id: 1, type: 'conversation', message: 'Nouvelle conversation démarrée', time: 'Il y a 5 min', project: 'E-commerce Bot' },
  { id: 2, type: 'user', message: 'Nouvel utilisateur inscrit', time: 'Il y a 15 min', project: 'Support Bot' },
  { id: 3, type: 'project', message: 'Projet mis à jour', time: 'Il y a 1h', project: 'FAQ Assistant' },
  { id: 4, type: 'conversation', message: 'Feedback positif reçu', time: 'Il y a 2h', project: 'E-commerce Bot' },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour, {user?.full_name || 'Utilisateur'} !
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Mes projets
          </Button>
          <Button onClick={() => navigate('/chat')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Nouveau chat
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversations"
          value="1,234"
          description="Total ce mois"
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Utilisateurs actifs"
          value="856"
          description="Cette semaine"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Projets actifs"
          value="12"
          description="En cours"
          icon={FolderKanban}
        />
        <StatCard
          title="Taux de satisfaction"
          value="94%"
          description="Basé sur les feedbacks"
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversations chart */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Conversations</h3>
              <p className="text-sm text-muted-foreground">7 derniers jours</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="h-64">
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top questions chart */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Questions fréquentes</h3>
            <p className="text-sm text-muted-foreground">Top 5 cette semaine</p>
          </div>
          <div className="h-64">
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
          </div>
        </div>
      </div>

      {/* Recent activity & Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="rounded-lg border bg-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Activité récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {activity.type === 'conversation' && <MessageSquare className="h-5 w-5 text-primary" />}
                  {activity.type === 'user' && <Users className="h-5 w-5 text-green-600" />}
                  {activity.type === 'project' && <FolderKanban className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.project} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-4 w-full">
            Voir toute l'activité
          </Button>
        </div>

        {/* Quick actions */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Actions rapides</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/projects/new')}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Créer un projet
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/chat')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Tester un chatbot
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/users')}>
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les utilisateurs
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings/api-keys')}>
              Gérer les clés API
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';

// Initialize i18n
import i18n from './i18n';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ChatPage } from './pages/ChatPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { RAGPage } from './pages/RAGPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { ApiKeysPage } from './pages/settings/ApiKeysPage';
import { WebhooksPage } from './pages/settings/WebhooksPage';
import { AnalyticsPage } from './pages/settings/AnalyticsPage';
import { NotificationsPage } from './pages/settings/NotificationsPage';
import { Toaster, toast } from 'sonner';
import './index.css';

// Composant pour gérer les notifications d'erreur globales
const GlobalErrorHandler: React.FC = () => {
  useEffect(() => {
    const handleProjectAuthError = () => {
      toast.error(i18n.t('errors.projectApiKeyInvalid'), {
        description: i18n.t('errors.projectApiKeyInvalidDescription'),
      });
    };

    window.addEventListener('project-auth-error', handleProjectAuthError);
    return () => window.removeEventListener('project-auth-error', handleProjectAuthError);
  }, []);

  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Routes avec DashboardLayout (nouvelle interface admin) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
              </Route>

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfilePage />} />
              </Route>

              {/* Routes Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <DashboardLayout requireAdmin />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
              </Route>

              {/* Routes Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/settings/api-keys" replace />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                <Route path="webhooks" element={<WebhooksPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Routes protégées avec DashboardLayout (interface unifiée) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ChatPage />} />
                <Route path=":conversationId" element={<ChatPage />} />
              </Route>

              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProjectsPage />} />
                <Route path="new" element={<NewProjectPage />} />
              </Route>

              <Route
                path="/rag"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RAGPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" richColors />
            <GlobalErrorHandler />
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Token } from '@/api/types';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setTokens: (tokens: Token) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // Computed
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

function clearLegacyStorage() {
  localStorage.removeItem('madabest_access_token');
  localStorage.removeItem('madabest_refresh_token');
  localStorage.removeItem('madabest_user');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'super_admin';
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;

        const roleHierarchy: Record<string, number> = {
          user: 1,
          super_admin: 2,
        };

        const userLevel = roleHierarchy[user.role] || 0;
        const requiredLevel = roleHierarchy[role] || 0;

        return userLevel >= requiredLevel;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => {
        return () => {
          clearLegacyStorage();
        };
      },
    }
  )
);

// Project store for active project management
interface ProjectState {
  activeProjectId: string | null;
  setActiveProject: (projectId: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
    }),
    {
      name: 'project-storage',
    }
  )
);

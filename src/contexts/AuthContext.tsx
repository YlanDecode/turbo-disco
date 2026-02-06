import React, { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, refreshToken as apiRefreshToken } from '@/api/endpoints/auth';
import { getProfile } from '@/api/endpoints/users';
import type { UserProfile } from '@/api/types';
import { useAuthStore } from '@/store/authStore';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lire tout l'état depuis Zustand (source unique de vérité)
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  // Écouter les événements d'erreur d'auth (depuis l'intercepteur axios)
  useEffect(() => {
    const handleAuthError = () => {
      clearAuth();
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [clearAuth]);

  // Au montage, valider la session si on a des tokens mais pas de user
  useEffect(() => {
    const validateSession = async () => {
      if (accessToken && !user) {
        try {
          const profile = await getProfile();
          setUser(profile);
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await apiLogin(username, password);
    setTokens(tokens);

    // Récupérer le profil complet après login
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch (error) {
      // Fallback vers un user minimal si le profil échoue
      console.error('Failed to fetch user profile:', error);
      const minimalUser: UserProfile = {
        id: '',
        username,
        email: null,
        role: 'user',
        is_approved: true,
        email_verified: false,
        created_at: new Date().toISOString(),
      };
      setUser(minimalUser);
    }
  }, [setTokens, setUser]);

  const signup = useCallback(async (username: string, password: string) => {
    await apiSignup({ username, password });
    await login(username, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      if (accessToken || refreshToken) {
        await apiLogout(
          {
            access_token: accessToken || undefined,
            refresh_token: refreshToken || undefined,
          },
          accessToken || undefined
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  }, [accessToken, refreshToken, clearAuth]);

  const refresh = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) return false;

    try {
      const tokens = await apiRefreshToken({ refresh_token: refreshToken });
      setTokens(tokens);

      // Rafraîchir aussi le profil utilisateur
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        // Garder le user existant si le refresh du profil échoue
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  }, [refreshToken, setTokens, setUser, clearAuth]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

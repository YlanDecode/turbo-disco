import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { encryptData, decryptData } from '@/api/client';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, refreshToken as apiRefreshToken } from '@/api/endpoints/auth';
import { getProfile } from '@/api/endpoints/users';
import type { UserProfile, Token } from '@/api/types';
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

// Clés de stockage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'madabest_access_token',
  REFRESH_TOKEN: 'madabest_refresh_token',
  USER: 'madabest_user',
};

// Utilitaires de stockage sécurisé
const secureStorage = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, encryptData(accessToken));
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, encryptData(refreshToken));
  },
  getAccessToken: (): string | null => {
    const encrypted = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!encrypted) return null;
    try {
      return decryptData(encrypted);
    } catch {
      return null;
    }
  },
  getRefreshToken: (): string | null => {
    const encrypted = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!encrypted) return null;
    try {
      return decryptData(encrypted);
    } catch {
      return null;
    }
  },
  setUser: (user: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER, encryptData(JSON.stringify(user)));
  },
  getUser: (): UserProfile | null => {
    const encrypted = localStorage.getItem(STORAGE_KEYS.USER);
    if (!encrypted) return null;
    try {
      return JSON.parse(decryptData(encrypted));
    } catch {
      return null;
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Zustand store
  const syncWithStore = useCallback((userData: UserProfile | null) => {
    useAuthStore.getState().setUser(userData);
  }, []);

  // Charger les données au démarrage
  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedAccessToken = secureStorage.getAccessToken();
      const storedRefreshToken = secureStorage.getRefreshToken();
      const storedUser = secureStorage.getUser();

      if (storedAccessToken && storedRefreshToken && storedUser) {
        setAccessToken(storedAccessToken);
        setRefreshTokenState(storedRefreshToken);
        setUser(storedUser);
        syncWithStore(storedUser);
      }
      setIsLoading(false);
    };

    loadStoredAuth();
  }, [syncWithStore]);

  // Écouter les événements d'erreur d'auth
  useEffect(() => {
    const handleAuthError = () => {
      secureStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshTokenState(null);
      syncWithStore(null);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [syncWithStore]);

  const handleTokens = useCallback((tokens: Token) => {
    setAccessToken(tokens.access_token);
    setRefreshTokenState(tokens.refresh_token);
    secureStorage.setTokens(tokens.access_token, tokens.refresh_token);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await apiLogin(username, password);
    handleTokens(tokens);

    // Fetch full user profile after login
    try {
      const profile = await getProfile();
      setUser(profile);
      secureStorage.setUser(profile);
      syncWithStore(profile);
    } catch (error) {
      // Fallback to minimal user data if profile fetch fails
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
      secureStorage.setUser(minimalUser);
      syncWithStore(minimalUser);
    }
  }, [handleTokens, syncWithStore]);

  const signup = useCallback(async (username: string, password: string) => {
    // D'abord créer le compte
    await apiSignup({ username, password });
    // Puis connecter automatiquement
    await login(username, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      if (accessToken || refreshTokenState) {
        await apiLogout(
          {
            access_token: accessToken || undefined,
            refresh_token: refreshTokenState || undefined,
          },
          accessToken || undefined
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      secureStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshTokenState(null);
      syncWithStore(null);
    }
  }, [accessToken, refreshTokenState, syncWithStore]);

  const refresh = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = refreshTokenState || secureStorage.getRefreshToken();
    if (!currentRefreshToken) return false;

    try {
      const tokens = await apiRefreshToken({ refresh_token: currentRefreshToken });
      handleTokens(tokens);

      // Also refresh user profile
      try {
        const profile = await getProfile();
        setUser(profile);
        secureStorage.setUser(profile);
        syncWithStore(profile);
      } catch {
        // Keep existing user data if profile refresh fails
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      secureStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshTokenState(null);
      syncWithStore(null);
      return false;
    }
  }, [refreshTokenState, handleTokens, syncWithStore]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken: refreshTokenState,
    isAuthenticated: !!(accessToken && user),
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

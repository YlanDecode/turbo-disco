import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { encryptData, decryptData } from '@/api/client';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, refreshToken as apiRefreshToken } from '@/api/endpoints/auth';
import type { UserRead, Token } from '@/api/types';

interface AuthContextType {
  user: UserRead | null;
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
  setUser: (user: UserRead) => {
    localStorage.setItem(STORAGE_KEYS.USER, encryptData(JSON.stringify(user)));
  },
  getUser: (): UserRead | null => {
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
  const [user, setUser] = useState<UserRead | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    const loadStoredAuth = () => {
      const storedAccessToken = secureStorage.getAccessToken();
      const storedRefreshToken = secureStorage.getRefreshToken();
      const storedUser = secureStorage.getUser();

      if (storedAccessToken && storedRefreshToken && storedUser) {
        setAccessToken(storedAccessToken);
        setRefreshTokenState(storedRefreshToken);
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    loadStoredAuth();
  }, []);

  // Écouter les événements d'erreur d'auth
  useEffect(() => {
    const handleAuthError = () => {
      secureStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshTokenState(null);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const handleTokens = useCallback((tokens: Token, userData?: UserRead) => {
    setAccessToken(tokens.access_token);
    setRefreshTokenState(tokens.refresh_token);
    secureStorage.setTokens(tokens.access_token, tokens.refresh_token);

    if (userData) {
      setUser(userData);
      secureStorage.setUser(userData);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await apiLogin(username, password);
    // Créer un user minimal avec les infos disponibles
    const userData: UserRead = {
      id: '', // Sera mis à jour si le backend renvoie l'info
      username,
    };
    handleTokens(tokens, userData);
  }, [handleTokens]);

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
    }
  }, [accessToken, refreshTokenState]);

  const refresh = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = refreshTokenState || secureStorage.getRefreshToken();
    if (!currentRefreshToken) return false;

    try {
      const tokens = await apiRefreshToken({ refresh_token: currentRefreshToken });
      handleTokens(tokens);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      secureStorage.clear();
      setUser(null);
      setAccessToken(null);
      setRefreshTokenState(null);
      return false;
    }
  }, [refreshTokenState, handleTokens]);

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

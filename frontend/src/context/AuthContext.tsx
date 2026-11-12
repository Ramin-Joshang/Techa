'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginRequest, RegisterRequest, RegisterResponse } from '@techa/shared';
import { authClient } from '../lib/auth-client';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginRequest) => Promise<AuthUser>;
  verifyOtp: (input: { challengeId: string; code: string }) => Promise<AuthUser>;
  register: (input: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserManually: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await authClient.getMe();
      setUser(res.user);
    } catch {
      // If /me failed, try transparent refresh rotation
      try {
        const refreshRes = await authClient.refresh();
        setUser(refreshRes.user);
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial CSRF and user bootstrap
    authClient.initCsrf().catch(() => {});
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (input: LoginRequest): Promise<AuthUser> => {
    const res = await authClient.login(input);
    setUser(res.user);
    return res.user;
  };

  const verifyOtp = async (input: { challengeId: string; code: string }): Promise<AuthUser> => {
    const res = await authClient.verifyOtp(input);
    setUser(res.user);
    return res.user;
  };

  const register = async (input: RegisterRequest): Promise<RegisterResponse> => {
    return authClient.register(input);
  };

  const logout = async (): Promise<void> => {
    try {
      await authClient.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  const setUserManually = (u: AuthUser | null) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyOtp,
        register,
        logout,
        refreshUser,
        setUserManually,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

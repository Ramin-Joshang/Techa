'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AdminPermission,
  AuthUser,
  LoginRequest,
  OtpChallengeResponse,
  UserRole,
  getPermissionsForRoles,
  hasAdminPermission,
  hasAnyAdminAccess,
} from '@techa/shared';
import { adminClient, AdminApiError } from '../lib/admin/admin-client';

interface AdminAuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAdminAccess: boolean;
  permissions: Set<AdminPermission>;
  authError: string | null;
  hasPermission: (permission: AdminPermission) => boolean;
  hasAnyPermission: (permissions: readonly AdminPermission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  loginWithPassword: (input: LoginRequest) => Promise<AuthUser>;
  requestLoginOtp: (phone: string) => Promise<OtpChallengeResponse>;
  verifyLoginOtp: (input: { challengeId: string; code: string }) => Promise<AuthUser>;
  resendOtp: (challengeId: string) => Promise<OtpChallengeResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const NO_ADMIN_ACCESS_MSG =
  'حساب کاربری شما فاقد نقش مدیریتی معتبر برای ورود به پنل مدیریت تکا است.';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await adminClient.initCsrf().catch(() => '');
      const res = await adminClient.getMe();
      setUser(res?.user || null);
    } catch (err) {
      if (err instanceof AdminApiError && err.status !== 401) {
        setAuthError(err.message);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const assertAdminRole = useCallback(async (loggedInUser: AuthUser): Promise<AuthUser> => {
    if (!hasAnyAdminAccess(loggedInUser.roles)) {
      // Do not keep a non-admin session active inside the admin login flow
      await adminClient.logout().catch(() => {});
      setUser(null);
      throw new AdminApiError(403, 'ADMIN_ROLE_REQUIRED', NO_ADMIN_ACCESS_MSG);
    }
    if (loggedInUser.status !== 'active') {
      await adminClient.logout().catch(() => {});
      setUser(null);
      throw new AdminApiError(
        403,
        'ACCOUNT_NOT_ACTIVE',
        'حساب کاربری شما در وضعیت فعال نیست و امکان ورود به پنل وجود ندارد.'
      );
    }
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const loginWithPassword = useCallback(
    async (input: LoginRequest): Promise<AuthUser> => {
      const res = await adminClient.login(input);
      return assertAdminRole(res.user);
    },
    [assertAdminRole]
  );

  const requestLoginOtp = useCallback(async (phone: string): Promise<OtpChallengeResponse> => {
    return adminClient.requestLoginOtp(phone);
  }, []);

  const verifyLoginOtp = useCallback(
    async (input: { challengeId: string; code: string }): Promise<AuthUser> => {
      const res = await adminClient.verifyLoginOtp(input);
      return assertAdminRole(res.user);
    },
    [assertAdminRole]
  );

  const resendOtp = useCallback(async (challengeId: string): Promise<OtpChallengeResponse> => {
    return adminClient.resendOtp(challengeId);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await adminClient.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const permissions = useMemo(
    () => getPermissionsForRoles(user?.roles || []),
    [user?.roles]
  );

  const hasAdminAccess = useMemo(
    () => Boolean(user && user.status === 'active' && hasAnyAdminAccess(user.roles)),
    [user]
  );

  const hasPermissionFn = useCallback(
    (perm: AdminPermission) => {
      if (!user || user.status !== 'active') return false;
      return hasAdminPermission(user.roles, perm);
    },
    [user]
  );

  const hasAnyPermissionFn = useCallback(
    (perms: readonly AdminPermission[]) => perms.some((p) => hasPermissionFn(p)),
    [hasPermissionFn]
  );

  const hasRoleFn = useCallback(
    (role: UserRole) => Boolean(user?.roles?.includes(role)),
    [user]
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      hasAdminAccess,
      permissions,
      authError,
      hasPermission: hasPermissionFn,
      hasAnyPermission: hasAnyPermissionFn,
      hasRole: hasRoleFn,
      loginWithPassword,
      requestLoginOtp,
      verifyLoginOtp,
      resendOtp,
      logout,
      refreshUser: loadSession,
    }),
    [
      user,
      isLoading,
      hasAdminAccess,
      permissions,
      authError,
      hasPermissionFn,
      hasAnyPermissionFn,
      hasRoleFn,
      loginWithPassword,
      requestLoginOtp,
      verifyLoginOtp,
      resendOtp,
      logout,
      loadSession,
    ]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}

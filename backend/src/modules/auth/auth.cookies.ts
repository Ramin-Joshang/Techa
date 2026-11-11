import { Response, CookieOptions } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || IS_PROD;
const COOKIE_SAME_SITE: 'lax' | 'strict' | 'none' = (process.env.COOKIE_SAME_SITE as any) || 'lax';

const ACCESS_COOKIE_NAME = 'techa_at';
const REFRESH_COOKIE_NAME = 'techa_rt';
const CSRF_COOKIE_NAME = 'techa_csrf';

const ACCESS_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function setAuthCookies(
  res: Response,
  params: {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  }
): void {
  // 1. Access Token Cookie
  const accessCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
    maxAge: ACCESS_MAX_AGE_MS,
  };
  res.cookie(ACCESS_COOKIE_NAME, params.accessToken, accessCookieOptions);

  // 2. Refresh Token Cookie (restricted to /api/v1/auth)
  const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/api/v1/auth',
    maxAge: REFRESH_MAX_AGE_MS,
  };
  res.cookie(REFRESH_COOKIE_NAME, params.refreshToken, refreshCookieOptions);

  // 3. CSRF Cookie (accessible to client-side JS for Double Submit Cookie pattern)
  const csrfCookieOptions: CookieOptions = {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
    maxAge: REFRESH_MAX_AGE_MS,
  };
  res.cookie(CSRF_COOKIE_NAME, params.csrfToken, csrfCookieOptions);
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
  });

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/api/v1/auth',
  });

  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
  });
}

export function getCookies(req: any): {
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
} {
  return {
    accessToken: req.cookies?.[ACCESS_COOKIE_NAME],
    refreshToken: req.cookies?.[REFRESH_COOKIE_NAME],
    csrfToken: req.cookies?.[CSRF_COOKIE_NAME],
  };
}

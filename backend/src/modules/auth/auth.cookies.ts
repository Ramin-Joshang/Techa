import { Request, Response, CookieOptions } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE_NAME = 'techa_at';
const REFRESH_COOKIE_NAME = 'techa_rt';
const CSRF_COOKIE_NAME = 'techa_csrf';

const ACCESS_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function resolveCookieSecurity(req?: Request): {
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
} {
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const isHttpsRequest = Boolean(
    req?.secure ||
      (typeof forwardedProto === 'string' && forwardedProto.split(',')[0].trim() === 'https')
  );
  const configuredSecure = process.env.COOKIE_SECURE === 'true' || IS_PROD || isHttpsRequest;
  const envSameSite = process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none' | undefined;

  // In HTTPS preview/iframe environments (e.g. Cloud Run / AI Studio iframe),
  // SameSite=None + Secure ensures auth & CSRF cookies work inside cross-site frames as well as direct tabs.
  const sameSite: 'lax' | 'strict' | 'none' =
    envSameSite === 'none' || (configuredSecure && isHttpsRequest)
      ? 'none'
      : envSameSite || 'lax';

  const secure = sameSite === 'none' ? true : configuredSecure;
  return { secure, sameSite };
}

export function setCsrfCookie(res: Response, csrfToken: string, req?: Request): void {
  const { secure, sameSite } = resolveCookieSecurity(req);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure,
    sameSite,
    path: '/',
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function setAuthCookies(
  res: Response,
  params: {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  },
  req?: Request
): void {
  const { secure, sameSite } = resolveCookieSecurity(req);

  // 1. Access Token Cookie
  const accessCookieOptions: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: ACCESS_MAX_AGE_MS,
  };
  res.cookie(ACCESS_COOKIE_NAME, params.accessToken, accessCookieOptions);

  // 2. Refresh Token Cookie (restricted to /api/v1/auth)
  const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/api/v1/auth',
    maxAge: REFRESH_MAX_AGE_MS,
  };
  res.cookie(REFRESH_COOKIE_NAME, params.refreshToken, refreshCookieOptions);

  // 3. CSRF Cookie (accessible to client-side JS for Double Submit Cookie pattern)
  const csrfCookieOptions: CookieOptions = {
    httpOnly: false,
    secure,
    sameSite,
    path: '/',
    maxAge: REFRESH_MAX_AGE_MS,
  };
  res.cookie(CSRF_COOKIE_NAME, params.csrfToken, csrfCookieOptions);
}

export function clearAuthCookies(res: Response, req?: Request): void {
  const { secure, sameSite } = resolveCookieSecurity(req);

  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  });

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/api/v1/auth',
  });

  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure,
    sameSite,
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

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from './auth.security';
import { authRepository } from './auth.repository';
import { getCookies } from './auth.cookies';
import { UserRole } from '@techa/shared';

// Extend Express Request interface to hold authenticated user and session
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

/**
 * Authentication Middleware:
 * 1. Checks access token in HttpOnly cookie or Authorization Bearer header
 * 2. Cryptographically verifies JWT (enforcing HS256)
 * 3. Checks session existence, expiration, and revocation in database
 * 4. Checks user existence and active status in database
 * 5. Attaches authenticated user and session to request object
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cookies = getCookies(req);
    let token = cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'احراز هویت انجام نشده است',
        },
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'توکن دسترسی نامعتبر است';
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: msg,
        },
      });
      return;
    }

    // Verify session in Database
    const session = await authRepository.findSessionById(decoded.sessionId);
    if (!session || session.revokedAt !== null || new Date(session.expiresAt) <= new Date()) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_REVOKED',
          message: 'نشست کاربری شما نامعتبر یا منقضی شده است',
        },
      });
      return;
    }

    // Verify user in Database
    const user = await authRepository.findUserById(decoded.userId);
    if (!user || user.status !== 'active') {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'حساب کاربری فعال نیست',
        },
      });
      return;
    }

    // Touch session activity
    if (typeof session.save === 'function') {
      session.lastUsedAt = new Date();
      await session.save();
    }

    req.user = user;
    req.session = session;

    next();
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'خطا در اعتبارسنجی نشست',
      },
    });
  }
}

/**
 * Role-Based Authorization Middleware:
 * Ensures the authenticated user possesses at least one of the required roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ابتدا وارد حساب کاربری خود شوید',
        },
      });
      return;
    }

    const userRoles: UserRole[] = req.user.roles || [];
    const hasPermission = userRoles.some((r) => allowedRoles.includes(r));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'شما دسترسی لازم برای انجام این عملیات را ندارید',
        },
      });
      return;
    }

    next();
  };
}

/**
 * CSRF Protection Middleware:
 * Double-submit cookie verification for state-changing requests.
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  // Safe HTTP methods do not require CSRF token
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt public registration and login from CSRF header requirement if cookie not yet set
  if (['/register', '/login'].includes(req.path)) {
    return next();
  }

  const cookies = getCookies(req);
  const cookieCsrf = cookies.csrfToken;
  const headerCsrf = req.headers['x-csrf-token'] as string;

  if (!cookieCsrf || !headerCsrf || cookieCsrf !== headerCsrf) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_INVALID',
        message: 'اعتبارسنجی امنیتی درخواست (CSRF) ناموفق بود',
      },
    });
    return;
  }

  next();
}

/**
 * Rate Limiter for Authentication Endpoints (Register, Login, Password Change)
 * Limits brute-force and credential-stuffing attempts.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'تعداد درخواست‌های احراز هویت بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.',
    },
  },
});

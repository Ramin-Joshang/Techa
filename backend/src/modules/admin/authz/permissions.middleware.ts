import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { Types } from 'mongoose';
import {
  AdminPermission,
  UserRole,
  hasAdminPermission,
  hasAnyAdminAccess,
  getPermissionsForRoles,
} from '@techa/shared';
import { ForbiddenError, UnauthorizedError } from '../../../core/errors/app-error';
import { sendError } from '../../../core/utils/api-response';
import { env } from '../../../core/config/env';
import { hashIpAddress } from '../../auth/auth.security';
import { adminAuditService } from '../audit/audit.service';

export interface AuthenticatedAdminActor {
  userId: string;
  objectId: Types.ObjectId;
  roles: UserRole[];
  primaryRole: UserRole;
  permissions: Set<AdminPermission>;
}

const ROLE_PRIORITY: readonly UserRole[] = [
  'super_admin',
  'admin',
  'content_manager',
  'content_editor',
  'student',
];

export function resolvePrimaryRole(roles: readonly UserRole[] = []): UserRole {
  for (const candidate of ROLE_PRIORITY) {
    if (roles.includes(candidate)) {
      return candidate;
    }
  }
  return 'student';
}

export function extractAdminActor(req: Request): AuthenticatedAdminActor {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedError('احراز هویت برای دسترسی به بخش مدیریت الزامی است');
  }
  const roles: UserRole[] = Array.isArray(req.user.roles) ? req.user.roles : [];
  const userId = req.user._id.toString();
  return {
    userId,
    objectId: new Types.ObjectId(userId),
    roles,
    primaryRole: resolvePrimaryRole(roles),
    permissions: getPermissionsForRoles(roles),
  };
}

export function isContentEditorOnly(roles: readonly UserRole[] = []): boolean {
  return (
    roles.includes('content_editor') &&
    !roles.includes('content_manager') &&
    !roles.includes('admin') &&
    !roles.includes('super_admin')
  );
}

export function assertOwnershipIfEditorOnly(
  actor: AuthenticatedAdminActor,
  createdBy: Types.ObjectId | string | null | undefined,
  resourceLabel = 'منبع'
): void {
  if (!isContentEditorOnly(actor.roles)) {
    return;
  }
  if (!createdBy || createdBy.toString() !== actor.userId) {
    throw new ForbiddenError(
      `ویرایشگر محتوا فقط مجاز به تغییر ${resourceLabel}های ایجادشده توسط خود است`
    );
  }
}

export function requireAnyAdminRole() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('ابتدا وارد حساب کاربری خود شوید'));
    }
    const roles: UserRole[] = Array.isArray(req.user.roles) ? req.user.roles : [];
    if (!hasAnyAdminAccess(roles)) {
      void adminAuditService.recordDeniedSafely({
        actorUserId: req.user._id,
        actorRole: resolvePrimaryRole(roles),
        action: 'security_action',
        resourceType: 'admin_panel',
        resourceId: req.originalUrl,
        requestId: req.id ? String(req.id) : 'unknown',
        changeSummary: 'تلاش برای ورود به مسیر مدیریت بدون نقش مدیریتی',
        ipHash: hashIpAddress(req.ip),
        userAgent: req.get('user-agent') || null,
      });
      return next(new ForbiddenError('شما مجوز دسترسی به پنل مدیریت را ندارید'));
    }
    next();
  };
}

export function requirePermission(permission: AdminPermission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('ابتدا وارد حساب کاربری خود شوید'));
    }

    const roles: UserRole[] = Array.isArray(req.user.roles) ? req.user.roles : [];
    if (!hasAdminPermission(roles, permission)) {
      void adminAuditService.recordDeniedSafely({
        actorUserId: req.user._id,
        actorRole: resolvePrimaryRole(roles),
        action: 'security_action',
        resourceType: 'permission_check',
        resourceId: `${permission}:${req.method}:${req.originalUrl}`,
        requestId: req.id ? String(req.id) : 'unknown',
        changeSummary: `عدم دسترسی به مجوز ${permission}`,
        ipHash: hashIpAddress(req.ip),
        userAgent: req.get('user-agent') || null,
      });
      return next(
        new ForbiddenError(`دسترسی کافی برای انجام این عملیات (${permission}) وجود ندارد`)
      );
    }

    next();
  };
}

export const adminWriteRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'production' ? 120 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendError(
      res,
      429,
      'TOO_MANY_REQUESTS',
      'تعداد درخواست‌های مدیریتی بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.',
      undefined,
      req.id ? String(req.id) : undefined
    );
  },
  skip: () => env.NODE_ENV === 'test',
});

export const adminUploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 60 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendError(
      res,
      429,
      'TOO_MANY_REQUESTS',
      'تعداد درخواست‌های بارگذاری فایل بیش از حد مجاز است.',
      undefined,
      req.id ? String(req.id) : undefined
    );
  },
  skip: () => env.NODE_ENV === 'test',
});

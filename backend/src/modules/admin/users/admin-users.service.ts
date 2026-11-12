import { Types } from 'mongoose';
import {
  AdminUserListQuery,
  AdminUpdateUserStatusDto,
  AdminUpdateUserRolesDto,
  AdminUserDto,
  AdminUserSessionDto,
  UserRole,
} from '@techa/shared';
import { UserModel, IUserDocument } from '../../../models/user.model';
import { AuthSessionModel } from '../../../models/auth-session.model';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { escapeRegex } from '../../../core/utils/regex';
import { maskPhoneNumber } from '../../auth/auth.security';
import { AuthenticatedAdminActor } from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';
import { withOptionalTransaction } from '../revisions/revision.service';
import { RequestAuditContext } from '../media/media.service';

export function toAdminUserDto(doc: IUserDocument | any): AdminUserDto {
  return {
    id: doc._id.toString(),
    maskedPhone: maskPhoneNumber(doc.phoneE164 || ''),
    firstName: doc.firstName ?? null,
    lastName: doc.lastName ?? null,
    roles: Array.isArray(doc.roles) ? doc.roles : ['student'],
    status: doc.status,
    phoneVerifiedAt: doc.phoneVerifiedAt ? new Date(doc.phoneVerifiedAt).toISOString() : null,
    lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export function toAdminUserSessionDto(doc: any): AdminUserSessionDto {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    issuedAt: doc.issuedAt ? new Date(doc.issuedAt).toISOString() : new Date().toISOString(),
    lastUsedAt: doc.lastUsedAt ? new Date(doc.lastUsedAt).toISOString() : new Date().toISOString(),
    expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : new Date().toISOString(),
    revokedAt: doc.revokedAt ? new Date(doc.revokedAt).toISOString() : null,
    revokeReason: doc.revokeReason ?? null,
    userAgent: doc.userAgent ?? null,
  };
}

export class AdminUsersService {
  public async listUsers(query: AdminUserListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.role) filter.roles = query.role;
    if (query.q) {
      const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
      filter.$or = [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { phoneE164: { $regex: regex } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortDir = query.order === 'asc' ? 1 : -1;
    const sortField = query.sort || 'createdAt';

    const [total, docs] = await Promise.all([
      UserModel.countDocuments(filter),
      UserModel.find(filter)
        .select({ passwordHash: 0 })
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      items: (docs || []).map(toAdminUserDto),
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  }

  public async getUserDetail(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }
    const [user, activeSessionsCount] = await Promise.all([
      UserModel.findById(userId).select({ passwordHash: 0 }).lean(),
      AuthSessionModel.countDocuments({
        userId: new Types.ObjectId(userId),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }

    return {
      ...toAdminUserDto(user),
      activeSessionsCount: activeSessionsCount || 0,
    };
  }

  public async updateUserStatus(
    targetUserId: string,
    dto: AdminUpdateUserStatusDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminUserDto> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }
    const targetUser = await UserModel.findById(targetUserId).select({ passwordHash: 0 });
    if (!targetUser) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }

    const isTargetSuperAdmin = targetUser.roles.includes('super_admin');
    const isDeactivating = dto.status !== 'active';

    // Only super_admin can change status of an admin or super_admin
    if (
      (isTargetSuperAdmin || targetUser.roles.includes('admin')) &&
      !actor.roles.includes('super_admin')
    ) {
      throw new ForbiddenError('فقط مدیر ارشد سیستم (super_admin) مجاز به تغییر وضعیت مدیران است');
    }

    if (targetUser._id.toString() === actor.userId && isDeactivating) {
      throw new BadRequestError('امکان غیرفعال‌سازی یا تعلیق حساب کاربری خودتان وجود ندارد');
    }

    // Protect last active super_admin
    if (isTargetSuperAdmin && targetUser.status === 'active' && isDeactivating) {
      const activeSuperAdmins = await UserModel.countDocuments({
        roles: 'super_admin',
        status: 'active',
      });
      if (activeSuperAdmins <= 1) {
        throw new ConflictError('آخرین مدیر ارشد فعال سیستم (super_admin) را نمی‌توان غیرفعال یا تعلیق کرد');
      }
    }

    const updated = await withOptionalTransaction(async (session) => {
      targetUser.status = dto.status;
      if (isDeactivating) {
        targetUser.authVersion = (targetUser.authVersion || 1) + 1;
      }
      await targetUser.save({ session });

      if (isDeactivating) {
        await AuthSessionModel.updateMany(
          { userId: targetUser._id, revokedAt: null },
          {
            $set: {
              revokedAt: new Date(),
              revokeReason: `admin_status_change:${dto.status}`,
            },
          },
          { session }
        );
      }

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'security_action',
          resourceType: 'user',
          resourceId: targetUser._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status'],
          changeSummary: `تغییر وضعیت کاربر به ${dto.status} - دلیل: ${dto.reason}`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return targetUser;
    });

    return toAdminUserDto(updated);
  }

  public async updateUserRoles(
    targetUserId: string,
    dto: AdminUpdateUserRolesDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminUserDto> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }
    const targetUser = await UserModel.findById(targetUserId).select({ passwordHash: 0 });
    if (!targetUser) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }

    const uniqueRoles: UserRole[] = Array.from(new Set(dto.roles));
    const actorIsSuperAdmin = actor.roles.includes('super_admin');
    const oldRoles = targetUser.roles || [];

    const touchesHighPrivilege =
      oldRoles.includes('super_admin') ||
      oldRoles.includes('admin') ||
      uniqueRoles.includes('super_admin') ||
      uniqueRoles.includes('admin');

    if (touchesHighPrivilege && !actorIsSuperAdmin) {
      throw new ForbiddenError(
        'اعطا یا سلب نقش‌های admin و super_admin فقط توسط مدیر ارشد سیستم (super_admin) مجاز است'
      );
    }

    // Protect last active super_admin from losing super_admin role
    const wasSuperAdmin = oldRoles.includes('super_admin');
    const willBeSuperAdmin = uniqueRoles.includes('super_admin');
    if (wasSuperAdmin && !willBeSuperAdmin && targetUser.status === 'active') {
      const activeSuperAdmins = await UserModel.countDocuments({
        roles: 'super_admin',
        status: 'active',
      });
      if (activeSuperAdmins <= 1) {
        throw new ConflictError('امکان حذف نقش super_admin از آخرین مدیر ارشد فعال وجود ندارد');
      }
    }

    const updated = await withOptionalTransaction(async (session) => {
      targetUser.roles = uniqueRoles;
      targetUser.authVersion = (targetUser.authVersion || 1) + 1;
      await targetUser.save({ session });

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'role_change',
          resourceType: 'user',
          resourceId: targetUser._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['roles'],
          changeSummary: `تغییر نقش‌های کاربر به [${uniqueRoles.join(', ')}] - دلیل: ${dto.reason}`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return targetUser;
    });

    return toAdminUserDto(updated);
  }

  public async getUserSessions(targetUserId: string): Promise<AdminUserSessionDto[]> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }
    const exists = await UserModel.exists({ _id: targetUserId });
    if (!exists) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }

    const sessions = await AuthSessionModel.find({
      userId: new Types.ObjectId(targetUserId),
    })
      .select({ tokenHash: 0, ipHash: 0 })
      .sort({ issuedAt: -1 })
      .limit(50)
      .lean();

    return (sessions || []).map(toAdminUserSessionDto);
  }

  public async revokeAllUserSessions(
    targetUserId: string,
    reason: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<{ revokedCount: number }> {
    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }
    const targetUser = await UserModel.findById(targetUserId).select({ _id: 1, roles: 1, authVersion: 1 });
    if (!targetUser) {
      throw new NotFoundError('کاربر مورد نظر یافت نشد');
    }

    if (
      (targetUser.roles.includes('super_admin') || targetUser.roles.includes('admin')) &&
      !actor.roles.includes('super_admin') &&
      targetUser._id.toString() !== actor.userId
    ) {
      throw new ForbiddenError('فقط مدیر ارشد سیستم مجاز به لغو نشست‌های مدیران است');
    }

    const revokedCount = await withOptionalTransaction(async (session) => {
      const res = await AuthSessionModel.updateMany(
        { userId: targetUser._id, revokedAt: null },
        {
          $set: {
            revokedAt: new Date(),
            revokeReason: reason || 'admin_session_revocation',
          },
        },
        { session }
      );

      await UserModel.updateOne(
        { _id: targetUser._id },
        { $inc: { authVersion: 1 } },
        { session }
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'security_action',
          resourceType: 'user_sessions',
          resourceId: targetUser._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['revokedAt', 'authVersion'],
          changeSummary: `ابطال تمام نشست‌های فعال کاربر - دلیل: ${reason}`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return res.modifiedCount || 0;
    });

    return { revokedCount };
  }
}

export const adminUsersService = new AdminUsersService();

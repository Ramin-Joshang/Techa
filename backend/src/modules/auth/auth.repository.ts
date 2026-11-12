import { Types } from 'mongoose';
import { UserModel, IUserDocument } from '../../models/user.model';
import { AuthSessionModel, IAuthSessionDocument } from '../../models/auth-session.model';
import { UserRole, AccountStatus } from '@techa/shared';

export interface CreateUserData {
  phoneE164: string;
  firstName?: string | null;
  lastName?: string | null;
  passwordHash: string;
  roles?: UserRole[];
  status?: AccountStatus;
  phoneVerifiedAt?: Date | null;
}

export interface CreateSessionData {
  userId: Types.ObjectId | string;
  tokenHash: string;
  familyId: string;
  jti: string;
  expiresAt: Date;
  ipHash?: string | null;
  userAgent?: string | null;
}

export class AuthRepository {
  async findUserByPhone(phoneE164: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ phoneE164 }) as unknown as Promise<IUserDocument | null>;
  }

  async findUserById(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id) as unknown as Promise<IUserDocument | null>;
  }

  async createUser(data: CreateUserData): Promise<IUserDocument> {
    return UserModel.create({
      phoneE164: data.phoneE164,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      passwordHash: data.passwordHash,
      roles: data.roles || ['student'],
      status: data.status || 'pending_verification',
      phoneVerifiedAt: data.phoneVerifiedAt || null,
      failedLoginCount: 0,
      authVersion: 1,
    }) as unknown as Promise<IUserDocument>;
  }

  async updateUser(
    id: string | Types.ObjectId,
    update: Partial<IUserDocument>
  ): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, update, { returnDocument: 'after' }) as unknown as Promise<IUserDocument | null>;
  }

  async createSession(data: CreateSessionData): Promise<IAuthSessionDocument> {
    return AuthSessionModel.create({
      userId: new Types.ObjectId(data.userId),
      tokenHash: data.tokenHash,
      familyId: data.familyId,
      jti: data.jti,
      expiresAt: data.expiresAt,
      issuedAt: new Date(),
      lastUsedAt: new Date(),
      ipHash: data.ipHash || null,
      userAgent: data.userAgent || null,
    }) as unknown as Promise<IAuthSessionDocument>;
  }

  async findSessionByTokenHash(tokenHash: string): Promise<IAuthSessionDocument | null> {
    return AuthSessionModel.findOne({ tokenHash }) as unknown as Promise<IAuthSessionDocument | null>;
  }

  async findSessionById(id: string | Types.ObjectId): Promise<IAuthSessionDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return AuthSessionModel.findById(id) as unknown as Promise<IAuthSessionDocument | null>;
  }

  async findActiveSessionsByUserId(userId: string | Types.ObjectId): Promise<IAuthSessionDocument[]> {
    return AuthSessionModel.find({
      userId: new Types.ObjectId(userId),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 }) as unknown as Promise<IAuthSessionDocument[]>;
  }

  async revokeSession(
    sessionId: string | Types.ObjectId,
    reason: string = 'logout',
    replacedBySessionId?: Types.ObjectId | null
  ): Promise<IAuthSessionDocument | null> {
    return AuthSessionModel.findByIdAndUpdate(
      sessionId,
      {
        revokedAt: new Date(),
        revokeReason: reason,
        replacedBySessionId: replacedBySessionId || null,
      },
      { returnDocument: 'after' }
    ) as unknown as Promise<IAuthSessionDocument | null>;
  }

  async revokeFamily(familyId: string, reason: string = 'reuse_detected'): Promise<number> {
    const res = await (AuthSessionModel.updateMany(
      { familyId, revokedAt: null },
      {
        revokedAt: new Date(),
        revokeReason: reason,
      }
    ) as any);
    return res.modifiedCount || 0;
  }

  async revokeAllUserSessions(
    userId: string | Types.ObjectId,
    reason: string = 'logout_all'
  ): Promise<number> {
    const res = await AuthSessionModel.updateMany(
      { userId: new Types.ObjectId(userId), revokedAt: null },
      {
        revokedAt: new Date(),
        revokeReason: reason,
      }
    ).exec();
    return res.modifiedCount;
  }

  async countSuperAdmins(): Promise<number> {
    return UserModel.countDocuments({
      roles: 'super_admin',
      status: 'active',
    }).exec();
  }
}

export const authRepository = new AuthRepository();

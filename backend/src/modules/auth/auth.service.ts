import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { authRepository, AuthRepository } from './auth.repository';
import {
  normalizePhoneE164,
  maskPhoneNumber,
  hashPassword,
  verifyPassword,
  needsRehash,
  generateOpaqueRefreshToken,
  hashTokenSha256,
  hashIpAddress,
  generateCsrfToken,
  signAccessToken,
} from './auth.security';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthUser,
  SessionItem,
} from '@techa/shared';

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  /**
   * User Registration
   * - Strict E.164 phone normalization
   * - Argon2id password hash
   * - Always assigns role 'student'
   * - Account set to 'pending_verification'
   * - No OTP sent in Phase 4 (reserved for Phase 5)
   */
  async register(input: RegisterRequest): Promise<RegisterResponse> {
    const phoneE164 = normalizePhoneE164(input.phone);

    // Check if phone number already exists
    const existingUser = await this.repo.findUserByPhone(phoneE164);
    if (existingUser) {
      // Generic error response to prevent phone enumeration
      throw new Error('امکان ثبت‌نام با این شماره وجود ندارد یا حساب قبلاً ایجاد شده است');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.repo.createUser({
      phoneE164,
      firstName: input.firstName?.trim() || null,
      lastName: input.lastName?.trim() || null,
      passwordHash,
      roles: ['student'], // Forced to 'student' by security policy
      status: 'pending_verification',
      phoneVerifiedAt: null,
    });

    return {
      id: user._id.toString(),
      phoneE164: user.phoneE164,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      status: 'pending_verification',
      message: 'حساب کاربری با موفقیت ایجاد شد. تأیید شماره موبایل در مرحله بعد انجام خواهد شد.',
    };
  }

  /**
   * Password Login
   * - Strict E.164 phone normalization
   * - Argon2id verification
   * - Enforces phoneVerifiedAt !== null and status === 'active'
   * - Opaque Refresh Token with SHA-256 storage
   * - Short-lived Access JWT
   */
  async login(
    input: LoginRequest,
    context: { userAgent?: string; ipAddress?: string }
  ): Promise<{
    user: AuthUser;
    accessToken: string;
    rawRefreshToken: string;
    csrfToken: string;
  }> {
    const phoneE164 = normalizePhoneE164(input.phone);

    const user = await this.repo.findUserByPhone(phoneE164);
    if (!user || !user.passwordHash) {
      // Constant-time dummy verify or generic error to prevent enumeration
      throw new Error('شماره موبایل یا رمز عبور صحیح نیست');
    }

    // Check account status
    if (user.status === 'suspended') {
      throw new Error('حساب کاربری شما مسدود شده است. لطفاً با پشتیبانی تماس بگیرید');
    }
    if (user.status === 'disabled') {
      throw new Error('حساب کاربری شما غیرفعال شده است');
    }

    // Verify Password with Argon2id
    const isPasswordValid = await verifyPassword(user.passwordHash, input.password);
    if (!isPasswordValid) {
      await this.repo.updateUser(user._id, {
        failedLoginCount: (user.failedLoginCount || 0) + 1,
      });
      throw new Error('شماره موبایل یا رمز عبور صحیح نیست');
    }

    // Check if phone has been verified
    if (!user.phoneVerifiedAt || user.status !== 'active') {
      throw new Error('شماره موبایل این حساب کاربری هنوز تأیید نشده است. لطفاً ابتدا شماره خود را تأیید نمایید');
    }

    // Rehash if parameters have aged
    if (needsRehash(user.passwordHash)) {
      const newHash = await hashPassword(input.password);
      await this.repo.updateUser(user._id, { passwordHash: newHash });
    }

    // Reset failed attempts & record lastLoginAt
    await this.repo.updateUser(user._id, {
      failedLoginCount: 0,
      lastLoginAt: new Date(),
    });

    // Create Session
    const familyId = crypto.randomUUID();
    const jti = crypto.randomUUID();
    const rawRefreshToken = generateOpaqueRefreshToken();
    const tokenHash = hashTokenSha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await this.repo.createSession({
      userId: user._id,
      tokenHash,
      familyId,
      jti,
      expiresAt,
      ipHash: hashIpAddress(context.ipAddress),
      userAgent: context.userAgent?.slice(0, 500) || null,
    });

    // Sign Access Token
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      roles: user.roles,
    });

    const csrfToken = generateCsrfToken();

    return {
      user: this.mapToAuthUser(user),
      accessToken,
      rawRefreshToken,
      csrfToken,
    };
  }

  /**
   * Refresh Token Rotation & Session Security
   * - Hashes incoming raw token
   * - Detects reuse of already-revoked tokens -> Revokes entire session family!
   * - Issues atomic new session in same family
   * - Invalidates previous token
   */
  async refresh(
    rawRefreshToken: string,
    context: { userAgent?: string; ipAddress?: string }
  ): Promise<{
    user: AuthUser;
    accessToken: string;
    newRawRefreshToken: string;
    csrfToken: string;
  }> {
    if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
      throw new Error('توکن بازنشانی نامعتبر است');
    }

    const tokenHash = hashTokenSha256(rawRefreshToken);
    const session = await this.repo.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new Error('نشست نامعتبر یا منقضی شده است');
    }

    // REUSE DETECTION: If this session was already revoked, someone is reusing an old token!
    if (session.revokedAt !== null) {
      // Invalidate the entire session family to neutralize token compromise
      await this.repo.revokeFamily(session.familyId, 'reuse_detected');
      throw new Error('استفاده مجدد از توکن قدیمی شناسایی شد. کلیه نشست‌های مرتبط به دلایل امنیتی ابطال گردیدند');
    }

    // Check expiration
    if (new Date(session.expiresAt) <= new Date()) {
      await this.repo.revokeSession(session._id, 'expired');
      throw new Error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید');
    }

    // Verify user is still active
    const user = await this.repo.findUserById(session.userId);
    if (!user || user.status !== 'active') {
      await this.repo.revokeSession(session._id, 'user_inactive');
      throw new Error('حساب کاربری فعال نیست');
    }

    // Token Rotation: Generate new token and replace session
    const newRawRefreshToken = generateOpaqueRefreshToken();
    const newTokenHash = hashTokenSha256(newRawRefreshToken);
    const newJti = crypto.randomUUID();
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newSession = await this.repo.createSession({
      userId: user._id,
      tokenHash: newTokenHash,
      familyId: session.familyId, // Same family preserved across rotation
      jti: newJti,
      expiresAt: newExpiresAt,
      ipHash: hashIpAddress(context.ipAddress),
      userAgent: context.userAgent?.slice(0, 500) || session.userAgent || null,
    });

    // Mark old session as rotated and link to replacement
    await this.repo.revokeSession(session._id, 'rotated', newSession._id as any);

    // Sign new Access Token
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      sessionId: newSession._id.toString(),
      roles: user.roles,
    });

    const csrfToken = generateCsrfToken();

    return {
      user: this.mapToAuthUser(user),
      accessToken,
      newRawRefreshToken,
      csrfToken,
    };
  }

  /**
   * Logout current session
   */
  async logout(sessionId: string): Promise<void> {
    if (Types.ObjectId.isValid(sessionId)) {
      await this.repo.revokeSession(sessionId, 'logout');
    }
  }

  /**
   * Logout all sessions for a user & increment authVersion
   */
  async logoutAll(userId: string): Promise<void> {
    if (Types.ObjectId.isValid(userId)) {
      await this.repo.revokeAllUserSessions(userId, 'logout_all');
      const user = await this.repo.findUserById(userId);
      if (user) {
        await this.repo.updateUser(userId, {
          authVersion: (user.authVersion || 1) + 1,
        });
      }
    }
  }

  /**
   * Get Current User Profile (safe fields only)
   */
  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new Error('کاربر یافت نشد');
    }
    return this.mapToAuthUser(user);
  }

  /**
   * Get Active Sessions for Current User
   */
  async getActiveSessions(userId: string, currentSessionId: string): Promise<SessionItem[]> {
    const sessions = await this.repo.findActiveSessionsByUserId(userId);
    return sessions.map((s) => ({
      id: s._id.toString(),
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt ? s.lastUsedAt.toISOString() : null,
      expiresAt: s.expiresAt.toISOString(),
      userAgent: s.userAgent || 'مرورگر نامشخص',
      isCurrent: s._id.toString() === currentSessionId,
    }));
  }

  /**
   * Revoke specific session (ownership enforced)
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.repo.findSessionById(sessionId);
    if (!session) {
      throw new Error('نشست مورد نظر یافت نشد');
    }
    if (session.userId.toString() !== userId) {
      throw new Error('شما مجاز به ابطال این نشست نیستید');
    }
    await this.repo.revokeSession(sessionId, 'user_revoked');
  }

  /**
   * Change Password
   * - Verifies current password
   * - Hashes new password with Argon2id
   * - Revokes other sessions & logs user out for fresh re-login
   */
  async changePassword(params: {
    userId: string;
    currentSessionId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const user = await this.repo.findUserById(params.userId);
    if (!user || !user.passwordHash) {
      throw new Error('کاربر یافت نشد');
    }

    const isValid = await verifyPassword(user.passwordHash, params.currentPassword);
    if (!isValid) {
      throw new Error('رمز عبور فعلی صحیح نیست');
    }

    const newHash = await hashPassword(params.newPassword);

    await this.repo.updateUser(user._id, {
      passwordHash: newHash,
      passwordChangedAt: new Date(),
      authVersion: (user.authVersion || 1) + 1,
    });

    // Revoke all sessions including current session for strict password security
    await this.repo.revokeAllUserSessions(user._id, 'password_changed');
  }

  private mapToAuthUser(user: any): AuthUser {
    return {
      id: user._id.toString(),
      phoneE164: user.phoneE164,
      phoneMasked: maskPhoneNumber(user.phoneE164),
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      roles: user.roles || ['student'],
      status: user.status,
      phoneVerified: !!user.phoneVerifiedAt,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
    };
  }
}

export const authService = new AuthService();

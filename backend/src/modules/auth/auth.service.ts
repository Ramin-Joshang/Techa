import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { logger } from '../../core/logger/logger';
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
import { otpService, OtpService } from './otp/otp.service';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthUser,
  SessionItem,
  OtpChallengeResponse,
} from '@techa/shared';

export class AuthService {
  constructor(
    private repo: AuthRepository = authRepository,
    private otp: OtpService = otpService
  ) {}

  /**
   * User Registration
   * - Strict E.164 phone normalization
   * - Argon2id password hash
   * - Always assigns role 'student'
   * - Account set to 'pending_verification'
   * - Dispatches Kavenegar OTP challenge when configured
   */
  async register(
    input: RegisterRequest,
    ipAddress?: string
  ): Promise<RegisterResponse> {
    const phoneE164 = normalizePhoneE164(input.phone);

    // Check if phone number already exists
    const existingUser = await this.repo.findUserByPhone(phoneE164);
    if (existingUser) {
      if (existingUser.status === 'pending_verification') {
        if (this.otp.isConfigured()) {
          try {
            const challenge = await this.otp.requestOtp({
              phone: phoneE164,
              purpose: 'registration',
              userId: existingUser._id,
              ipAddress,
            });
            return {
              id: existingUser._id.toString(),
              phoneE164: existingUser.phoneE164,
              firstName: existingUser.firstName || '',
              lastName: existingUser.lastName || '',
              status: 'pending_verification',
              message: 'کد تأیید عضویت به شماره همراه شما ارسال شد.',
              challengeId: challenge.challengeId,
              maskedPhone: challenge.maskedPhone,
              expiresInSeconds: challenge.expiresInSeconds,
              resendAvailableAt: challenge.resendAvailableAt,
              retryAfterSeconds: challenge.retryAfterSeconds,
            };
          } catch (otpErr: unknown) {
            logger.warn({ otpErr }, '[AuthService] Failed to redispatch registration OTP');
          }
        }
        return {
          id: existingUser._id.toString(),
          phoneE164: existingUser.phoneE164,
          firstName: existingUser.firstName || '',
          lastName: existingUser.lastName || '',
          status: 'pending_verification',
          message: 'حساب شما ایجاد شده است اما سامانه پیامکی در حال حاضر فعال نیست.',
        };
      }
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

    // Request OTP via Kavenegar if configured
    if (this.otp.isConfigured()) {
      try {
        const challenge = await this.otp.requestOtp({
          phone: phoneE164,
          purpose: 'registration',
          userId: user._id,
          ipAddress,
        });

        return {
          id: user._id.toString(),
          phoneE164: user.phoneE164,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          status: 'pending_verification',
          message: 'کد تأیید عضویت به شماره همراه شما ارسال شد.',
          challengeId: challenge.challengeId,
          maskedPhone: challenge.maskedPhone,
          expiresInSeconds: challenge.expiresInSeconds,
          resendAvailableAt: challenge.resendAvailableAt,
          retryAfterSeconds: challenge.retryAfterSeconds,
        };
      } catch (otpErr: unknown) {
        logger.warn({ otpErr }, '[AuthService] Failed to dispatch registration OTP');
      }
    }

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
   * Request Login OTP
   * User enumeration protection: returns identical envelope for existing and non-existing users.
   */
  async requestLoginOtp(
    phone: string,
    ipAddress?: string
  ): Promise<OtpChallengeResponse> {
    const phoneE164 = normalizePhoneE164(phone);
    const user = await this.repo.findUserByPhone(phoneE164);

    // Only dispatch real SMS if user exists and is active & verified
    if (user && user.status === 'active' && user.phoneVerifiedAt) {
      return this.otp.requestOtp({
        phone: phoneE164,
        purpose: 'login',
        userId: user._id,
        ipAddress,
      });
    }

    // Anti-enumeration synthetic response
    return {
      challengeId: crypto.randomUUID(),
      purpose: 'login',
      maskedPhone: maskPhoneNumber(phoneE164),
      expiresInSeconds: 300,
      resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
      retryAfterSeconds: 60,
      message: 'در صورت وجود حساب فعال، کد ورود برای شماره شما ارسال خواهد شد.',
    };
  }

  /**
   * Verify OTP & Authenticate (Registration verification or Login)
   */
  async verifyOtpAndLogin(params: {
    challengeId: string;
    code: string;
    context: { userAgent?: string; ipAddress?: string };
  }): Promise<{
    user: AuthUser;
    accessToken: string;
    rawRefreshToken: string;
    csrfToken: string;
    message: string;
  }> {
    const { challenge } = await this.otp.verifyOtp({
      challengeId: params.challengeId,
      code: params.code,
    });

    let user = challenge.userId
      ? await this.repo.findUserById(challenge.userId)
      : await this.repo.findUserByPhone(challenge.phoneE164);

    if (!user) {
      throw new Error('کاربر مربوط به این درخواست یافت نشد');
    }

    // Purpose-specific user state transitions
    if (challenge.purpose === 'registration' || challenge.purpose === 'registration_verification') {
      user = await this.repo.updateUser(user._id, {
        status: 'active',
        phoneVerifiedAt: new Date(),
      });
      if (!user) throw new Error('خطا در به‌روزرسانی وضعیت کاربر');
    } else if (challenge.purpose === 'login' || challenge.purpose === 'passwordless_login') {
      if (user.status !== 'active') {
        throw new Error('حساب کاربری شما فعال نیست');
      }
    } else {
      throw new Error('OTP_INVALID');
    }

    // Record last login
    await this.repo.updateUser(user._id, {
      failedLoginCount: 0,
      lastLoginAt: new Date(),
    });

    // Create session using Phase 4 session architecture
    const familyId = crypto.randomUUID();
    const jti = crypto.randomUUID();
    const rawRefreshToken = generateOpaqueRefreshToken();
    const tokenHash = hashTokenSha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await this.repo.createSession({
      userId: user._id,
      tokenHash,
      familyId,
      jti,
      expiresAt,
      ipHash: hashIpAddress(params.context.ipAddress),
      userAgent: params.context.userAgent?.slice(0, 500) || null,
    });

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
      message:
        challenge.purpose === 'registration' || challenge.purpose === 'registration_verification'
          ? 'شماره موبایل شما با موفقیت تأیید شد و حساب کاربری فعال گردید'
          : 'ورود با موفقیت انجام شد',
    };
  }

  /**
   * Resend OTP for Challenge
   */
  async resendOtp(challengeId: string, ipAddress?: string): Promise<OtpChallengeResponse> {
    return this.otp.resendOtp(challengeId, ipAddress);
  }

  /**
   * Request Password Reset OTP
   * User enumeration protection: identical response envelope regardless of user existence.
   */
  async forgotPassword(phone: string, ipAddress?: string): Promise<OtpChallengeResponse> {
    const phoneE164 = normalizePhoneE164(phone);
    const user = await this.repo.findUserByPhone(phoneE164);

    if (user && user.status === 'active' && user.phoneVerifiedAt) {
      return this.otp.requestOtp({
        phone: phoneE164,
        purpose: 'password_reset',
        userId: user._id,
        ipAddress,
      });
    }

    // Anti-enumeration synthetic response
    return {
      challengeId: crypto.randomUUID(),
      purpose: 'password_reset',
      maskedPhone: maskPhoneNumber(phoneE164),
      expiresInSeconds: 300,
      resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
      retryAfterSeconds: 60,
      message: 'در صورت وجود حساب فعال، کد بازیابی برای شماره شما ارسال خواهد شد.',
    };
  }

  /**
   * Reset Password with OTP & Revoke all user sessions
   */
  async resetPasswordWithOtp(params: {
    challengeId: string;
    code: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const { challenge } = await this.otp.verifyOtp({
      challengeId: params.challengeId,
      code: params.code,
    });

    if (challenge.purpose !== 'password_reset') {
      throw new Error('OTP_INVALID');
    }

    const user = challenge.userId
      ? await this.repo.findUserById(challenge.userId)
      : await this.repo.findUserByPhone(challenge.phoneE164);

    if (!user) {
      throw new Error('کاربر مورد نظر یافت نشد');
    }

    const newHash = await hashPassword(params.newPassword);

    await this.repo.updateUser(user._id, {
      passwordHash: newHash,
      passwordChangedAt: new Date(),
      authVersion: (user.authVersion || 1) + 1,
    });

    // Revoke all existing sessions across all devices
    await this.repo.revokeAllUserSessions(user._id, 'password_reset');

    return {
      success: true,
      message: 'رمز عبور با موفقیت تغییر یافت. لطفاً با رمز عبور جدید وارد شوید.',
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
  async getActiveSessions(userId: string, currentSessionId?: string): Promise<SessionItem[]> {
    const sessions = await this.repo.findActiveSessionsByUserId(userId);
    return sessions.map((s) => ({
      id: s._id.toString(),
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt ? s.lastUsedAt.toISOString() : null,
      expiresAt: s.expiresAt.toISOString(),
      userAgent: s.userAgent || null,
      isCurrent: currentSessionId ? s._id.toString() === currentSessionId : false,
    }));
  }

  /**
   * Revoke a specific session owned by user
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.repo.findSessionById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      throw new Error('نشست مورد نظر یافت نشد یا متعلق به شما نیست');
    }
    await this.repo.revokeSession(session._id, 'user_revoked');
  }

  /**
   * Change Password (for logged in users)
   */
  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }): Promise<void> {
    const user = await this.repo.findUserById(userId);
    if (!user || !user.passwordHash) {
      throw new Error('کاربر یافت نشد');
    }

    const isCurrentValid = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!isCurrentValid) {
      throw new Error('رمز عبور فعلی صحیح نیست');
    }

    const newHash = await hashPassword(input.newPassword);

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

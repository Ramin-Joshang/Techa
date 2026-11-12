import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { app } from '../../src/app';
import * as dbStatus from '../../src/core/database/database-status';
import { hashOtpCode } from '../../src/modules/auth/otp/otp.security';
import { kavenegarProvider } from '../../src/modules/auth/otp/kavenegar.provider';
import { otpChallengeRepository } from '../../src/modules/auth/otp/otp.repository';
import { authRepository } from '../../src/modules/auth/auth.repository';

describe('Phase 5 — Kavenegar OTP & Phone Verification Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(true);

    // Mock Kavenegar SMS sending by default to succeed
    vi.spyOn(kavenegarProvider, 'isConfigured').mockReturnValue(true);
    vi.spyOn(kavenegarProvider, 'sendVerifyLookup').mockResolvedValue({
      accepted: true,
      messageId: 'mock-kav-msg-12345',
    });

    // Mock default repository behaviors to prevent Mongoose buffer timeouts
    vi.spyOn(otpChallengeRepository, 'findLatestByPhoneAndPurpose').mockResolvedValue(null);
    vi.spyOn(otpChallengeRepository, 'countSendsForPhoneInPastHour').mockResolvedValue(0);
    vi.spyOn(otpChallengeRepository, 'countSendsForIpInPastHour').mockResolvedValue(0);
    vi.spyOn(otpChallengeRepository, 'invalidatePreviousChallenges').mockResolvedValue(0);
    vi.spyOn(otpChallengeRepository, 'createChallenge').mockImplementation(async (data: any) => ({
      ...data,
      _id: new mongoose.Types.ObjectId(),
      attemptCount: 0,
      status: 'pending',
      deliveryStatus: 'pending',
      createdAt: new Date(),
      toObject() {
        return this;
      },
    }));
    vi.spyOn(otpChallengeRepository, 'updateDeliveryStatus').mockResolvedValue(null);
  });

  describe('POST /api/v1/auth/otp/request (Anti-User-Enumeration)', () => {
    it('returns standard challenge envelope when user exists and is active', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        phoneE164: '+989123456789',
        status: 'active',
        phoneVerifiedAt: new Date(),
        roles: ['student'],
      };
      vi.spyOn(authRepository, 'findUserByPhone').mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '09123456789' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('challengeId');
      expect(res.body.data.purpose).toBe('login');
      expect(res.body.data.maskedPhone).toContain('***');
      expect(res.body.data.retryAfterSeconds).toBe(60);
      expect(kavenegarProvider.sendVerifyLookup).toHaveBeenCalled();
    });

    it('returns an identical response structure when phone does NOT exist (Anti-Enumeration)', async () => {
      vi.spyOn(authRepository, 'findUserByPhone').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '09999999999' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('challengeId');
      expect(res.body.data.purpose).toBe('login');
      expect(res.body.data.maskedPhone).toContain('***');
      expect(res.body.data.retryAfterSeconds).toBe(60);
      // Ensure NO SMS is actually sent to protect credit & prevent probing
      expect(kavenegarProvider.sendVerifyLookup).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/otp/verify', () => {
    it('activates user and creates auth session for registration challenge', async () => {
      const challengeId = crypto.randomUUID();
      const phoneE164 = '+989123456789';
      const code = '654321';
      // Use the canonical system hash helper
      const codeDigest = hashOtpCode({ challengeId, phoneE164, purpose: 'registration', code });

      const mockChallenge = {
        _id: new mongoose.Types.ObjectId(),
        challengeId,
        phoneE164,
        purpose: 'registration',
        codeDigest,
        attemptCount: 0,
        maxAttempts: 5,
        status: 'pending',
        expiresAt: new Date(Date.now() + 300000),
        consumedAt: null,
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        phoneE164,
        firstName: 'آرش',
        lastName: 'کمانگیر',
        roles: ['student'],
        status: 'pending_verification',
        phoneVerifiedAt: null,
      };

      vi.spyOn(otpChallengeRepository, 'findChallengeById').mockResolvedValue(mockChallenge as any);
      vi.spyOn(otpChallengeRepository, 'consumeChallenge').mockResolvedValue({
        ...mockChallenge,
        status: 'consumed',
        consumedAt: new Date(),
      } as any);

      vi.spyOn(authRepository, 'findUserByPhone').mockResolvedValue(mockUser as any);
      vi.spyOn(authRepository, 'updateUser').mockResolvedValue({
        ...mockUser,
        status: 'active',
        phoneVerifiedAt: new Date(),
      } as any);

      vi.spyOn(authRepository, 'createSession').mockResolvedValue({
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
        userId: mockUser._id,
        familyId: crypto.randomUUID(),
        jti: crypto.randomUUID(),
        tokenHash: 'hashed-opaque-token',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        replacedBySessionId: null,
        ipHash: null,
        userAgent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ challengeId, code });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.status).toBe('active');
      expect(res.body.data.user.phoneVerified).toBe(true);

      // Verify Set-Cookie headers for access token, refresh token and csrf token
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const hasAccessToken = (cookies as string[]).some((c) => c.startsWith('techa_at='));
      const hasRefreshToken = (cookies as string[]).some((c) => c.startsWith('techa_rt='));
      expect(hasAccessToken).toBe(true);
      expect(hasRefreshToken).toBe(true);
    });

    it('rejects invalid OTP code with 400 and increments attempt count', async () => {
      const challengeId = crypto.randomUUID();
      const phoneE164 = '+989123456789';
      const validDigest = hashOtpCode({ challengeId, phoneE164, purpose: 'login', code: '111111' });

      const mockChallenge = {
        _id: new mongoose.Types.ObjectId(),
        challengeId,
        phoneE164,
        purpose: 'login',
        codeDigest: validDigest,
        attemptCount: 1,
        maxAttempts: 5,
        status: 'pending',
        expiresAt: new Date(Date.now() + 300000),
        consumedAt: null,
      };

      vi.spyOn(otpChallengeRepository, 'findChallengeById').mockResolvedValue(mockChallenge as any);
      vi.spyOn(otpChallengeRepository, 'incrementAttemptCount').mockResolvedValue({
        ...mockChallenge,
        attemptCount: 2,
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ challengeId, code: '999999' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('OTP_INVALID');
    });
  });

  describe('POST /api/v1/auth/password/forgot & /reset', () => {
    it('completes full password recovery workflow with session revocation', async () => {
      const challengeId = crypto.randomUUID();
      const phoneE164 = '+989123456789';
      const resetCode = '777888';
      const codeDigest = hashOtpCode({ challengeId, phoneE164, purpose: 'password_reset', code: resetCode });

      const mockUser = {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        phoneE164,
        roles: ['student'],
        status: 'active',
        phoneVerifiedAt: new Date(),
        authVersion: 1,
      };

      // 1. Forgot password request
      vi.spyOn(authRepository, 'findUserByPhone').mockResolvedValue(mockUser as any);

      const forgotRes = await request(app)
        .post('/api/v1/auth/password/forgot')
        .send({ phone: '09123456789' });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.success).toBe(true);
      expect(forgotRes.body.data).toHaveProperty('challengeId');
      expect(forgotRes.body.data.purpose).toBe('password_reset');

      // 2. Reset password request with valid code
      const mockChallenge = {
        _id: new mongoose.Types.ObjectId(),
        challengeId,
        phoneE164,
        purpose: 'password_reset',
        codeDigest,
        attemptCount: 0,
        maxAttempts: 5,
        status: 'pending',
        expiresAt: new Date(Date.now() + 300000),
        consumedAt: null,
      };

      vi.spyOn(otpChallengeRepository, 'findChallengeById').mockResolvedValue(mockChallenge as any);
      vi.spyOn(otpChallengeRepository, 'consumeChallenge').mockResolvedValue({
        ...mockChallenge,
        status: 'consumed',
        consumedAt: new Date(),
      } as any);

      const updateSpy = vi.spyOn(authRepository, 'updateUser').mockResolvedValue({
        ...mockUser,
        authVersion: 2,
      } as any);

      const revokeSessionsSpy = vi.spyOn(authRepository, 'revokeAllUserSessions').mockResolvedValue(3);

      const resetRes = await request(app)
        .post('/api/v1/auth/password/reset')
        .send({
          challengeId,
          code: resetCode,
          newPassword: 'BrandNewSecurePassword123!',
          confirmPassword: 'BrandNewSecurePassword123!',
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          authVersion: 2,
        })
      );
      expect(revokeSessionsSpy).toHaveBeenCalledWith(mockUser._id, 'password_reset');
    });
  });
});

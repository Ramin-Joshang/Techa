import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { generateOtpCode, hashOtpCode, verifyOtpCode } from '../../src/modules/auth/otp/otp.security';
import { OtpService } from '../../src/modules/auth/otp/otp.service';

describe('OTP Security & Service Unit Tests', () => {
  const secret = 'super-secret-test-salt-12345678901234567890';

  describe('OTP Security Functions', () => {
    it('generates a 6-digit numeric OTP code using CSPRNG', () => {
      for (let i = 0; i < 20; i++) {
        const code = generateOtpCode(6);
        expect(code).toMatch(/^[0-9]{6}$/);
      }
    });

    it('hashes OTP code bound to challenge context (challengeId, phone, purpose)', () => {
      const challengeId = crypto.randomUUID();
      const phoneE164 = '+989123456789';
      const purpose = 'login';
      const code = '123456';

      const hash1 = hashOtpCode({ challengeId, phoneE164, purpose, code, secret });
      const hash2 = hashOtpCode({ challengeId, phoneE164, purpose, code, secret });
      expect(hash1).toBe(hash2);

      // Changing any context parameter changes the resulting hash
      const differentCodeHash = hashOtpCode({ challengeId, phoneE164, purpose, code: '654321', secret });
      expect(differentCodeHash).not.toBe(hash1);

      const differentPurposeHash = hashOtpCode({ challengeId, phoneE164, purpose: 'registration', code, secret });
      expect(differentPurposeHash).not.toBe(hash1);

      const differentChallengeHash = hashOtpCode({ challengeId: crypto.randomUUID(), phoneE164, purpose, code, secret });
      expect(differentChallengeHash).not.toBe(hash1);
    });

    it('verifies code in constant time using timingSafeEqual', () => {
      const challengeId = crypto.randomUUID();
      const phoneE164 = '+989123456789';
      const purpose = 'login';
      const code = '582910';

      const hash = hashOtpCode({ challengeId, phoneE164, purpose, code, secret });

      expect(verifyOtpCode({ challengeId, phoneE164, purpose, candidateCode: '582910', expectedHash: hash, secret })).toBe(true);
      expect(verifyOtpCode({ challengeId, phoneE164, purpose, candidateCode: '000000', expectedHash: hash, secret })).toBe(false);
      expect(verifyOtpCode({ challengeId, phoneE164, purpose, candidateCode: '123', expectedHash: hash, secret })).toBe(false);
    });
  });

  describe('OtpService Workflow & State Machine', () => {
    let mockRepo: any;
    let mockProvider: any;
    let otpService: OtpService;

    beforeEach(() => {
      mockRepo = {
        findLatestByPhoneAndPurpose: vi.fn().mockResolvedValue(null),
        invalidatePreviousChallenges: vi.fn().mockResolvedValue(0),
        countSendsForPhoneInPastHour: vi.fn().mockResolvedValue(0),
        countSendsForIpInPastHour: vi.fn().mockResolvedValue(0),
        createChallenge: vi.fn().mockImplementation((data) => ({
          ...data,
          _id: 'mock-obj-id',
          createdAt: new Date(),
          toObject: () => data,
        })),
        findChallengeById: vi.fn(),
        updateDeliveryStatus: vi.fn().mockResolvedValue(null),
        incrementAttemptCount: vi.fn(),
        consumeChallenge: vi.fn(),
      };

      mockProvider = {
        isConfigured: vi.fn().mockReturnValue(true),
        sendVerifyLookup: vi.fn().mockResolvedValue({ accepted: true, messageId: 'msg-999' }),
      };

      otpService = new OtpService(mockRepo, mockProvider);
    });

    it('enforces hourly rate limits for phone numbers', async () => {
      mockRepo.countSendsForPhoneInPastHour.mockResolvedValue(5); // Max is 5

      await expect(
        otpService.requestOtp({
          phone: '+989123456789',
          purpose: 'login',
        })
      ).rejects.toThrow('OTP_HOURLY_LIMIT_PHONE_EXCEEDED');
    });

    it('enforces hourly rate limits for IP addresses', async () => {
      mockRepo.countSendsForIpInPastHour.mockResolvedValue(10); // Max is 10

      await expect(
        otpService.requestOtp({
          phone: '+989123456789',
          purpose: 'login',
          ipAddress: '192.168.1.1',
        })
      ).rejects.toThrow('OTP_HOURLY_LIMIT_IP_EXCEEDED');
    });

    it('dispatches SMS through provider and records challenge in pending state', async () => {
      const response = await otpService.requestOtp({
        phone: '+989123456789',
        purpose: 'login',
      });

      expect(response).toHaveProperty('challengeId');
      expect(response.purpose).toBe('login');
      expect(response.maskedPhone).toContain('***');
      expect(response.retryAfterSeconds).toBe(60);

      expect(mockRepo.invalidatePreviousChallenges).toHaveBeenCalled();
      expect(mockRepo.createChallenge).toHaveBeenCalled();
      expect(mockProvider.sendVerifyLookup).toHaveBeenCalledWith(
        expect.objectContaining({
          receptor: '+989123456789',
          template: expect.any(String),
          token: expect.stringMatching(/^[0-9]{6}$/),
        })
      );
    });

    it('locks challenge when max attempts (5) are reached', async () => {
      const challengeId = crypto.randomUUID();
      const phoneE164 = '+989123456789';
      const purpose = 'login';
      const validCode = '123456';
      const codeDigest = hashOtpCode({ challengeId, phoneE164, purpose, code: validCode, secret });

      mockRepo.findChallengeById.mockResolvedValue({
        challengeId,
        phoneE164,
        purpose,
        codeDigest,
        attemptCount: 4,
        maxAttempts: 5,
        status: 'pending',
        expiresAt: new Date(Date.now() + 120000),
        consumedAt: null,
      });

      mockRepo.incrementAttemptCount.mockResolvedValue({
        challengeId,
        attemptCount: 5,
        status: 'locked',
      });

      // Wrong code on 5th attempt
      await expect(
        otpService.verifyOtp({
          challengeId,
          code: '000000',
        })
      ).rejects.toThrow('OTP_LOCKED');

      expect(mockRepo.incrementAttemptCount).toHaveBeenCalledWith(challengeId, 5);
    });

    it('rejects expired challenges with OTP_EXPIRED error', async () => {
      const challengeId = crypto.randomUUID();
      mockRepo.findChallengeById.mockResolvedValue({
        challengeId,
        phoneE164: '+989123456789',
        purpose: 'login',
        codeDigest: 'somehash',
        attemptCount: 1,
        maxAttempts: 5,
        status: 'pending',
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
        consumedAt: null,
      });

      await expect(
        otpService.verifyOtp({
          challengeId,
          code: '123456',
        })
      ).rejects.toThrow('OTP_EXPIRED');
    });

    it('enforces resend cooldown before allowing a new challenge', async () => {
      const challengeId = crypto.randomUUID();
      mockRepo.findChallengeById.mockResolvedValue({
        challengeId,
        phoneE164: '+989123456789',
        purpose: 'login',
        resendAvailableAt: new Date(Date.now() + 45000), // 45s left in cooldown
      });
      mockRepo.findLatestByPhoneAndPurpose.mockResolvedValue({
        challengeId,
        phoneE164: '+989123456789',
        purpose: 'login',
        resendAvailableAt: new Date(Date.now() + 45000),
      });

      await expect(otpService.resendOtp(challengeId)).rejects.toThrow('OTP_RESEND_COOLDOWN_ACTIVE');
    });
  });
});

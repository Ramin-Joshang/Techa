import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { env } from '../../../core/config/env';
import { logger } from '../../../core/logger/logger';
import { OtpPurpose, OtpChallengeResponse } from '@techa/shared';
import { otpChallengeRepository, OtpChallengeRepository } from './otp.repository';
import { kavenegarProvider, KavenegarProvider } from './kavenegar.provider';
import { generateOtpCode, hashOtpCode, verifyOtpCode } from './otp.security';
import { normalizePhoneE164, maskPhoneNumber, hashIpAddress } from '../auth.security';
import { IOtpChallengeDocument } from '../../../models/otp-challenge.model';

export class OtpService {
  constructor(
    private repo: OtpChallengeRepository = otpChallengeRepository,
    private provider: KavenegarProvider = kavenegarProvider
  ) {}

  /**
   * Checks if OTP service is enabled and configured with SMS provider.
   */
  isConfigured(): boolean {
    const isExplicitlyDisabled = process.env.AUTH_OTP_ENABLED === 'false';
    if (isExplicitlyDisabled) return false;
    return this.provider.isConfigured();
  }

  /**
   * Resolves the appropriate Kavenegar template name for the purpose.
   */
  private resolveTemplate(purpose: OtpPurpose): string {
    if (purpose === 'registration' || purpose === 'registration_verification') {
      return (
        process.env.KAVENEGAR_REGISTER_TEMPLATE ||
        env.KAVENEGAR_REGISTER_TEMPLATE ||
        process.env.KAVENEGAR_VERIFY_TEMPLATE ||
        env.KAVENEGAR_VERIFY_TEMPLATE ||
        'verify'
      );
    }
    if (purpose === 'login' || purpose === 'passwordless_login') {
      return (
        process.env.KAVENEGAR_LOGIN_TEMPLATE ||
        env.KAVENEGAR_LOGIN_TEMPLATE ||
        process.env.KAVENEGAR_VERIFY_TEMPLATE ||
        env.KAVENEGAR_VERIFY_TEMPLATE ||
        'verify'
      );
    }
    if (purpose === 'password_reset') {
      return (
        process.env.KAVENEGAR_PASSWORD_RESET_TEMPLATE ||
        env.KAVENEGAR_PASSWORD_RESET_TEMPLATE ||
        process.env.KAVENEGAR_VERIFY_TEMPLATE ||
        env.KAVENEGAR_VERIFY_TEMPLATE ||
        'verify'
      );
    }
    return (
      process.env.KAVENEGAR_VERIFY_TEMPLATE ||
      env.KAVENEGAR_VERIFY_TEMPLATE ||
      'verify'
    );
  }

  /**
   * Generates and dispatches an OTP challenge via Kavenegar.
   */
  async requestOtp(params: {
    phone: string;
    purpose: OtpPurpose;
    userId?: Types.ObjectId | string | null;
    ipAddress?: string;
  }): Promise<OtpChallengeResponse> {
    const phoneE164 = normalizePhoneE164(params.phone);
    const ipHash = params.ipAddress ? hashIpAddress(params.ipAddress) : null;

    // 1. Rate Limiting — Check Resend Cooldown from existing challenge
    const latestChallenge = await this.repo.findLatestByPhoneAndPurpose(phoneE164, params.purpose);
    if (
      latestChallenge &&
      latestChallenge.resendAvailableAt &&
      new Date(latestChallenge.resendAvailableAt) > new Date()
    ) {
      throw new Error('OTP_RESEND_COOLDOWN_ACTIVE');
    }

    // 2. Rate Limiting — Hourly send limits
    const phoneSendsInHour = await this.repo.countSendsForPhoneInPastHour(phoneE164);
    const maxSendsPhone = env.OTP_MAX_SENDS_PER_PHONE_PER_HOUR;
    if (phoneSendsInHour >= maxSendsPhone) {
      throw new Error('OTP_HOURLY_LIMIT_PHONE_EXCEEDED');
    }

    if (ipHash) {
      const ipSendsInHour = await this.repo.countSendsForIpInPastHour(ipHash);
      const maxSendsIp = env.OTP_MAX_SENDS_PER_IP_PER_HOUR;
      if (ipSendsInHour >= maxSendsIp) {
        throw new Error('OTP_HOURLY_LIMIT_IP_EXCEEDED');
      }
    }

    // 3. Invalidate previous active challenges for this phone & purpose
    await this.repo.invalidatePreviousChallenges(phoneE164, params.purpose);

    // 4. Generate Challenge and CSPRNG Code
    const challengeId = crypto.randomUUID();
    const digits = env.OTP_CODE_DIGITS || 6;
    const rawCode = generateOtpCode(digits);
    const codeDigest = hashOtpCode({
      challengeId,
      phoneE164,
      purpose: params.purpose,
      code: rawCode,
    });

    const ttlSeconds = env.OTP_TTL_SECONDS || 300;
    const cooldownSeconds = env.OTP_RESEND_COOLDOWN_SECONDS || 60;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const resendAvailableAt = new Date(Date.now() + cooldownSeconds * 1000);

    // 5. Create Challenge record in MongoDB
    await this.repo.createChallenge({
      challengeId,
      phoneE164,
      userId: params.userId ? new Types.ObjectId(params.userId) : null,
      purpose: params.purpose,
      codeDigest,
      maxAttempts: env.OTP_MAX_ATTEMPTS || 5,
      expiresAt,
      resendAvailableAt,
      ipHash,
    });

    // 6. Check Provider Configuration & Dispatch
    const isExplicitlyDisabled = process.env.AUTH_OTP_ENABLED === 'false';
    const isConfigured = !isExplicitlyDisabled && this.provider.isConfigured();
    const template = this.resolveTemplate(params.purpose);

    if (!isConfigured || !template) {
      logger.warn(
        {
          isExplicitlyDisabled,
          hasKey: this.provider.isConfigured(),
          templateConfigured: !!template,
        },
        '[OtpService] Kavenegar OTP is not enabled or not fully configured in environment'
      );
      throw new Error('OTP_PROVIDER_NOT_CONFIGURED');
    }

    try {
      const result = await this.provider.sendVerifyLookup({
        receptor: phoneE164,
        token: rawCode,
        template,
      });

      await this.repo.updateDeliveryStatus(challengeId, 'accepted', result.messageId);
    } catch (err: unknown) {
      await this.repo.updateDeliveryStatus(challengeId, 'failed');
      throw err;
    }

    return {
      challengeId,
      purpose: params.purpose,
      maskedPhone: maskPhoneNumber(phoneE164),
      expiresInSeconds: ttlSeconds,
      resendAvailableAt: resendAvailableAt.toISOString(),
      retryAfterSeconds: cooldownSeconds,
      message: 'درخواست ارسال کد تأیید با موفقیت در سامانه پیامکی ثبت شد',
    };
  }

  /**
   * Resends OTP for an existing challenge respecting cooldown.
   */
  async resendOtp(challengeId: string, ipAddress?: string): Promise<OtpChallengeResponse> {
    const challenge = await this.repo.findChallengeById(challengeId);
    if (!challenge) {
      throw new Error('OTP_INVALID');
    }

    return this.requestOtp({
      phone: challenge.phoneE164,
      purpose: challenge.purpose,
      userId: challenge.userId,
      ipAddress,
    });
  }

  /**
   * Verifies submitted OTP code against HMAC digest in MongoDB.
   */
  async verifyOtp(params: {
    challengeId: string;
    code: string;
  }): Promise<{ verified: boolean; challenge: IOtpChallengeDocument }> {
    const challenge = await this.repo.findChallengeById(params.challengeId);
    if (!challenge) {
      throw new Error('OTP_INVALID');
    }

    if (challenge.status === 'consumed') {
      throw new Error('OTP_ALREADY_USED');
    }

    if (challenge.status === 'locked' || challenge.attemptCount >= challenge.maxAttempts) {
      throw new Error('OTP_LOCKED');
    }

    if (new Date() >= new Date(challenge.expiresAt)) {
      throw new Error('OTP_EXPIRED');
    }

    const isValid = verifyOtpCode({
      challengeId: challenge.challengeId,
      phoneE164: challenge.phoneE164,
      purpose: challenge.purpose,
      plainCode: params.code,
      storedHash: challenge.codeDigest,
    });

    if (!isValid) {
      const updated = await this.repo.incrementAttemptCount(
        challenge.challengeId,
        challenge.maxAttempts
      );
      if (updated && updated.attemptCount >= challenge.maxAttempts) {
        throw new Error('OTP_LOCKED');
      }
      throw new Error('OTP_INVALID');
    }

    // Atomic single-use consumption
    const consumed = await this.repo.consumeChallenge(challenge.challengeId);
    if (!consumed) {
      throw new Error('OTP_ALREADY_USED');
    }

    return {
      verified: true,
      challenge: consumed,
    };
  }
}

export const otpService = new OtpService();

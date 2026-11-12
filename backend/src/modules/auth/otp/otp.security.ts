import crypto from 'node:crypto';
import { env } from '../../../core/config/env';

/**
 * Returns the HMAC secret dedicated to OTP hashing.
 * Strictly separate from JWT secret and CSRF secret.
 */
export function getOtpHashSecret(): string {
  const secret = process.env.OTP_HASH_SECRET || env.OTP_HASH_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('OTP_HASH_SECRET must be at least 32 characters in production');
  }
  return secret || 'techa_dev_otp_hmac_secret_2026_at_least_32_chars!';
}

/**
 * Generates cryptographically secure, unpredictable numeric OTP code.
 * Preserves exact digit length (default 6 digits).
 */
export function generateOtpCode(digits: number = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  const codeInt = crypto.randomInt(min, max);
  return String(codeInt);
}

/**
 * Hashes OTP code using HMAC-SHA256 bound to challenge context:
 * - challengeId
 * - phoneE164
 * - purpose
 * - code
 * Prevents cross-challenge, cross-phone, and cross-purpose hash re-use.
 */
export function hashOtpCode(params: {
  challengeId: string;
  phoneE164: string;
  purpose: string;
  code: string;
  secret?: string;
}): string {
  const secret = params.secret || getOtpHashSecret();
  const contextString = `${params.challengeId}:${params.phoneE164}:${params.purpose}:${params.code.trim()}`;
  return crypto.createHmac('sha256', secret).update(contextString).digest('hex');
}

/**
 * Constant-time comparison between entered code and stored HMAC digest.
 */
export function verifyOtpCode(params: {
  challengeId: string;
  phoneE164: string;
  purpose: string;
  plainCode?: string;
  candidateCode?: string;
  storedHash?: string;
  expectedHash?: string;
  secret?: string;
}): boolean {
  const code = params.plainCode || params.candidateCode;
  const hash = params.storedHash || params.expectedHash;
  if (!code || !hash) return false;
  const computedHash = hashOtpCode({
    challengeId: params.challengeId,
    phoneE164: params.phoneE164,
    purpose: params.purpose,
    code,
    secret: params.secret,
  });

  try {
    const a = Buffer.from(computedHash, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

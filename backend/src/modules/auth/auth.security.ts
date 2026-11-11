import crypto from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } from 'google-libphonenumber';
import { UserRole } from '@techa/shared';

const phoneUtil = PhoneNumberUtil.getInstance();

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  roles: UserRole[];
  token_use: 'access';
  jti: string;
  iss: string;
  aud: string;
}

/**
 * Normalizes and validates a phone number to canonical E.164 (+989123456789).
 * Handles common Iranian mobile patterns:
 * - 09123456789
 * - +989123456789
 * - 00989123456789
 * - 9123456789
 */
export function normalizePhoneE164(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') {
    throw new Error('شماره موبایل وارد نشده است');
  }

  let cleaned = rawPhone.trim().replace(/[\s\-_()]/g, '');

  // Convert Persian and Arabic numerals to ASCII
  cleaned = cleaned
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));

  try {
    // If it starts with 0098, convert to +98
    let parseable = cleaned;
    if (parseable.startsWith('0098')) {
      parseable = '+' + parseable.slice(2);
    } else if (parseable.startsWith('00') && !parseable.startsWith('+')) {
      parseable = '+' + parseable.slice(2);
    }

    const number = phoneUtil.parseAndKeepRawInput(parseable, 'IR');

    if (!phoneUtil.isValidNumber(number)) {
      throw new Error('شماره موبایل وارد شده معتبر نیست');
    }

    // Verify it is a mobile or fixed_line_or_mobile type
    const numberType = phoneUtil.getNumberType(number);
    if (
      numberType !== PhoneNumberType.MOBILE &&
      numberType !== PhoneNumberType.FIXED_LINE_OR_MOBILE
    ) {
      throw new Error('شماره وارد شده باید شماره تلفن همراه باشد');
    }

    const e164 = phoneUtil.format(number, PhoneNumberFormat.E164);
    if (!e164 || !/^\+[1-9]\d{1,14}$/.test(e164)) {
      throw new Error('فرمت شماره موبایل پشتیبانی نمی‌شود');
    }

    return e164;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('شماره')) {
      throw err;
    }
    throw new Error('شماره موبایل وارد شده معتبر نیست');
  }
}

/**
 * Produces a safe masked phone number for display (e.g. +98 912 *** 6789).
 */
export function maskPhoneNumber(phoneE164: string): string {
  if (!phoneE164 || phoneE164.length < 8) return '***';
  const prefix = phoneE164.slice(0, 6);
  const suffix = phoneE164.slice(-4);
  return `${prefix} *** ${suffix}`;
}

/**
 * Hashes password using Argon2id.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verifies password against Argon2id hash.
 */
export async function verifyPassword(passwordHash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, plainPassword);
  } catch {
    return false;
  }
}

/**
 * Checks whether Argon2id hash parameters need to be rehashed to newer standards.
 */
export function needsRehash(passwordHash: string): boolean {
  return argon2.needsRehash(passwordHash, {
    memoryCost: 65536,
    timeCost: 3,
  });
}

/**
 * Generates an opaque random refresh token (48 bytes hex = 96 chars).
 */
export function generateOpaqueRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Generates a SHA-256 hash (64 hex characters) of a raw token.
 */
export function hashTokenSha256(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Anonymizes client IP address using SHA-256.
 */
export function hashIpAddress(ip?: string): string {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip.trim()).digest('hex');
}

/**
 * Generates a random cryptographic CSRF token (32 bytes hex).
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * JWT Access Token signing & verification
 */
const JWT_ISSUER = process.env.JWT_ISSUER || 'techa.ir';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'techa-platform';
const JWT_ACCESS_TTL_SECONDS = parseInt(process.env.JWT_ACCESS_TTL_SECONDS || '600', 10); // 10 minutes default

function getJwtAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET || 'techa_dev_jwt_super_secure_access_secret_2026_at_least_256_bits_length!';
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters in production');
  }
  return secret;
}

export function signAccessToken(params: {
  userId: string;
  sessionId: string;
  roles: UserRole[];
}): string {
  const secret = getJwtAccessSecret();
  const jti = crypto.randomUUID();

  return jwt.sign(
    {
      roles: params.roles,
      token_use: 'access',
    },
    secret,
    {
      algorithm: 'HS256',
      subject: params.userId,
      jwtid: jti,
      expiresIn: JWT_ACCESS_TTL_SECONDS,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      header: {
        typ: 'JWT',
        sid: params.sessionId,
      } as any,
    }
  );
}

export function verifyAccessToken(token: string): {
  userId: string;
  sessionId: string;
  roles: UserRole[];
  jti: string;
} {
  const secret = getJwtAccessSecret();

  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader || typeof decodedHeader !== 'object') {
    throw new Error('توکن نامعتبر است');
  }

  // Explicitly reject "none" algorithm and enforce HS256
  if (decodedHeader.header.alg !== 'HS256') {
    throw new Error('الگوریتم توکن نامعتبر است');
  }

  const verified = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as any;

  if (verified.token_use !== 'access') {
    throw new Error('کاربرد توکن نامعتبر است');
  }

  const sid = (decodedHeader.header as any)?.sid || verified.sid;
  if (!sid) {
    throw new Error('شناسه نشست در توکن موجود نیست');
  }

  return {
    userId: verified.sub,
    sessionId: sid,
    roles: verified.roles || ['student'],
    jti: verified.jti,
  };
}

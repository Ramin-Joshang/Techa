import { describe, it, expect } from 'vitest';
import {
  normalizePhoneE164,
  maskPhoneNumber,
  hashPassword,
  verifyPassword,
  generateOpaqueRefreshToken,
  hashTokenSha256,
  hashIpAddress,
  generateCsrfToken,
  signAccessToken,
  verifyAccessToken,
} from '../../src/modules/auth/auth.security';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  ChangePasswordRequestSchema,
} from '@techa/shared';

describe('Phase 4 — Auth Security Utilities & Schemas', () => {
  describe('Phone Normalization & Masking', () => {
    it('normalizes standard Iranian mobile numbers (0912...) to E.164 (+98912...)', () => {
      const e164 = normalizePhoneE164('09123456789');
      expect(e164).toBe('+989123456789');
    });

    it('normalizes 989... format without leading plus or zero to +989...', () => {
      const e164 = normalizePhoneE164('989123456789');
      expect(e164).toBe('+989123456789');
    });

    it('normalizes numbers with Persian / Arabic digits', () => {
      const e164 = normalizePhoneE164('۰۹۱۲۳۴۵۶۷۸۹');
      expect(e164).toBe('+989123456789');
    });

    it('normalizes 00989... format to +989...', () => {
      const e164 = normalizePhoneE164('00989123456789');
      expect(e164).toBe('+989123456789');
    });

    it('normalizes international numbers when valid', () => {
      const e164 = normalizePhoneE164('+14155552671');
      expect(e164).toBe('+14155552671');
    });

    it('rejects invalid or too short phone numbers with an Error', () => {
      expect(() => normalizePhoneE164('12345')).toThrow();
      expect(() => normalizePhoneE164('0912')).toThrow();
      expect(() => normalizePhoneE164('')).toThrow();
      expect(() => normalizePhoneE164('invalid-phone')).toThrow();
    });

    it('correctly masks phone numbers preserving country code and last 4 digits', () => {
      const masked = maskPhoneNumber('+989123456789');
      expect(masked).toBe('+98912 *** 6789');
    });
  });

  describe('Argon2id Password Hashing & Verification', () => {
    it('hashes passwords using Argon2id with correct parameters', async () => {
      const plain = 'StrongPass1234!';
      const hash = await hashPassword(plain);

      expect(typeof hash).toBe('string');
      // Argon2id header verification
      expect(hash.startsWith('$argon2id$')).toBe(true);
      expect(hash).toContain('m=65536');
      expect(hash).toContain('t=3');
      expect(hash).toContain('p=4');
    });

    it('verifies a correct password against its Argon2id hash', async () => {
      const plain = 'SuperSecret2026!';
      const hash = await hashPassword(plain);

      const isValid = await verifyPassword(hash, plain);
      expect(isValid).toBe(true);
    });

    it('rejects an incorrect password', async () => {
      const plain = 'SuperSecret2026!';
      const wrong = 'WrongPassword999!';
      const hash = await hashPassword(plain);

      const isValid = await verifyPassword(hash, wrong);
      expect(isValid).toBe(false);
    });

    it('gracefully returns false for corrupted or invalid hash string', async () => {
      const isValid = await verifyPassword('invalid-hash-string', 'password');
      expect(isValid).toBe(false);
    });
  });

  describe('Opaque Tokens & Hashes', () => {
    it('generates 48-byte hex opaque refresh token (96 chars)', () => {
      const token = generateOpaqueRefreshToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(96);
      expect(/^[0-9a-f]{96}$/.test(token)).toBe(true);
    });

    it('generates cryptographically distinct refresh tokens', () => {
      const token1 = generateOpaqueRefreshToken();
      const token2 = generateOpaqueRefreshToken();
      expect(token1).not.toBe(token2);
    });

    it('computes deterministic SHA-256 token hash (64 hex characters)', () => {
      const token = 'sample-random-token-for-testing';
      const hash1 = hashTokenSha256(token);
      const hash2 = hashTokenSha256(token);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
    });

    it('hashes IP addresses deterministically for privacy audit', () => {
      const ip = '192.168.1.100';
      const hash = hashIpAddress(ip);
      expect(hash.length).toBe(64);
    });

    it('generates 32-byte (64 hex characters) CSRF tokens', () => {
      const csrf = generateCsrfToken();
      expect(csrf.length).toBe(64);
      expect(/^[0-9a-f]{64}$/.test(csrf)).toBe(true);
    });
  });

  describe('JWT Access Token Signing & Verification', () => {
    const mockParams = {
      userId: '507f1f77bcf86cd799439011',
      sessionId: '507f1f77bcf86cd799439099',
      roles: ['student'] as Array<'student' | 'content_editor' | 'platform_admin' | 'super_admin'>,
    };

    it('signs an access token with HS256 algorithm and restricted lifetime', () => {
      const jwtToken = signAccessToken(mockParams);
      expect(typeof jwtToken).toBe('string');
      expect(jwtToken.split('.').length).toBe(3);
    });

    it('verifies a signed access token and extracts exact payload', () => {
      const jwtToken = signAccessToken(mockParams);
      const payload = verifyAccessToken(jwtToken);

      expect(payload).not.toBeNull();
      expect(payload.userId).toBe(mockParams.userId);
      expect(payload.sessionId).toBe(mockParams.sessionId);
      expect(payload.roles).toEqual(['student']);
      expect(payload.jti).toBeDefined();
    });

    it('rejects tampered or forged JWT tokens', () => {
      const jwtToken = signAccessToken(mockParams);
      const parts = jwtToken.split('.');
      const tampered = `${parts[0]}.${parts[1]}.tamperedSignature`;

      expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it('rejects tokens signed with unsupported algorithms or empty tokens', () => {
      expect(() => verifyAccessToken('')).toThrow();
      expect(() => verifyAccessToken('abc.def.ghi')).toThrow();
    });
  });

  describe('Shared Auth Zod Schemas', () => {
    it('validates a correct registration request', () => {
      const valid = {
        phone: '09123456789',
        password: 'ValidPassword123!',
        firstName: 'مهدی',
        lastName: 'قلی‌پور',
      };
      const res = RegisterRequestSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it('rejects registration with passwords shorter than 12 characters', () => {
      const shortPass = {
        phone: '09123456789',
        password: 'Short123',
        firstName: 'مهدی',
      };
      const res = RegisterRequestSchema.safeParse(shortPass);
      expect(res.success).toBe(false);
    });

    it('validates login request schema', () => {
      expect(LoginRequestSchema.safeParse({ phone: '09123456789', password: 'Pass' }).success).toBe(true);
      expect(LoginRequestSchema.safeParse({ phone: '', password: 'Pass' }).success).toBe(false);
      expect(LoginRequestSchema.safeParse({ phone: '09123456789', password: '' }).success).toBe(false);
    });

    it('validates change password request schema', () => {
      const valid = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'NewPassword2026!Sec',
      };
      expect(ChangePasswordRequestSchema.safeParse(valid).success).toBe(true);

      const tooShort = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'short',
      };
      expect(ChangePasswordRequestSchema.safeParse(tooShort).success).toBe(false);
    });
  });
});

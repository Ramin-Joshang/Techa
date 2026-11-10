import { describe, it, expect } from 'vitest';
import {
  PhoneE164Schema,
  UserSchema,
  CreateUserDtoSchema,
  AuthSessionSchema,
  CreateAuthSessionDtoSchema,
  OtpChallengeSchema,
  CreateOtpChallengeDtoSchema,
  SiteSettingsSchema,
  ContentRevisionSchema,
  CreateContentRevisionDtoSchema,
  AdminAuditLogSchema,
  CreateAdminAuditLogDtoSchema,
  TARGET_COLLECTIONS,
} from '@techa/shared';

describe('Phase 1 — Zod Contracts & Schemas Validation', () => {
  describe('PhoneE164Schema', () => {
    it('accepts valid E.164 phone numbers', () => {
      expect(PhoneE164Schema.safeParse('+989123456789').success).toBe(true);
      expect(PhoneE164Schema.safeParse('+14155552671').success).toBe(true);
      expect(PhoneE164Schema.safeParse('+442071838750').success).toBe(true);
    });

    it('rejects invalid phone formats (local numbers, missing +, letters)', () => {
      expect(PhoneE164Schema.safeParse('09123456789').success).toBe(false);
      expect(PhoneE164Schema.safeParse('+09123456789').success).toBe(false);
      expect(PhoneE164Schema.safeParse('9123456789').success).toBe(false);
      expect(PhoneE164Schema.safeParse('+abc').success).toBe(false);
      expect(PhoneE164Schema.safeParse('+').success).toBe(false);
      expect(PhoneE164Schema.safeParse('').success).toBe(false);
    });
  });

  describe('UserSchema & CreateUserDtoSchema', () => {
    it('validates a complete valid user object', () => {
      const validUser = {
        id: '507f1f77bcf86cd799439011',
        phoneE164: '+989123456789',
        firstName: 'علی',
        lastName: 'محمدی',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        roles: ['student', 'content_editor'],
        status: 'active',
        failedLoginCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = UserSchema.safeParse(validUser);
      expect(res.success).toBe(true);
    });

    it('CreateUserDto sets default roles to [student] and requires valid passwordHash', () => {
      const dto = {
        phoneE164: '+989123456789',
        firstName: 'رضا',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      };
      const parsed = CreateUserDtoSchema.parse(dto);
      expect(parsed.roles).toEqual(['student']);
      expect(parsed.phoneE164).toBe('+989123456789');
    });

    it('rejects invalid roles or invalid status', () => {
      const invalid = {
        phoneE164: '+989123456789',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        roles: ['superhero'],
      };
      expect(CreateUserDtoSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('AuthSessionSchema & CreateAuthSessionDtoSchema', () => {
    it('validates correct session and requires 64-char tokenHash and UUIDs', () => {
      const validDto = {
        userId: '507f1f77bcf86cd799439011',
        tokenHash: 'a'.repeat(64),
        familyId: '550e8400-e29b-41d4-a716-446655440000',
        jti: 'c9b45b20-d3cf-4354-9462-8703ad8f5334',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      const parsed = CreateAuthSessionDtoSchema.safeParse(validDto);
      expect(parsed.success).toBe(true);
    });

    it('rejects tokenHash with invalid length', () => {
      const invalidDto = {
        userId: '507f1f77bcf86cd799439011',
        tokenHash: 'short_hash',
        familyId: '550e8400-e29b-41d4-a716-446655440000',
        jti: 'c9b45b20-d3cf-4354-9462-8703ad8f5334',
        expiresAt: new Date().toISOString(),
      };
      expect(CreateAuthSessionDtoSchema.safeParse(invalidDto).success).toBe(false);
    });
  });

  describe('OtpChallengeSchema & CreateOtpChallengeDtoSchema', () => {
    it('validates OTP creation with default provider and attempt counts', () => {
      const now = Date.now();
      const validDto = {
        phoneE164: '+989123456789',
        purpose: 'passwordless_login' as const,
        codeDigest: 'b'.repeat(64),
        expiresAt: new Date(now + 120000).toISOString(),
        resendAvailableAt: new Date(now + 60000).toISOString(),
      };
      const parsed = CreateOtpChallengeDtoSchema.parse(validDto);
      expect(parsed.provider).toBe('kavenegar');
      expect(parsed.purpose).toBe('passwordless_login');
      expect(parsed.maxAttempts).toBe(5);
    });

    it('rejects invalid OTP purpose enum', () => {
      const now = Date.now();
      const invalid = {
        phoneE164: '+989123456789',
        purpose: 'fake_action',
        codeDigest: 'b'.repeat(64),
        expiresAt: new Date(now + 120000).toISOString(),
        resendAvailableAt: new Date(now + 60000).toISOString(),
      };
      expect(CreateOtpChallengeDtoSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('SiteSettingsSchema', () => {
    it('validates global singleton site settings', () => {
      const settings = {
        settingsKey: 'global',
        branding: {
          siteName: 'تکا (TECHA)',
          siteDescription: 'پلتفرم آموزش تخصصی',
        },
        header: {
          logoText: 'تکا',
          navigationItems: [
            { id: '1', label: 'خانه', path: '/', external: false, order: 1 },
          ],
        },
        footer: {
          description: 'توضیحات فوتر',
          copyright: 'تمامی حقوق محفوظ است',
          linkGroups: [],
          socialLinks: [{ platform: 'github', url: 'https://github.com/techa', label: 'گیت‌هاب' }],
        },
        seo: {
          defaultMetaTitle: 'تکا',
          defaultMetaDescription: 'توضیحات تکا',
          robotsPolicy: 'index, follow',
        },
        general: {
          primaryDomain: 'techa.ir',
        },
      };
      expect(SiteSettingsSchema.safeParse(settings).success).toBe(true);
    });

    it('rejects non-global settingsKey', () => {
      const invalid = {
        settingsKey: 'other_key',
        branding: { siteName: 'Test' },
      };
      expect(SiteSettingsSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('ContentRevisionSchema', () => {
    it('validates content revision with 64-char contentHash and stringified snapshotJson', () => {
      const revision = {
        id: '507f1f77bcf86cd799439011',
        resourceType: 'lesson',
        resourceId: 'lesson-123',
        revisionNumber: 1,
        changeSummary: 'ویرایش کد پایتون',
        contentHash: 'c'.repeat(64),
        snapshotJson: JSON.stringify({ title: 'Lesson 1', blocks: [] }),
        createdAt: new Date().toISOString(),
      };
      expect(ContentRevisionSchema.safeParse(revision).success).toBe(true);
    });

    it('rejects unsupported resourceType in content revision', () => {
      const invalid = {
        resourceType: 'arbitrary_collection',
        resourceId: 'res-1',
        revisionNumber: 1,
        changeSummary: 'تغییر',
        contentHash: 'c'.repeat(64),
        snapshotJson: '{}',
      };
      expect(CreateContentRevisionDtoSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('AdminAuditLogSchema', () => {
    it('validates audit log entry', () => {
      const audit = {
        id: '507f1f77bcf86cd799439011',
        actorRole: 'admin',
        action: 'create',
        resourceType: 'course',
        resourceId: 'course-1',
        result: 'success',
        requestId: 'req-abc-123',
        changedFields: ['title', 'price'],
        changeSummary: 'بروزرسانی قیمت دوره',
        createdAt: new Date().toISOString(),
      };
      expect(AdminAuditLogSchema.safeParse(audit).success).toBe(true);
    });

    it('rejects invalid action in audit log', () => {
      const invalid = {
        actorRole: 'admin',
        action: 'destroy_all',
        resourceType: 'course',
        resourceId: '1',
        result: 'success',
        requestId: 'req-1',
        changeSummary: 'تغییر غیرمجاز',
      };
      expect(CreateAdminAuditLogDtoSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Target Collections Completeness', () => {
    it('exactly 11 target collections are defined', () => {
      expect(TARGET_COLLECTIONS.length).toBe(11);
      expect(TARGET_COLLECTIONS).toEqual([
        'courses',
        'chapters',
        'lessons',
        'media_assets',
        'site_pages',
        'site_settings',
        'users',
        'auth_sessions',
        'otp_challenges',
        'content_revisions',
        'admin_audit_logs',
      ]);
    });
  });
});

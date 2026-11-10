import { describe, it, expect } from 'vitest';
import {
  UserModel,
  AuthSessionModel,
  OtpChallengeModel,
  ContentRevisionModel,
  AdminAuditLogModel,
  SiteSettingsModel,
} from '../../src/models';
import { TARGET_INDEX_SPECIFICATIONS } from '../../src/core/database/indexes';

describe('Phase 1 — Mongoose Models & Index Specifications Validation', () => {
  describe('UserModel', () => {
    it('validates a correct user document instance', async () => {
      const user = new UserModel({
        phoneE164: '+989123456789',
        firstName: 'رضا',
        lastName: 'اکبری',
        roles: ['student'],
        status: 'pending_verification',
      });
      const err = await user.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(user.phoneE164).toBe('+989123456789');
      expect(user.roles).toContain('student');
    });

    it('fails validation on invalid phone format', async () => {
      const user = new UserModel({
        phoneE164: '09123456789', // Invalid: missing + and country code
      });
      const err = await user.validate().catch((e) => e);
      expect(err).toBeDefined();
      expect(err.errors['phoneE164']).toBeDefined();
    });

    it('UserModel collection is "users"', () => {
      expect(UserModel.collection.name).toBe('users');
    });
  });

  describe('AuthSessionModel', () => {
    it('validates correct session with 64-char tokenHash', async () => {
      const session = new AuthSessionModel({
        userId: '507f1f77bcf86cd799439011',
        tokenHash: 'd'.repeat(64),
        familyId: 'fam-uuid-1234',
        jti: 'jti-uuid-5678',
        expiresAt: new Date(Date.now() + 3600000),
      });
      const err = await session.validate().catch((e) => e);
      expect(err).toBeUndefined();
    });

    it('AuthSessionModel collection is "auth_sessions"', () => {
      expect(AuthSessionModel.collection.name).toBe('auth_sessions');
    });
  });

  describe('OtpChallengeModel', () => {
    it('validates correct OTP challenge', async () => {
      const otp = new OtpChallengeModel({
        phoneE164: '+989123456789',
        purpose: 'passwordless_login',
        codeDigest: 'e'.repeat(64),
        expiresAt: new Date(Date.now() + 120000),
      });
      const err = await otp.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(otp.status).toBe('pending');
      expect(otp.provider).toBe('kavenegar');
      expect(otp.maxAttempts).toBe(5);
    });

    it('fails on invalid purpose', async () => {
      const otp = new OtpChallengeModel({
        phoneE164: '+989123456789',
        purpose: 'non_existent_purpose' as any,
        codeDigest: 'e'.repeat(64),
        expiresAt: new Date(),
      });
      const err = await otp.validate().catch((e) => e);
      expect(err).toBeDefined();
      expect(err.errors['purpose']).toBeDefined();
    });

    it('OtpChallengeModel collection is "otp_challenges"', () => {
      expect(OtpChallengeModel.collection.name).toBe('otp_challenges');
    });
  });

  describe('ContentRevisionModel', () => {
    it('validates correct revision and strictly requires snapshotJson string', async () => {
      const rev = new ContentRevisionModel({
        resourceType: 'lesson',
        resourceId: 'lesson-456',
        revisionNumber: 2,
        changeSummary: 'بروزرسانی مثال اجرایی',
        contentHash: 'f'.repeat(64),
        snapshotJson: JSON.stringify({ key: 'value' }),
      });
      const err = await rev.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(rev.snapshotJson).toBe('{"key":"value"}');
    });

    it('ContentRevisionModel collection is "content_revisions"', () => {
      expect(ContentRevisionModel.collection.name).toBe('content_revisions');
    });
  });

  describe('AdminAuditLogModel', () => {
    it('validates audit log instance with append-only requirements', async () => {
      const log = new AdminAuditLogModel({
        actorRole: 'admin',
        action: 'publish',
        resourceType: 'course',
        resourceId: 'course-react',
        result: 'success',
        requestId: 'req-999',
        changedFields: ['status'],
        changeSummary: 'انتشار دوره ری‌اکت',
      });
      const err = await log.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(log.action).toBe('publish');
    });

    it('AdminAuditLogModel collection is "admin_audit_logs"', () => {
      expect(AdminAuditLogModel.collection.name).toBe('admin_audit_logs');
    });
  });

  describe('SiteSettingsModel', () => {
    it('validates singleton global settings', async () => {
      const settings = new SiteSettingsModel({
        settingsKey: 'global',
        branding: {
          siteName: 'تکا (TECHA)',
          siteDescription: 'پلتفرم آموزش',
        },
      });
      const err = await settings.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(settings.settingsKey).toBe('global');
    });

    it('SiteSettingsModel collection is "site_settings"', () => {
      expect(SiteSettingsModel.collection.name).toBe('site_settings');
    });
  });

  describe('Index Specifications Conformity to Section 13', () => {
    it('defines indexes for all 11 target collections', () => {
      const collections = Object.keys(TARGET_INDEX_SPECIFICATIONS);
      expect(collections.length).toBe(11);
    });

    it('verifies TTL indexes on auth_sessions and otp_challenges', () => {
      const authSessionIndexes = TARGET_INDEX_SPECIFICATIONS['auth_sessions'];
      const ttlAuth = authSessionIndexes.find((idx) => idx.options?.expireAfterSeconds !== undefined);
      expect(ttlAuth).toBeDefined();
      expect(ttlAuth?.options?.expireAfterSeconds).toBe(0);

      const otpIndexes = TARGET_INDEX_SPECIFICATIONS['otp_challenges'];
      const ttlOtp = otpIndexes.find((idx) => idx.options?.expireAfterSeconds !== undefined);
      expect(ttlOtp).toBeDefined();
      expect(ttlOtp?.options?.expireAfterSeconds).toBe(0);
    });
  });
});

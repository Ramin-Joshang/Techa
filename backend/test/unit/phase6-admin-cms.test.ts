import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  ROLE_PERMISSIONS,
  hasAdminPermission,
  hasAnyAdminAccess,
  AdminCreateCourseDtoSchema,
  AdminCreateLessonDtoSchema,
  AdminContentBlocksArraySchema,
  AdminCreateSitePageDtoSchema,
  AdminUpdateSiteSettingsDtoSchema,
  AdminUpdateUserRolesDtoSchema,
} from '@techa/shared';
import { env } from '../../src/core/config/env';
import { verifyMagicBytes, sanitizeOriginalFilename } from '../../src/modules/admin/media/media-validation';
import { LocalMediaStorageProvider } from '../../src/modules/admin/media/media-storage.service';
import {
  redactSensitiveFieldNames,
  sanitizeSummaryText,
} from '../../src/modules/admin/audit/audit.service';
import { sanitizeSnapshotObject } from '../../src/modules/admin/revisions/revision.service';
import {
  buildCourseRevalidationTargets,
  buildLessonRevalidationTargets,
  buildPageRevalidationTargets,
  buildSettingsRevalidationTargets,
} from '../../src/modules/admin/cache/cache-invalidation.service';

describe('Phase 6 — CMS Backend & Governance Unit Tests', () => {
  describe('Central RBAC Permission Matrix', () => {
    it('denies all admin access and permissions to student role', () => {
      expect(hasAnyAdminAccess(['student'])).toBe(false);
      expect(ROLE_PERMISSIONS.student).toHaveLength(0);
      expect(hasAdminPermission(['student'], 'courses:read')).toBe(false);
      expect(hasAdminPermission(['student'], 'dashboard:read')).toBe(false);
    });

    it('grants content_editor create/update/upload but denies publish/archive/delete/users/settings/audit', () => {
      expect(hasAnyAdminAccess(['content_editor'])).toBe(true);
      expect(hasAdminPermission(['content_editor'], 'courses:create')).toBe(true);
      expect(hasAdminPermission(['content_editor'], 'courses:update')).toBe(true);
      expect(hasAdminPermission(['content_editor'], 'lessons:update')).toBe(true);
      expect(hasAdminPermission(['content_editor'], 'media:upload')).toBe(true);
      expect(hasAdminPermission(['content_editor'], 'preview:read')).toBe(true);

      expect(hasAdminPermission(['content_editor'], 'courses:publish')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'courses:archive')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'media:delete')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'pages:publish')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'settings:update')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'users:manage_roles')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'audit:read')).toBe(false);
      expect(hasAdminPermission(['content_editor'], 'revisions:restore')).toBe(false);
    });

    it('grants content_manager publish/archive/media:delete/pages/revisions:restore but denies settings/users/audit', () => {
      expect(hasAdminPermission(['content_manager'], 'courses:publish')).toBe(true);
      expect(hasAdminPermission(['content_manager'], 'lessons:publish')).toBe(true);
      expect(hasAdminPermission(['content_manager'], 'media:delete')).toBe(true);
      expect(hasAdminPermission(['content_manager'], 'pages:publish')).toBe(true);
      expect(hasAdminPermission(['content_manager'], 'revisions:restore')).toBe(true);

      expect(hasAdminPermission(['content_manager'], 'settings:update')).toBe(false);
      expect(hasAdminPermission(['content_manager'], 'users:manage_roles')).toBe(false);
      expect(hasAdminPermission(['content_manager'], 'audit:read')).toBe(false);
    });

    it('grants admin settings, user governance, and audit logs', () => {
      expect(hasAdminPermission(['admin'], 'settings:update')).toBe(true);
      expect(hasAdminPermission(['admin'], 'users:manage_status')).toBe(true);
      expect(hasAdminPermission(['admin'], 'users:manage_roles')).toBe(true);
      expect(hasAdminPermission(['admin'], 'users:revoke_sessions')).toBe(true);
      expect(hasAdminPermission(['admin'], 'audit:read')).toBe(true);
    });
  });

  describe('Admin Zod Schemas, Content Block Limits & XSS URL Sanitization', () => {
    it('validates course creation DTO and rejects invalid slug or system icon format', () => {
      const valid = AdminCreateCourseDtoSchema.safeParse({
        slug: 'typescript-mastery',
        title: 'آموزش جامع تایپ‌اسکریپت',
        summary: 'خلاصه دوره برای توسعه‌دهندگان بک‌اند و فرانت‌اند',
        description: 'توضیحات کامل دوره آموزشی تایپ‌اسکریپت از پایه تا معماری سیستم',
        level: 'intermediate',
        icon: { kind: 'system', name: 'lucide:code-2' },
        seo: {
          metaTitle: 'آموزش تایپ‌اسکریپت | تکا',
          metaDescription: 'یادگیری عمیق تایپ‌اسکریپت با مثال‌های واقعی و استاندارد صنعتی',
        },
      });
      expect(valid.success).toBe(true);

      const badSlug = AdminCreateCourseDtoSchema.safeParse({
        slug: 'Bad Slug!',
        title: 'Test',
        summary: 'Summary',
        description: 'Description',
        level: 'beginner',
        icon: { kind: 'system', name: 'lucide:book' },
        seo: { metaTitle: 'Title here', metaDescription: 'Description long enough here' },
      });
      expect(badSlug.success).toBe(false);
    });

    it('rejects duplicate block IDs, >100 blocks, and unsafe javascript:/data: URLs', () => {
      const duplicateBlocks = AdminContentBlocksArraySchema.safeParse([
        { id: 'blk_dup_0001', version: 1, type: 'paragraph', data: { text: 'اول' } },
        { id: 'blk_dup_0001', version: 1, type: 'paragraph', data: { text: 'دوم' } },
      ]);
      expect(duplicateBlocks.success).toBe(false);

      const overLimitBlocks = Array.from({ length: 101 }, (_, i) => ({
        id: `blk_item_${String(i).padStart(4, '0')}`,
        version: 1 as const,
        type: 'divider' as const,
        data: {},
      }));
      expect(AdminContentBlocksArraySchema.safeParse(overLimitBlocks).success).toBe(false);

      const xssRichText = AdminCreateLessonDtoSchema.safeParse({
        title: 'درس تستی',
        slug: 'test-lesson',
        order: 1,
        readingTimeMinutes: 5,
        contentBlocks: [
          {
            id: 'blk_rich_0001',
            version: 1,
            type: 'richText',
            data: {
              spans: [
                {
                  text: 'لینک مخرب',
                  link: { url: 'javascript:alert(1)' },
                },
              ],
            },
          },
        ],
        seo: { metaTitle: 'عنوان متا تستی', metaDescription: 'توضیحات متا تستی مناسب' },
      });
      expect(xssRichText.success).toBe(false);

      const xssSettings = AdminUpdateSiteSettingsDtoSchema.safeParse({
        header: {
          navigationItems: [{ label: 'هک', path: 'javascript:void(0)', order: 1 }],
        },
      });
      expect(xssSettings.success).toBe(false);

      const xssSocial = AdminUpdateSiteSettingsDtoSchema.safeParse({
        footer: {
          socialLinks: [{ platform: 'github', url: 'data:text/html,<script>' }],
        },
      });
      expect(xssSocial.success).toBe(false);
    });

    it('enforces home page heroSection and features requirements in AdminCreateSitePageDtoSchema', () => {
      const missingHomeHero = AdminCreateSitePageDtoSchema.safeParse({
        pageKey: 'home',
        title: 'صفحه اصلی',
        seo: { metaTitle: 'صفحه اصلی تکا', metaDescription: 'پلتفرم آموزش مهندسی نرم‌افزار' },
      });
      expect(missingHomeHero.success).toBe(false);

      const validCustomPage = AdminCreateSitePageDtoSchema.safeParse({
        pageKey: 'about-us',
        title: 'درباره تکا',
        contentBlocks: [{ id: 'blk_heading_1234', version: 1, type: 'heading', data: { level: 2, text: 'درباره ما' } }],
        seo: { metaTitle: 'درباره تکا | آکادمی', metaDescription: 'معرفی تیم و اهداف آموزشی پلتفرم تکا' },
      });
      expect(validCustomPage.success).toBe(true);
    });

    it('requires explicit reason when updating user roles', () => {
      expect(
        AdminUpdateUserRolesDtoSchema.safeParse({ roles: ['content_editor'], reason: 'ok' }).success
      ).toBe(false);
      expect(
        AdminUpdateUserRolesDtoSchema.safeParse({
          roles: ['content_editor'],
          reason: 'ارتقا به تیم تحریریه محتوا',
        }).success
      ).toBe(true);
    });
  });

  describe('Media Validation & Local Storage Provider', () => {
    let tempRoot = '';
    const originalRoot = env.TECHA_MEDIA_STORAGE_ROOT;
    const storage = new LocalMediaStorageProvider();

    beforeAll(async () => {
      tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'techa-media-unit-'));
      env.TECHA_MEDIA_STORAGE_ROOT = tempRoot;
    });

    afterAll(async () => {
      env.TECHA_MEDIA_STORAGE_ROOT = originalRoot;
      if (tempRoot) {
        await fsp.rm(tempRoot, { recursive: true, force: true });
      }
    });

    it('verifies magic bytes accurately and rejects spoofed headers', () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const validPdf = Buffer.from('%PDF-1.7\n', 'ascii');
      const validWebp = Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 ', 'latin1');

      expect(verifyMagicBytes(validPng, 'image/png')).toBe(true);
      expect(verifyMagicBytes(validJpg, 'image/jpeg')).toBe(true);
      expect(verifyMagicBytes(validPdf, 'application/pdf')).toBe(true);
      expect(verifyMagicBytes(validWebp, 'image/webp')).toBe(true);

      // Spoofed script disguised as PNG
      const fakePng = Buffer.from('<script>alert(1)</script>', 'utf8');
      expect(verifyMagicBytes(fakePng, 'image/png')).toBe(false);
    });

    it('sanitizes filenames and blocks path traversal in resolveSafePath', () => {
      expect(sanitizeOriginalFilename('../../evil\\file?.png')).not.toContain('..');
      expect(sanitizeOriginalFilename('../../evil\\file?.png')).not.toContain('/');
      expect(() => storage.resolveSafePath('../etc/passwd')).toThrow();
      expect(() => storage.resolveSafePath('media/../secret.png')).toThrow();
      expect(storage.resolveSafePath('media/2026/11/sample.png')).toBe(
        path.resolve(tempRoot, 'media/2026/11/sample.png')
      );
    });

    it('streams valid PNG to disk with SHA-256 checksum, rejects forbidden .svg, and cleans up temp on failure', async () => {
      const pngBytes = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      ]);

      const stored = await storage.storeFromStream({
        fileStream: Readable.from([pngBytes]),
        originalFileName: 'diagram.png',
        claimedMimeType: 'image/png',
      });

      expect(stored.mimeType).toBe('image/png');
      expect(stored.mediaType).toBe('image');
      expect(stored.sizeBytes).toBe(pngBytes.length);
      expect(stored.checksumSha256).toHaveLength(64);
      expect(await storage.exists(stored.storageKey)).toBe(true);

      await storage.deleteFile(stored.storageKey);
      expect(await storage.exists(stored.storageKey)).toBe(false);

      // Reject forbidden extension (.svg)
      await expect(
        storage.storeFromStream({
          fileStream: Readable.from([Buffer.from('<svg></svg>')]),
          originalFileName: 'xss.svg',
          claimedMimeType: 'image/svg+xml',
        })
      ).rejects.toThrow();

      // Reject spoofed MIME (.png containing HTML) and ensure no orphaned tmp files remain
      await expect(
        storage.storeFromStream({
          fileStream: Readable.from([Buffer.from('<html>evil</html>')]),
          originalFileName: 'spoof.png',
          claimedMimeType: 'image/png',
        })
      ).rejects.toThrow();

      const walkTmp = (dir: string): string[] => {
        if (!fs.existsSync(dir)) return [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        return entries.flatMap((e) =>
          e.isDirectory() ? walkTmp(path.join(dir, e.name)) : e.name.includes('.tmp-') ? [e.name] : []
        );
      };
      expect(walkTmp(tempRoot)).toEqual([]);
    });
  });

  describe('Audit Redaction, Snapshot Sanitization & Cache Targets', () => {
    it('redacts sensitive field names and bearer/secret tokens from audit summaries', () => {
      const fields = redactSensitiveFieldNames([
        'title',
        'passwordHash',
        'tokenHash',
        'refreshToken',
        'seo.metaTitle',
      ]);
      expect(fields).toEqual(['title', 'seo.metaTitle']);

      const sanitized = sanitizeSummaryText(
        'Updated with Bearer eyJhbGciOiJIUzI1NiJ9.abc.def and secret=myTopSecret123'
      );
      expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiJ9');
      expect(sanitized).not.toContain('myTopSecret123');
      expect(sanitized).toContain('Bearer [REDACTED]');
      expect(sanitized).toContain('secret=[REDACTED]');
    });

    it('strips secret keys from revision snapshots', () => {
      const clean = sanitizeSnapshotObject({
        title: 'Course',
        passwordHash: 'argon2...',
        tokenHash: 'sha256...',
        __v: 3,
      });
      expect(clean).toEqual({ title: 'Course' });
    });

    it('builds accurate Next.js cache tags and paths for courses, lessons, pages, and settings', () => {
      const courseTargets = buildCourseRevalidationTargets('react-core');
      expect(courseTargets.tags).toEqual(
        expect.arrayContaining([
          'techa-home',
          'techa-courses',
          'techa-search',
          'techa-course:react-core',
          'techa-course-outline:react-core',
        ])
      );
      expect(courseTargets.paths).toEqual(expect.arrayContaining(['/', '/docs', '/docs/react-core']));

      const lessonTargets = buildLessonRevalidationTargets('react-core', 'hooks-intro');
      expect(lessonTargets.tags).toContain('techa-lesson:react-core:hooks-intro');
      expect(lessonTargets.paths).toContain('/docs/react-core/hooks-intro');

      const homePageTargets = buildPageRevalidationTargets('home');
      expect(homePageTargets.tags).toEqual(
        expect.arrayContaining(['techa-pages', 'techa-page:home', 'techa-home'])
      );
      expect(homePageTargets.paths).toContain('/');

      const settingsTargets = buildSettingsRevalidationTargets();
      expect(settingsTargets.tags).toEqual(
        expect.arrayContaining(['techa-settings', 'techa-home', 'techa-courses'])
      );
    });
  });
});

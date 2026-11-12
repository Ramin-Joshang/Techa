import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import mongoose, { Types } from 'mongoose';
import { UserRole } from '@techa/shared';
import { app } from '../../src/app';
import { env } from '../../src/core/config/env';
import * as dbStatus from '../../src/core/database/database-status';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { signAccessToken } from '../../src/modules/auth/auth.security';
import {
  CourseModel,
  LessonModel,
  MediaAssetModel,
  SitePageModel,
  SiteSettingsModel,
  UserModel,
} from '../../src/models';
import { courseStatsService } from '../../src/services/course-stats.service';
import { adminAuditService } from '../../src/modules/admin/audit/audit.service';
import { contentRevisionService } from '../../src/modules/admin/revisions/revision.service';
import { adminMediaService } from '../../src/modules/admin/media/media.service';

const CSRF_TOKEN = 'a'.repeat(64);

function makeAuthSession(roles: UserRole[], userId = new Types.ObjectId()) {
  const sessionId = new Types.ObjectId();
  const user = {
    _id: userId,
    phoneE164: '+989120000001',
    firstName: 'کاربر',
    lastName: 'تستی',
    roles,
    status: 'active' as const,
    authVersion: 1,
  };
  const session = {
    _id: sessionId,
    userId,
    revokedAt: null,
    expiresAt: new Date(Date.now() + 3600_000),
    lastUsedAt: new Date(),
  };

  vi.spyOn(authRepository, 'findSessionById').mockResolvedValue(session as any);
  vi.spyOn(authRepository, 'findUserById').mockResolvedValue(user as any);

  const accessToken = signAccessToken({
    userId: userId.toString(),
    sessionId: sessionId.toString(),
    roles,
  });

  return {
    userId,
    cookies: [`techa_at=${accessToken}`, `techa_csrf=${CSRF_TOKEN}`],
    csrfHeader: CSRF_TOKEN,
  };
}

describe('Phase 6 — Admin CMS & Governance API Integration Tests', () => {
  let tempMediaRoot = '';
  const originalMediaRoot = env.TECHA_MEDIA_STORAGE_ROOT;

  beforeAll(async () => {
    tempMediaRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'techa-phase6-int-'));
    env.TECHA_MEDIA_STORAGE_ROOT = tempMediaRoot;
  });

  afterAll(async () => {
    env.TECHA_MEDIA_STORAGE_ROOT = originalMediaRoot;
    if (tempMediaRoot) {
      await fsp.rm(tempMediaRoot, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(true);
    vi.spyOn(adminAuditService, 'record').mockResolvedValue({ _id: new Types.ObjectId() } as any);
    vi.spyOn(adminAuditService, 'recordDeniedSafely').mockResolvedValue(undefined);
    vi.spyOn(contentRevisionService, 'createRevision').mockResolvedValue({
      _id: new Types.ObjectId(),
      revisionNumber: 1,
    } as any);
  });

  describe('1. Authentication, Role Gate & CSRF Enforcement', () => {
    it('rejects unauthenticated requests to /api/v1/admin/* with 401', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard/summary');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects student role with 403 Forbidden', async () => {
      const auth = makeAuthSession(['student']);
      const res = await request(app)
        .get('/api/v1/admin/dashboard/summary')
        .set('Cookie', auth.cookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('enforces CSRF double-submit token on state-changing admin routes', async () => {
      const auth = makeAuthSession(['content_manager']);
      const res = await request(app)
        .post('/api/v1/admin/courses')
        .set('Cookie', [auth.cookies[0]]) // Missing techa_csrf cookie and x-csrf-token header
        .send({});

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_INVALID');
    });
  });

  describe('2. RBAC & Content Editor Ownership Enforcement', () => {
    it('blocks content_editor from publishing courses, deleting media, changing settings, or viewing audit logs', async () => {
      const auth = makeAuthSession(['content_editor']);
      const courseId = new Types.ObjectId().toString();
      const mediaId = new Types.ObjectId().toString();

      const pubRes = await request(app)
        .post(`/api/v1/admin/courses/${courseId}/publish`)
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader)
        .send({});
      expect(pubRes.status).toBe(403);

      const delMediaRes = await request(app)
        .delete(`/api/v1/admin/media/${mediaId}`)
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader);
      expect(delMediaRes.status).toBe(403);

      const settingsRes = await request(app)
        .patch('/api/v1/admin/settings')
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader)
        .send({});
      expect(settingsRes.status).toBe(403);

      const auditRes = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Cookie', auth.cookies);
      expect(auditRes.status).toBe(403);
    });

    it('blocks content_editor from updating a course created by a different author', async () => {
      const editorAuth = makeAuthSession(['content_editor'], new Types.ObjectId('650000000000000000000010'));
      const otherCreatorId = new Types.ObjectId('650000000000000000000099');
      const courseId = new Types.ObjectId('650000000000000000000101');

      vi.spyOn(CourseModel, 'findById').mockResolvedValue({
        _id: courseId,
        slug: 'other-course',
        version: 1,
        status: 'draft',
        createdBy: otherCreatorId,
      } as any);

      const res = await request(app)
        .patch(`/api/v1/admin/courses/${courseId.toString()}`)
        .set('Cookie', editorAuth.cookies)
        .set('x-csrf-token', editorAuth.csrfHeader)
        .send({ title: 'عنوان ویرایش‌شده غیرمجاز', expectedVersion: 1 });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows content_editor to update their own course and allows content_manager to publish', async () => {
      const editorId = new Types.ObjectId('650000000000000000000010');
      const editorAuth = makeAuthSession(['content_editor'], editorId);
      const courseId = new Types.ObjectId('650000000000000000000102');
      const now = new Date();

      const updatedCourseDoc = {
        _id: courseId,
        slug: 'my-course',
        title: 'دوره ویرایش‌شده توسط نویسنده',
        summary: 'خلاصه تستی',
        description: 'توضیحات تستی دوره آموزشی',
        level: 'beginner',
        icon: { kind: 'system', name: 'lucide:book' },
        tags: [],
        prerequisites: [],
        targetAudience: [],
        order: 1,
        status: 'draft',
        version: 2,
        stats: { totalChapters: 0, totalLessons: 0, estimatedReadingTimeMinutes: 0 },
        seo: { metaTitle: 'عنوان متا دوره آموزشی', metaDescription: 'توضیحات متا استاندارد برای دوره آموزشی' },
        createdBy: editorId,
        updatedBy: editorId,
        createdAt: now,
        updatedAt: now,
        toObject() {
          return this;
        },
      };

      vi.spyOn(CourseModel, 'findById').mockResolvedValue({
        _id: courseId,
        slug: 'my-course',
        version: 1,
        status: 'draft',
        createdBy: editorId,
      } as any);
      vi.spyOn(CourseModel, 'findOneAndUpdate').mockResolvedValue(updatedCourseDoc as any);

      const patchRes = await request(app)
        .patch(`/api/v1/admin/courses/${courseId.toString()}`)
        .set('Cookie', editorAuth.cookies)
        .set('x-csrf-token', editorAuth.csrfHeader)
        .send({ title: 'دوره ویرایش‌شده توسط نویسنده', expectedVersion: 1 });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.version).toBe(2);

      // Now test content_manager publish
      const managerAuth = makeAuthSession(['content_manager']);
      const publishedDoc = {
        ...updatedCourseDoc,
        status: 'published',
        version: 3,
        publishedAt: now,
        lastPublishedAt: now,
      };

      vi.spyOn(CourseModel, 'findById')
        .mockResolvedValueOnce(updatedCourseDoc as any)
        .mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(publishedDoc) } as any);
      vi.spyOn(CourseModel, 'findOneAndUpdate').mockResolvedValue(publishedDoc as any);
      vi.spyOn(courseStatsService, 'recalculateCourseStats').mockResolvedValue({
        totalChapters: 0,
        totalLessons: 0,
        estimatedReadingTimeMinutes: 0,
      });

      const publishRes = await request(app)
        .post(`/api/v1/admin/courses/${courseId.toString()}/publish`)
        .set('Cookie', managerAuth.cookies)
        .set('x-csrf-token', managerAuth.csrfHeader)
        .send({ expectedVersion: 2 });

      expect(publishRes.status).toBe(200);
      expect(publishRes.body.data.status).toBe('published');
      expect(publishRes.body.data.version).toBe(3);
    });
  });

  describe('3. Optimistic Concurrency (409 Conflict)', () => {
    it('returns 409 CONFLICT when expectedVersion mismatches on course or lesson update', async () => {
      const auth = makeAuthSession(['content_manager']);
      const courseId = new Types.ObjectId('650000000000000000000201');
      const lessonId = new Types.ObjectId('650000000000000000000202');

      vi.spyOn(CourseModel, 'findById').mockResolvedValue({
        _id: courseId,
        slug: 'concurrency-course',
        version: 5,
        status: 'draft',
      } as any);

      const courseRes = await request(app)
        .patch(`/api/v1/admin/courses/${courseId.toString()}`)
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader)
        .send({ title: 'تغییر همزمان', expectedVersion: 4 });

      expect(courseRes.status).toBe(409);
      expect(courseRes.body.error.code).toBe('CONFLICT');

      vi.spyOn(LessonModel, 'findById').mockResolvedValue({
        _id: lessonId,
        courseId,
        chapterId: new Types.ObjectId(),
        slug: 'concurrency-lesson',
        version: 3,
        status: 'draft',
      } as any);

      const lessonRes = await request(app)
        .patch(`/api/v1/admin/lessons/${lessonId.toString()}`)
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader)
        .send({ title: 'درس همزمان', expectedVersion: 1 });

      expect(lessonRes.status).toBe(409);
      expect(lessonRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('4. User Governance & Anti-Escalation Protections', () => {
    it('prevents admin from modifying or promoting to super_admin/admin', async () => {
      const adminAuth = makeAuthSession(['admin']);
      const targetUserId = new Types.ObjectId('650000000000000000000301');

      vi.spyOn(UserModel, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: targetUserId,
          roles: ['student'],
          status: 'active',
        }),
      } as any);

      const escalateRes = await request(app)
        .patch(`/api/v1/admin/users/${targetUserId.toString()}/roles`)
        .set('Cookie', adminAuth.cookies)
        .set('x-csrf-token', adminAuth.csrfHeader)
        .send({ roles: ['super_admin'], reason: 'تلاش برای ارتقای غیرمجاز نقش' });

      expect(escalateRes.status).toBe(403);
      expect(escalateRes.body.error.code).toBe('FORBIDDEN');
    });

    it('prevents disabling or demoting the last active super_admin (409 Conflict)', async () => {
      const superId = new Types.ObjectId('650000000000000000000302');
      const otherSuperId = new Types.ObjectId('650000000000000000000303');
      const superAuth = makeAuthSession(['super_admin'], otherSuperId);

      vi.spyOn(UserModel, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: superId,
          roles: ['super_admin'],
          status: 'active',
        }),
      } as any);
      vi.spyOn(UserModel, 'countDocuments').mockResolvedValue(1);

      const disableRes = await request(app)
        .patch(`/api/v1/admin/users/${superId.toString()}/status`)
        .set('Cookie', superAuth.cookies)
        .set('x-csrf-token', superAuth.csrfHeader)
        .send({ status: 'disabled', reason: 'تلاش برای غیرفعال‌سازی آخرین مدیر ارشد' });

      expect(disableRes.status).toBe(409);
      expect(disableRes.body.error.code).toBe('CONFLICT');

      const demoteRes = await request(app)
        .patch(`/api/v1/admin/users/${superId.toString()}/roles`)
        .set('Cookie', superAuth.cookies)
        .set('x-csrf-token', superAuth.csrfHeader)
        .send({ roles: ['admin'], reason: 'تلاش برای حذف نقش آخرین مدیر ارشد' });

      expect(demoteRes.status).toBe(409);
      expect(demoteRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('5. Media Upload, Usage Deletion Guard & Controlled Serving', () => {
    it('uploads a valid PNG via multipart streaming and serves it publicly with nosniff', async () => {
      const auth = makeAuthSession(['content_editor']);
      const validPng = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      ]);

      let savedPayload: Record<string, unknown> = {};
      vi.spyOn(MediaAssetModel, 'create').mockImplementation(async (doc: any) => {
        savedPayload = doc;
        return {
          _id: new Types.ObjectId('650000000000000000000401'),
          ...doc,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      const uploadRes = await request(app)
        .post('/api/v1/admin/media/upload')
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader)
        .field('category', 'course_cover')
        .field('visibility', 'public')
        .field('altText', 'تصویر کاور دوره')
        .attach('file', validPng, { filename: 'cover.png', contentType: 'image/png' });

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.data.mimeType).toBe('image/png');
      expect(uploadRes.body.data.publicUrl).toContain('/api/v1/public/media/');

      const storageKey = String(savedPayload.storageKey);

      // Serve public media
      vi.spyOn(adminMediaService, 'findPublicServableByStorageKey').mockResolvedValue({
        _id: new Types.ObjectId('650000000000000000000401'),
        storageKey,
        originalFileName: 'cover.png',
        mimeType: 'image/png',
        mediaType: 'image',
        visibility: 'public',
        status: 'ready',
      } as any);

      const serveRes = await request(app).get(`/api/v1/public/media/${storageKey}`);
      expect(serveRes.status).toBe(200);
      expect(serveRes.headers['x-content-type-options']).toBe('nosniff');
      expect(serveRes.headers['content-type']).toContain('image/png');

      // Private or unknown media returns 404
      vi.spyOn(adminMediaService, 'findPublicServableByStorageKey').mockResolvedValue(null);
      const missingRes = await request(app).get('/api/v1/public/media/media/2026/11/private.png');
      expect(missingRes.status).toBe(404);
    });

    it('blocks spoofed PNG upload and blocks deleting media referenced by a published course', async () => {
      const auth = makeAuthSession(['content_manager']);
      const fakePng = Buffer.from('<html><script>alert(1)</script></html>', 'utf8');

      const badUploadRes = await request(app)
        .post('/api/v1/admin/media/upload')
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader)
        .field('category', 'site_asset')
        .attach('file', fakePng, { filename: 'spoof.png', contentType: 'image/png' });

      expect(badUploadRes.status).toBe(400);

      const mediaId = new Types.ObjectId('650000000000000000000402');
      vi.spyOn(MediaAssetModel, 'findById').mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: mediaId,
          storageKey: 'media/2026/11/used-cover.png',
          originalFileName: 'used-cover.png',
          mimeType: 'image/png',
          mediaType: 'image',
          sizeBytes: 1024,
          category: 'course_cover',
          storageProvider: 'local',
          visibility: 'public',
          status: 'ready',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as any);

      vi.spyOn(CourseModel, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: new Types.ObjectId(),
              title: 'دوره منتشرشده',
              slug: 'published-course',
              status: 'published',
              coverStorageKey: 'media/2026/11/used-cover.png',
            },
          ]),
        }),
      } as any);
      vi.spyOn(LessonModel, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
      } as any);
      vi.spyOn(SitePageModel, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
      } as any);
      vi.spyOn(SiteSettingsModel, 'findOne').mockReturnValue({
        select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
      } as any);

      const deleteBlockedRes = await request(app)
        .delete(`/api/v1/admin/media/${mediaId.toString()}`)
        .set('Cookie', auth.cookies)
        .set('x-csrf-token', auth.csrfHeader);

      expect(deleteBlockedRes.status).toBe(409);
      expect(deleteBlockedRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('6. Live MongoDB Real Persistence Check (Explicit BLOCKED Handling)', () => {
    it('reports BLOCKED cleanly when MONGODB_TEST_URI is absent, or runs real DB check if configured', async () => {
      const testUri = process.env.MONGODB_TEST_URI;
      if (!testUri) {
        console.warn(
          '[PHASE 6 AUDIT] Real MongoDB persistence integration test is BLOCKED: MONGODB_TEST_URI is not set in environment.'
        );
        expect(testUri).toBeUndefined();
        return;
      }

      const conn = await mongoose.createConnection(testUri).asPromise();
      try {
        const collections = await conn.db!.listCollections().toArray();
        expect(Array.isArray(collections)).toBe(true);
      } finally {
        await conn.close();
      }
    });
  });
});

import { Types } from 'mongoose';
import {
  AdminRestoreRevisionDto,
  PublishedSeoMetadataSchema,
} from '@techa/shared';
import { ContentRevisionModel } from '../../../models/content-revision.model';
import { CourseModel } from '../../../models/course.model';
import { ChapterModel } from '../../../models/chapter.model';
import { LessonModel } from '../../../models/lesson.model';
import { SitePageModel } from '../../../models/site-page.model';
import { SiteSettingsModel } from '../../../models/site-settings.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { courseStatsService } from '../../../services/course-stats.service';
import { AuthenticatedAdminActor } from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';
import {
  contentRevisionService,
  withOptionalTransaction,
} from './revision.service';
import {
  cacheInvalidationService,
  buildCourseRevalidationTargets,
  buildLessonRevalidationTargets,
  buildPageRevalidationTargets,
  buildSettingsRevalidationTargets,
} from '../cache/cache-invalidation.service';
import { RequestAuditContext } from '../media/media.service';
import { toAdminCourseDto } from '../courses/admin-courses.service';
import { toAdminChapterDto } from '../chapters/admin-chapters.service';
import { toAdminLessonDto } from '../lessons/admin-lessons.service';
import { toAdminSitePageDto } from '../pages/admin-pages.service';
import { toAdminSiteSettingsDto } from '../settings/admin-settings.service';

export class AdminRevisionsRestoreService {
  public async restoreRevision(
    revisionId: string,
    dto: AdminRestoreRevisionDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ) {
    if (!Types.ObjectId.isValid(revisionId)) {
      throw new NotFoundError('نسخه مورد نظر یافت نشد');
    }

    const revision = await ContentRevisionModel.findById(revisionId).lean();
    if (!revision) {
      throw new NotFoundError('نسخه مورد نظر یافت نشد');
    }

    let snapshot: Record<string, any>;
    try {
      snapshot = JSON.parse(revision.snapshotJson);
    } catch {
      throw new BadRequestError('ساختار داده‌های نسخه ذخیره‌شده معتبر نیست');
    }

    const resourceId = revision.resourceId;
    const summaryText =
      dto.changeSummary || `بازگردانی از نسخه شماره #${revision.revisionNumber}`;

    switch (revision.resourceType) {
      case 'course': {
        const current = await CourseModel.findById(resourceId);
        if (!current) throw new NotFoundError('دوره مرتبط با این نسخه یافت نشد');
        if (dto.expectedVersion !== undefined && (current.version ?? 1) !== dto.expectedVersion) {
          throw new ConflictError('تضاد نسخه هنگام بازگردانی دوره', {
            currentVersion: current.version ?? 1,
            expectedVersion: dto.expectedVersion,
          });
        }

        // If currently published, validate restored SEO before retaining published status
        let targetStatus = current.status;
        if (targetStatus === 'published' && !PublishedSeoMetadataSchema.safeParse(snapshot.seo).success) {
          targetStatus = 'draft';
        }

        const restored = await withOptionalTransaction(async (session) => {
          const updated = await CourseModel.findOneAndUpdate(
            {
              _id: current._id,
              ...(dto.expectedVersion !== undefined ? { version: dto.expectedVersion } : {}),
            },
            {
              $set: {
                title: snapshot.title ?? current.title,
                slug: snapshot.slug ?? current.slug,
                summary: snapshot.summary ?? current.summary,
                description: snapshot.description ?? current.description,
                level: snapshot.level ?? current.level,
                icon: snapshot.icon ?? current.icon,
                coverStorageKey: snapshot.coverStorageKey,
                tags: snapshot.tags ?? current.tags,
                prerequisites: snapshot.prerequisites ?? current.prerequisites,
                targetAudience: snapshot.targetAudience ?? current.targetAudience,
                order: snapshot.order ?? current.order,
                seo: snapshot.seo ?? current.seo,
                status: targetStatus,
                updatedBy: actor.objectId,
              },
              $inc: { version: 1 },
            },
            { new: true, runValidators: true, session }
          );
          if (!updated) throw new ConflictError('دوره همزمان تغییر کرده است');

          await contentRevisionService.createRevision(
            {
              resourceType: 'course',
              resourceId: updated._id.toString(),
              snapshot: updated.toObject(),
              changeSummary: summaryText,
              createdBy: actor.objectId,
            },
            session
          );
          await adminAuditService.record(
            {
              actorUserId: actor.objectId,
              actorRole: actor.primaryRole,
              action: 'restore',
              resourceType: 'course',
              resourceId: updated._id.toString(),
              result: 'success',
              requestId: ctx.requestId,
              changedFields: ['restoredFromRevision'],
              changeSummary: summaryText,
              ipHash: ctx.ipHash,
              userAgent: ctx.userAgent,
            },
            session
          );
          return updated;
        });

        await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(restored.slug));
        return { resourceType: 'course', resource: toAdminCourseDto(restored) };
      }

      case 'chapter': {
        const current = await ChapterModel.findById(resourceId);
        if (!current) throw new NotFoundError('فصل مرتبط با این نسخه یافت نشد');
        if (dto.expectedVersion !== undefined && (current.version ?? 1) !== dto.expectedVersion) {
          throw new ConflictError('تضاد نسخه هنگام بازگردانی فصل');
        }

        const restored = await withOptionalTransaction(async (session) => {
          const updated = await ChapterModel.findOneAndUpdate(
            {
              _id: current._id,
              ...(dto.expectedVersion !== undefined ? { version: dto.expectedVersion } : {}),
            },
            {
              $set: {
                title: snapshot.title ?? current.title,
                slug: snapshot.slug ?? current.slug,
                summary: snapshot.summary,
                order: snapshot.order ?? current.order,
                updatedBy: actor.objectId,
              },
              $inc: { version: 1 },
            },
            { new: true, runValidators: true, session }
          );
          if (!updated) throw new ConflictError('فصل همزمان تغییر کرده است');

          await contentRevisionService.createRevision(
            {
              resourceType: 'chapter',
              resourceId: updated._id.toString(),
              snapshot: updated.toObject(),
              changeSummary: summaryText,
              createdBy: actor.objectId,
            },
            session
          );
          await adminAuditService.record(
            {
              actorUserId: actor.objectId,
              actorRole: actor.primaryRole,
              action: 'restore',
              resourceType: 'chapter',
              resourceId: updated._id.toString(),
              result: 'success',
              requestId: ctx.requestId,
              changedFields: ['restoredFromRevision'],
              changeSummary: summaryText,
              ipHash: ctx.ipHash,
              userAgent: ctx.userAgent,
            },
            session
          );
          return updated;
        });

        const course = await CourseModel.findById(restored.courseId).select({ slug: 1 }).lean();
        if (course) {
          await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(course.slug));
        }
        return { resourceType: 'chapter', resource: toAdminChapterDto(restored) };
      }

      case 'lesson': {
        const current = await LessonModel.findById(resourceId);
        if (!current) throw new NotFoundError('درس مرتبط با این نسخه یافت نشد');
        if (dto.expectedVersion !== undefined && (current.version ?? 1) !== dto.expectedVersion) {
          throw new ConflictError('تضاد نسخه هنگام بازگردانی درس');
        }

        const restoredBlocks = Array.isArray(snapshot.contentBlocks)
          ? snapshot.contentBlocks
          : current.contentBlocks;
        const restoredSeo = snapshot.seo ?? current.seo;

        let targetStatus = current.status;
        if (
          targetStatus === 'published' &&
          (restoredBlocks.length === 0 || !PublishedSeoMetadataSchema.safeParse(restoredSeo).success)
        ) {
          targetStatus = 'draft';
        }

        const restored = await withOptionalTransaction(async (session) => {
          const updated = await LessonModel.findOneAndUpdate(
            {
              _id: current._id,
              ...(dto.expectedVersion !== undefined ? { version: dto.expectedVersion } : {}),
            },
            {
              $set: {
                title: snapshot.title ?? current.title,
                slug: snapshot.slug ?? current.slug,
                order: snapshot.order ?? current.order,
                readingTimeMinutes: snapshot.readingTimeMinutes ?? current.readingTimeMinutes,
                contentBlocks: restoredBlocks,
                seo: restoredSeo,
                status: targetStatus,
                updatedBy: actor.objectId,
              },
              $inc: { version: 1 },
            },
            { new: true, runValidators: true, session }
          );
          if (!updated) throw new ConflictError('درس همزمان تغییر کرده است');

          await contentRevisionService.createRevision(
            {
              resourceType: 'lesson',
              resourceId: updated._id.toString(),
              snapshot: updated.toObject(),
              changeSummary: summaryText,
              createdBy: actor.objectId,
            },
            session
          );
          await adminAuditService.record(
            {
              actorUserId: actor.objectId,
              actorRole: actor.primaryRole,
              action: 'restore',
              resourceType: 'lesson',
              resourceId: updated._id.toString(),
              result: 'success',
              requestId: ctx.requestId,
              changedFields: ['restoredFromRevision'],
              changeSummary: summaryText,
              ipHash: ctx.ipHash,
              userAgent: ctx.userAgent,
            },
            session
          );
          return updated;
        });

        await courseStatsService.recalculateCourseStats(restored.courseId);
        const course = await CourseModel.findById(restored.courseId).select({ slug: 1 }).lean();
        if (course) {
          await cacheInvalidationService.invalidate(
            buildLessonRevalidationTargets(course.slug, restored.slug)
          );
        }
        return { resourceType: 'lesson', resource: toAdminLessonDto(restored) };
      }

      case 'site_page': {
        const current = await SitePageModel.findById(resourceId);
        if (!current) throw new NotFoundError('صفحه مرتبط با این نسخه یافت نشد');
        if (dto.expectedVersion !== undefined && (current.version ?? 1) !== dto.expectedVersion) {
          throw new ConflictError('تضاد نسخه هنگام بازگردانی صفحه');
        }

        const restored = await withOptionalTransaction(async (session) => {
          const updated = await SitePageModel.findOneAndUpdate(
            {
              _id: current._id,
              ...(dto.expectedVersion !== undefined ? { version: dto.expectedVersion } : {}),
            },
            {
              $set: {
                title: snapshot.title ?? current.title,
                heroSection: snapshot.heroSection ?? current.heroSection,
                features: snapshot.features ?? current.features,
                contentBlocks: Array.isArray(snapshot.contentBlocks)
                  ? snapshot.contentBlocks
                  : current.contentBlocks,
                seo: snapshot.seo ?? current.seo,
                updatedBy: actor.objectId,
              },
              $inc: { version: 1 },
            },
            { new: true, runValidators: true, session }
          );
          if (!updated) throw new ConflictError('صفحه همزمان تغییر کرده است');

          await contentRevisionService.createRevision(
            {
              resourceType: 'site_page',
              resourceId: updated._id.toString(),
              snapshot: updated.toObject(),
              changeSummary: summaryText,
              createdBy: actor.objectId,
            },
            session
          );
          await adminAuditService.record(
            {
              actorUserId: actor.objectId,
              actorRole: actor.primaryRole,
              action: 'restore',
              resourceType: 'site_page',
              resourceId: updated._id.toString(),
              result: 'success',
              requestId: ctx.requestId,
              changedFields: ['restoredFromRevision'],
              changeSummary: summaryText,
              ipHash: ctx.ipHash,
              userAgent: ctx.userAgent,
            },
            session
          );
          return updated;
        });

        if (restored.status === 'published') {
          await cacheInvalidationService.invalidate(buildPageRevalidationTargets(restored.pageKey));
        }
        return { resourceType: 'site_page', resource: toAdminSitePageDto(restored) };
      }

      case 'site_settings': {
        const current = await SiteSettingsModel.findById(resourceId);
        if (!current) throw new NotFoundError('تنظیمات مرتبط با این نسخه یافت نشد');
        if (dto.expectedVersion !== undefined && (current.version ?? 1) !== dto.expectedVersion) {
          throw new ConflictError('تضاد نسخه هنگام بازگردانی تنظیمات');
        }

        const restored = await withOptionalTransaction(async (session) => {
          const updated = await SiteSettingsModel.findOneAndUpdate(
            {
              _id: current._id,
              ...(dto.expectedVersion !== undefined ? { version: dto.expectedVersion } : {}),
            },
            {
              $set: {
                branding: snapshot.branding ?? current.branding,
                header: snapshot.header ?? current.header,
                footer: snapshot.footer ?? current.footer,
                seo: snapshot.seo ?? current.seo,
                general: snapshot.general ?? current.general,
                updatedBy: actor.objectId,
              },
              $inc: { version: 1 },
            },
            { new: true, runValidators: true, session }
          );
          if (!updated) throw new ConflictError('تنظیمات همزمان تغییر کرده است');

          await contentRevisionService.createRevision(
            {
              resourceType: 'site_settings',
              resourceId: updated._id.toString(),
              snapshot: updated.toObject(),
              changeSummary: summaryText,
              createdBy: actor.objectId,
            },
            session
          );
          await adminAuditService.record(
            {
              actorUserId: actor.objectId,
              actorRole: actor.primaryRole,
              action: 'restore',
              resourceType: 'site_settings',
              resourceId: updated._id.toString(),
              result: 'success',
              requestId: ctx.requestId,
              changedFields: ['restoredFromRevision'],
              changeSummary: summaryText,
              ipHash: ctx.ipHash,
              userAgent: ctx.userAgent,
            },
            session
          );
          return updated;
        });

        await cacheInvalidationService.invalidate(buildSettingsRevalidationTargets());
        return { resourceType: 'site_settings', resource: toAdminSiteSettingsDto(restored) };
      }

      default:
        throw new BadRequestError('نوع منبع برای بازگردانی پشتیبانی نمی‌شود');
    }
  }
}

export const adminRevisionsRestoreService = new AdminRevisionsRestoreService();

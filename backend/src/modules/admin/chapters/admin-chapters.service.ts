import { Types } from 'mongoose';
import {
  AdminCreateChapterDto,
  AdminUpdateChapterDto,
  AdminReorderChaptersDto,
  AdminChapterDto,
  PublicationStatus,
} from '@techa/shared';
import { CourseModel } from '../../../models/course.model';
import { ChapterModel, ChapterRaw } from '../../../models/chapter.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { courseStatsService } from '../../../services/course-stats.service';
import {
  AuthenticatedAdminActor,
  assertOwnershipIfEditorOnly,
} from '../authz/permissions.middleware';
import { adminAuditService } from '../audit/audit.service';
import {
  contentRevisionService,
  withOptionalTransaction,
} from '../revisions/revision.service';
import {
  cacheInvalidationService,
  buildCourseRevalidationTargets,
} from '../cache/cache-invalidation.service';
import { RequestAuditContext } from '../media/media.service';

export function toAdminChapterDto(doc: ChapterRaw | any): AdminChapterDto {
  return {
    id: doc._id.toString(),
    courseId: doc.courseId.toString(),
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary,
    order: doc.order ?? 0,
    status: doc.status,
    version: doc.version ?? 1,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    archivedAt: doc.archivedAt ? new Date(doc.archivedAt).toISOString() : null,
    createdBy: doc.createdBy ? doc.createdBy.toString() : null,
    updatedBy: doc.updatedBy ? doc.updatedBy.toString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class AdminChaptersService {
  public async listChaptersByCourse(
    courseId: string,
    statusFilter?: PublicationStatus
  ): Promise<AdminChapterDto[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    const courseExists = await CourseModel.exists({ _id: courseId });
    if (!courseExists) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    const filter: Record<string, unknown> = { courseId: new Types.ObjectId(courseId) };
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const docs = await ChapterModel.find(filter).sort({ order: 1, _id: 1 }).lean<ChapterRaw[]>();
    return (docs || []).map(toAdminChapterDto);
  }

  public async getChapterById(chapterId: string): Promise<AdminChapterDto> {
    if (!Types.ObjectId.isValid(chapterId)) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }
    const doc = await ChapterModel.findById(chapterId).lean<ChapterRaw>();
    if (!doc) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }
    return toAdminChapterDto(doc);
  }

  public async createChapter(
    courseId: string,
    dto: AdminCreateChapterDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminChapterDto> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new NotFoundError('دوره والد یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, course.createdBy, 'دوره');

    const duplicateSlug = await ChapterModel.findOne({
      courseId: course._id,
      slug: dto.slug,
    })
      .select({ _id: 1 })
      .lean();
    if (duplicateSlug) {
      throw new ConflictError(`فصلی با شناسه یکتای "${dto.slug}" در این دوره وجود دارد`);
    }

    const created = await withOptionalTransaction(async (session) => {
      const payload = {
        courseId: course._id,
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary,
        order: dto.order ?? 0,
        status: 'draft' as const,
        version: 1,
        createdBy: actor.objectId,
        updatedBy: actor.objectId,
      };

      const [doc] = session
        ? await ChapterModel.create([payload], { session })
        : [await ChapterModel.create(payload)];

      await contentRevisionService.createRevision(
        {
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'ایجاد فصل جدید',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'create',
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['courseId', 'title', 'slug', 'order'],
          changeSummary: dto.changeSummary || `ایجاد فصل "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    return toAdminChapterDto(created);
  }

  public async updateChapter(
    chapterId: string,
    dto: AdminUpdateChapterDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminChapterDto> {
    const existing = await ChapterModel.findById(chapterId);
    if (!existing) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, existing.createdBy, 'فصل');

    if ((existing.version ?? 1) !== dto.expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام ویرایش فصل', {
        currentVersion: existing.version ?? 1,
        expectedVersion: dto.expectedVersion,
      });
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await ChapterModel.findOne({
        courseId: existing.courseId,
        slug: dto.slug,
        _id: { $ne: existing._id },
      })
        .select({ _id: 1 })
        .lean();
      if (slugTaken) {
        throw new ConflictError(`فصلی با شناسه یکتای "${dto.slug}" در این دوره وجود دارد`);
      }
    }

    const updateSet: Record<string, unknown> = { updatedBy: actor.objectId };
    const changedFields: string[] = [];
    for (const field of ['title', 'slug', 'summary', 'order'] as const) {
      if (dto[field] !== undefined) {
        updateSet[field] = dto[field];
        changedFields.push(field);
      }
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await ChapterModel.findOneAndUpdate(
        {
          _id: existing._id,
          $or: [{ version: dto.expectedVersion }, { version: { $exists: false } }],
        },
        {
          $set: updateSet,
          $inc: { version: 1 },
        },
        { returnDocument: 'after', runValidators: true, session }
      );
      if (!doc) {
        throw new ConflictError('فصل همزمان توسط کاربر دیگری تغییر کرده است');
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'ویرایش فصل',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'update',
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields,
          changeSummary: dto.changeSummary || `بروزرسانی فصل "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    if (updated.status === 'published') {
      const parentCourse = await CourseModel.findById(updated.courseId).select({ slug: 1 }).lean();
      if (parentCourse) {
        await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(parentCourse.slug));
      }
    }

    return toAdminChapterDto(updated);
  }

  public async publishChapter(
    chapterId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminChapterDto> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (chapter.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام انتشار فصل');
    }

    const parentCourse = await CourseModel.findById(chapter.courseId);
    if (!parentCourse) {
      throw new NotFoundError('دوره والد یافت نشد');
    }
    if (parentCourse.status !== 'published') {
      throw new BadRequestError(
        `فصل قابل انتشار نیست زیرا دوره والد ("${parentCourse.title}") در وضعیت ${parentCourse.status} است`
      );
    }

    const now = new Date();
    const updated = await withOptionalTransaction(async (session) => {
      const doc = await ChapterModel.findOneAndUpdate(
        {
          _id: chapter._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: {
            status: 'published',
            publishedAt: chapter.publishedAt || now,
            archivedAt: null,
            updatedBy: actor.objectId,
          },
          $inc: { version: 1 },
        },
        { returnDocument: 'after', session }
      );
      if (!doc) throw new ConflictError('فصل همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'انتشار فصل',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'publish',
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'publishedAt'],
          changeSummary: changeSummary || `انتشار فصل "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await courseStatsService.recalculateCourseStats(parentCourse._id);
    await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(parentCourse.slug));

    return toAdminChapterDto(updated);
  }

  public async unpublishChapter(
    chapterId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminChapterDto> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (chapter.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام خروج فصل از انتشار');
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await ChapterModel.findOneAndUpdate(
        {
          _id: chapter._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'draft', updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { returnDocument: 'after', session }
      );
      if (!doc) throw new ConflictError('فصل همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'تبدیل فصل به پیش‌نویس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'unpublish',
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status'],
          changeSummary: changeSummary || `خروج فصل "${doc.title}" از انتشار`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await courseStatsService.recalculateCourseStats(chapter.courseId);
    const parentCourse = await CourseModel.findById(chapter.courseId).select({ slug: 1 }).lean();
    if (parentCourse) {
      await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(parentCourse.slug));
    }
    return toAdminChapterDto(updated);
  }

  public async archiveChapter(
    chapterId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminChapterDto> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (chapter.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام بایگانی فصل');
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await ChapterModel.findOneAndUpdate(
        {
          _id: chapter._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'archived', archivedAt: new Date(), updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { returnDocument: 'after', session }
      );
      if (!doc) throw new ConflictError('فصل همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'بایگانی فصل',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'archive',
          resourceType: 'chapter',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'archivedAt'],
          changeSummary: changeSummary || `بایگانی فصل "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await courseStatsService.recalculateCourseStats(chapter.courseId);
    const parentCourse = await CourseModel.findById(chapter.courseId).select({ slug: 1 }).lean();
    if (parentCourse) {
      await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(parentCourse.slug));
    }
    return toAdminChapterDto(updated);
  }

  public async reorderChapters(
    courseId: string,
    dto: AdminReorderChaptersDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminChapterDto[]> {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    const existingChapters = await ChapterModel.find({ courseId: course._id }).lean<ChapterRaw[]>();
    const existingIds = new Set(existingChapters.map((c) => c._id.toString()));

    const uniqueOrderedIds = Array.from(new Set(dto.orderedChapterIds));
    if (uniqueOrderedIds.length !== dto.orderedChapterIds.length) {
      throw new BadRequestError('فهرست شناسه‌های فصل دارای مقدار تکراری است');
    }

    for (const id of uniqueOrderedIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestError(`فصل با شناسه "${id}" متعلق به این دوره نیست`);
      }
    }

    await withOptionalTransaction(async (session) => {
      for (let idx = 0; idx < uniqueOrderedIds.length; idx++) {
        await ChapterModel.updateOne(
          { _id: new Types.ObjectId(uniqueOrderedIds[idx]), courseId: course._id },
          {
            $set: { order: idx + 1, updatedBy: actor.objectId },
            $inc: { version: 1 },
          },
          { session }
        );
      }

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'update',
          resourceType: 'course_chapters_order',
          resourceId: course._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['chapters.order'],
          changeSummary: dto.changeSummary || `تغییر ترتیب ${uniqueOrderedIds.length} فصل دوره`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
    });

    if (course.status === 'published') {
      await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(course.slug));
    }

    return this.listChaptersByCourse(courseId);
  }
}

export const adminChaptersService = new AdminChaptersService();

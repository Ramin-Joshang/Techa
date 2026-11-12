import { Types } from 'mongoose';
import {
  AdminCreateLessonDto,
  AdminUpdateLessonDto,
  AdminReorderLessonsDto,
  AdminLessonDto,
  ContentBlock,
  PublicationStatus,
  PublishedSeoMetadataSchema,
} from '@techa/shared';
import { CourseModel } from '../../../models/course.model';
import { ChapterModel } from '../../../models/chapter.model';
import { LessonModel, LessonRaw } from '../../../models/lesson.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { courseStatsService } from '../../../services/course-stats.service';
import { normalizeContentBlocks } from '../../../core/utils/dto-normalizer';
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
  buildLessonRevalidationTargets,
  buildCourseRevalidationTargets,
} from '../cache/cache-invalidation.service';
import { adminMediaService, RequestAuditContext } from '../media/media.service';

export function extractMediaKeysFromContentBlocks(blocks: ContentBlock[] = []): string[] {
  const keys: string[] = [];
  for (const blk of blocks) {
    if (blk.type === 'image' && blk.data?.storageKey) {
      keys.push(blk.data.storageKey);
    } else if (blk.type === 'video') {
      if (blk.data?.storageKey) keys.push(blk.data.storageKey);
      if (blk.data?.posterStorageKey) keys.push(blk.data.posterStorageKey);
    } else if (blk.type === 'downloadableFile' && blk.data?.storageKey) {
      keys.push(blk.data.storageKey);
    }
  }
  return keys;
}

export function toAdminLessonDto(doc: LessonRaw | any): AdminLessonDto {
  return {
    id: doc._id.toString(),
    courseId: doc.courseId.toString(),
    chapterId: doc.chapterId.toString(),
    title: doc.title,
    slug: doc.slug,
    order: doc.order ?? 0,
    readingTimeMinutes: doc.readingTimeMinutes ?? 1,
    contentSchemaVersion: doc.contentSchemaVersion ?? 1,
    contentBlocks: normalizeContentBlocks(doc.contentBlocks || []),
    status: doc.status,
    version: doc.version ?? 1,
    seo: doc.seo,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    lastPublishedAt: doc.lastPublishedAt ? new Date(doc.lastPublishedAt).toISOString() : null,
    archivedAt: doc.archivedAt ? new Date(doc.archivedAt).toISOString() : null,
    createdBy: doc.createdBy ? doc.createdBy.toString() : null,
    updatedBy: doc.updatedBy ? doc.updatedBy.toString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export class AdminLessonsService {
  public async listLessonsByChapter(
    chapterId: string,
    statusFilter?: PublicationStatus
  ): Promise<AdminLessonDto[]> {
    if (!Types.ObjectId.isValid(chapterId)) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }
    const chapterExists = await ChapterModel.exists({ _id: chapterId });
    if (!chapterExists) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }

    const filter: Record<string, unknown> = { chapterId: new Types.ObjectId(chapterId) };
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const docs = await LessonModel.find(filter).sort({ order: 1, _id: 1 }).lean<LessonRaw[]>();
    return (docs || []).map(toAdminLessonDto);
  }

  public async getLessonById(lessonId: string): Promise<AdminLessonDto> {
    if (!Types.ObjectId.isValid(lessonId)) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }
    const doc = await LessonModel.findById(lessonId).lean<LessonRaw>();
    if (!doc) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }
    return toAdminLessonDto(doc);
  }

  public async createLesson(
    chapterId: string,
    dto: AdminCreateLessonDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminLessonDto> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError('فصل والد یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, chapter.createdBy, 'فصل');

    const duplicateSlug = await LessonModel.findOne({
      courseId: chapter.courseId,
      slug: dto.slug,
    })
      .select({ _id: 1 })
      .lean();
    if (duplicateSlug) {
      throw new ConflictError(`درسی با شناسه یکتای "${dto.slug}" در این دوره وجود دارد`);
    }

    const mediaKeys = [
      ...extractMediaKeysFromContentBlocks((dto.contentBlocks || []) as ContentBlock[]),
      dto.seo.ogImageStorageKey,
    ];
    await adminMediaService.assertMediaKeysExist(mediaKeys);

    const created = await withOptionalTransaction(async (session) => {
      const payload = {
        courseId: chapter.courseId,
        chapterId: chapter._id,
        title: dto.title,
        slug: dto.slug,
        order: dto.order ?? 0,
        readingTimeMinutes: dto.readingTimeMinutes ?? 1,
        contentSchemaVersion: 1 as const,
        contentBlocks: dto.contentBlocks || [],
        status: 'draft' as const,
        version: 1,
        seo: dto.seo,
        createdBy: actor.objectId,
        updatedBy: actor.objectId,
      };

      const [doc] = session
        ? await LessonModel.create([payload], { session })
        : [await LessonModel.create(payload)];

      await contentRevisionService.createRevision(
        {
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'ایجاد پیش‌نویس درس جدید',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'create',
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['title', 'slug', 'chapterId', 'contentBlocks'],
          changeSummary: dto.changeSummary || `ایجاد درس "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    return toAdminLessonDto(created);
  }

  public async updateLesson(
    lessonId: string,
    dto: AdminUpdateLessonDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminLessonDto> {
    const existing = await LessonModel.findById(lessonId);
    if (!existing) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, existing.createdBy, 'درس');

    if ((existing.version ?? 1) !== dto.expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام ویرایش درس', {
        currentVersion: existing.version ?? 1,
        expectedVersion: dto.expectedVersion,
      });
    }

    let targetChapterId = existing.chapterId;
    if (dto.chapterId && dto.chapterId !== existing.chapterId.toString()) {
      const targetChapter = await ChapterModel.findById(dto.chapterId);
      if (!targetChapter) {
        throw new NotFoundError('فصل مقصد یافت نشد');
      }
      if (targetChapter.courseId.toString() !== existing.courseId.toString()) {
        throw new BadRequestError('انتقال درس فقط به فصل‌های متعلق به همان دوره مجاز است');
      }
      targetChapterId = targetChapter._id;
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await LessonModel.findOne({
        courseId: existing.courseId,
        slug: dto.slug,
        _id: { $ne: existing._id },
      })
        .select({ _id: 1 })
        .lean();
      if (slugTaken) {
        throw new ConflictError(`درسی با شناسه یکتای "${dto.slug}" در این دوره وجود دارد`);
      }
    }

    if (existing.status === 'published') {
      if (dto.contentBlocks !== undefined && dto.contentBlocks.length === 0) {
        throw new BadRequestError('درس منتشرشده باید حداقل یک بلوک محتوا داشته باشد');
      }
      if (dto.seo) {
        const seoCheck = PublishedSeoMetadataSchema.safeParse(dto.seo);
        if (!seoCheck.success) {
          throw new BadRequestError(
            `تنظیمات SEO برای درس منتشرشده معتبر نیست: ${seoCheck.error.issues.map((i) => i.message).join(', ')}`
          );
        }
      }
    }

    const mediaKeys = [
      ...(dto.contentBlocks
        ? extractMediaKeysFromContentBlocks(dto.contentBlocks as ContentBlock[])
        : []),
      dto.seo?.ogImageStorageKey,
    ];
    await adminMediaService.assertMediaKeysExist(mediaKeys);

    const updateSet: Record<string, unknown> = {
      updatedBy: actor.objectId,
      chapterId: targetChapterId,
    };
    const changedFields: string[] = [];

    for (const field of [
      'title',
      'slug',
      'order',
      'readingTimeMinutes',
      'contentBlocks',
      'seo',
    ] as const) {
      if (dto[field] !== undefined) {
        updateSet[field] = dto[field];
        changedFields.push(field);
      }
    }
    if (dto.chapterId && dto.chapterId !== existing.chapterId.toString()) {
      changedFields.push('chapterId');
    }

    const oldSlug = existing.slug;

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await LessonModel.findOneAndUpdate(
        {
          _id: existing._id,
          $or: [{ version: dto.expectedVersion }, { version: { $exists: false } }],
        },
        {
          $set: updateSet,
          $inc: { version: 1 },
        },
        { new: true, runValidators: true, session }
      );
      if (!doc) {
        throw new ConflictError('درس همزمان توسط کاربر دیگری ویرایش شده است');
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'بروزرسانی محتوای درس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'update',
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields,
          changeSummary: dto.changeSummary || `ویرایش درس "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    if (updated.status === 'published') {
      await courseStatsService.recalculateCourseStats(updated.courseId);
      const parentCourse = await CourseModel.findById(updated.courseId).select({ slug: 1 }).lean();
      if (parentCourse) {
        await cacheInvalidationService.invalidate(
          buildLessonRevalidationTargets(parentCourse.slug, updated.slug)
        );
        if (oldSlug !== updated.slug) {
          await cacheInvalidationService.invalidate(
            buildLessonRevalidationTargets(parentCourse.slug, oldSlug)
          );
        }
      }
    }

    return toAdminLessonDto(updated);
  }

  public async publishLesson(
    lessonId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminLessonDto> {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (lesson.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام انتشار درس');
    }

    if (!lesson.contentBlocks || lesson.contentBlocks.length === 0) {
      throw new BadRequestError('درس بدون حداقل یک بلوک محتوا قابل انتشار نیست');
    }

    const chapter = await ChapterModel.findById(lesson.chapterId);
    if (!chapter) {
      throw new NotFoundError('فصل والد یافت نشد');
    }
    if (chapter.status !== 'published') {
      throw new BadRequestError(
        `درس قابل انتشار نیست زیرا فصل والد ("${chapter.title}") منتشر نشده است`
      );
    }
    if (chapter.courseId.toString() !== lesson.courseId.toString()) {
      throw new BadRequestError('ناسازگاری دوره درس با فصل والد');
    }

    const course = await CourseModel.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundError('دوره والد یافت نشد');
    }
    if (course.status !== 'published') {
      throw new BadRequestError(
        `درس قابل انتشار نیست زیرا دوره والد ("${course.title}") منتشر نشده است`
      );
    }

    const seoValidation = PublishedSeoMetadataSchema.safeParse(lesson.seo);
    if (!seoValidation.success) {
      throw new BadRequestError(
        `متادیتای SEO درس برای انتشار کامل نیست: ${seoValidation.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    const mediaKeys = [
      ...extractMediaKeysFromContentBlocks(lesson.contentBlocks),
      lesson.seo?.ogImageStorageKey,
    ];
    await adminMediaService.assertMediaKeysExist(mediaKeys);

    const now = new Date();
    const updated = await withOptionalTransaction(async (session) => {
      const doc = await LessonModel.findOneAndUpdate(
        {
          _id: lesson._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: {
            status: 'published',
            lastPublishedAt: now,
            publishedAt: lesson.publishedAt || now,
            archivedAt: null,
            updatedBy: actor.objectId,
          },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) throw new ConflictError('درس همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'انتشار عمومی درس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'publish',
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'publishedAt', 'lastPublishedAt'],
          changeSummary: changeSummary || `انتشار درس "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    await courseStatsService.recalculateCourseStats(course._id);
    await cacheInvalidationService.invalidate(
      buildLessonRevalidationTargets(course.slug, updated.slug)
    );
    return toAdminLessonDto(updated);
  }

  public async unpublishLesson(
    lessonId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminLessonDto> {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (lesson.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام خروج درس از انتشار');
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await LessonModel.findOneAndUpdate(
        {
          _id: lesson._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'draft', updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) throw new ConflictError('درس همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'تبدیل درس به پیش‌نویس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'unpublish',
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status'],
          changeSummary: changeSummary || `خروج درس "${doc.title}" از انتشار`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await courseStatsService.recalculateCourseStats(lesson.courseId);
    const course = await CourseModel.findById(lesson.courseId).select({ slug: 1 }).lean();
    if (course) {
      await cacheInvalidationService.invalidate(
        buildLessonRevalidationTargets(course.slug, updated.slug)
      );
    }

    return toAdminLessonDto(updated);
  }

  public async archiveLesson(
    lessonId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminLessonDto> {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (lesson.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام بایگانی درس');
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await LessonModel.findOneAndUpdate(
        {
          _id: lesson._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'archived', archivedAt: new Date(), updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) throw new ConflictError('درس همزمان تغییر کرده است');

      await contentRevisionService.createRevision(
        {
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'بایگانی درس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'archive',
          resourceType: 'lesson',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'archivedAt'],
          changeSummary: changeSummary || `بایگانی درس "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await courseStatsService.recalculateCourseStats(lesson.courseId);
    const course = await CourseModel.findById(lesson.courseId).select({ slug: 1 }).lean();
    if (course) {
      await cacheInvalidationService.invalidate(
        buildLessonRevalidationTargets(course.slug, updated.slug)
      );
    }

    return toAdminLessonDto(updated);
  }

  public async reorderLessons(
    chapterId: string,
    dto: AdminReorderLessonsDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminLessonDto[]> {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) {
      throw new NotFoundError('فصل مورد نظر یافت نشد');
    }

    const existingLessons = await LessonModel.find({ chapterId: chapter._id }).lean<LessonRaw[]>();
    const existingIds = new Set(existingLessons.map((l) => l._id.toString()));

    const uniqueIds = Array.from(new Set(dto.orderedLessonIds));
    if (uniqueIds.length !== dto.orderedLessonIds.length) {
      throw new BadRequestError('فهرست شناسه‌های درس دارای مقدار تکراری است');
    }

    for (const id of uniqueIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestError(`درس با شناسه "${id}" متعلق به این فصل نیست`);
      }
    }

    await withOptionalTransaction(async (session) => {
      for (let idx = 0; idx < uniqueIds.length; idx++) {
        await LessonModel.updateOne(
          { _id: new Types.ObjectId(uniqueIds[idx]), chapterId: chapter._id },
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
          resourceType: 'chapter_lessons_order',
          resourceId: chapter._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['lessons.order'],
          changeSummary: dto.changeSummary || `تغییر ترتیب ${uniqueIds.length} درس فصل`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
    });

    const parentCourse = await CourseModel.findById(chapter.courseId).select({ slug: 1, status: 1 }).lean();
    if (parentCourse?.status === 'published') {
      await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(parentCourse.slug));
    }

    return this.listLessonsByChapter(chapterId);
  }
}

export const adminLessonsService = new AdminLessonsService();

import { Types } from 'mongoose';
import {
  AdminCourseListQuery,
  AdminCreateCourseDto,
  AdminUpdateCourseDto,
  AdminCourseDto,
  PublishedSeoMetadataSchema,
} from '@techa/shared';
import { CourseModel, CourseRaw } from '../../../models/course.model';
import { ChapterModel } from '../../../models/chapter.model';
import { LessonModel } from '../../../models/lesson.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error';
import { escapeRegex } from '../../../core/utils/regex';
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
import { adminMediaService, RequestAuditContext } from '../media/media.service';

export function toAdminCourseDto(doc: CourseRaw | any): AdminCourseDto {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    description: doc.description,
    level: doc.level,
    icon: doc.icon,
    coverStorageKey: doc.coverStorageKey,
    tags: doc.tags || [],
    prerequisites: doc.prerequisites || [],
    targetAudience: doc.targetAudience || [],
    order: doc.order ?? 0,
    status: doc.status,
    version: doc.version ?? 1,
    stats: doc.stats || {
      totalChapters: 0,
      totalLessons: 0,
      estimatedReadingTimeMinutes: 0,
    },
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

export class AdminCoursesService {
  public async listCourses(query: AdminCourseListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.level) filter.level = query.level;
    if (query.q) {
      const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
      filter.$or = [
        { title: { $regex: regex } },
        { slug: { $regex: regex } },
        { summary: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortDir = query.order === 'desc' ? -1 : 1;
    const sortField = query.sort || 'order';

    const [total, docs] = await Promise.all([
      CourseModel.countDocuments(filter),
      CourseModel.find(filter)
        .sort({ [sortField]: sortDir, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean<CourseRaw[]>(),
    ]);

    return {
      items: (docs || []).map(toAdminCourseDto),
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    };
  }

  public async getCourseById(courseId: string): Promise<AdminCourseDto> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    const doc = await CourseModel.findById(courseId).lean<CourseRaw>();
    if (!doc) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    return toAdminCourseDto(doc);
  }

  public async createCourse(
    dto: AdminCreateCourseDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminCourseDto> {
    const existingSlug = await CourseModel.findOne({ slug: dto.slug }).select({ _id: 1 }).lean();
    if (existingSlug) {
      throw new ConflictError(`دوره‌ای با شناسه یکتای "${dto.slug}" از قبل وجود دارد`);
    }

    await adminMediaService.assertMediaKeysExist([
      dto.coverStorageKey,
      dto.icon.kind === 'media' ? dto.icon.storageKey : undefined,
      dto.seo.ogImageStorageKey,
    ]);

    const created = await withOptionalTransaction(async (session) => {
      const docPayload = {
        slug: dto.slug,
        title: dto.title,
        summary: dto.summary,
        description: dto.description,
        level: dto.level,
        icon: dto.icon,
        coverStorageKey: dto.coverStorageKey,
        tags: dto.tags || [],
        prerequisites: dto.prerequisites || [],
        targetAudience: dto.targetAudience || [],
        order: dto.order ?? 0,
        status: 'draft' as const,
        version: 1,
        stats: {
          totalChapters: 0,
          totalLessons: 0,
          estimatedReadingTimeMinutes: 0,
        },
        seo: dto.seo,
        createdBy: actor.objectId,
        updatedBy: actor.objectId,
      };

      const [doc] = session
        ? await CourseModel.create([docPayload], { session })
        : [await CourseModel.create(docPayload)];

      await contentRevisionService.createRevision(
        {
          resourceType: 'course',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'ایجاد پیش‌نویس دوره جدید',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'create',
          resourceType: 'course',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['slug', 'title', 'level', 'status'],
          changeSummary: dto.changeSummary || `ایجاد دوره "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    return toAdminCourseDto(created);
  }

  public async updateCourse(
    courseId: string,
    dto: AdminUpdateCourseDto,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext
  ): Promise<AdminCourseDto> {
    const existing = await CourseModel.findById(courseId);
    if (!existing) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, existing.createdBy, 'دوره');

    if ((existing.version ?? 1) !== dto.expectedVersion) {
      throw new ConflictError(
        `تضاد نسخه (Optimistic Concurrency): نسخه فعلی دوره ${existing.version ?? 1} است اما نسخه ${dto.expectedVersion} ارسال شده است`,
        { currentVersion: existing.version ?? 1, expectedVersion: dto.expectedVersion }
      );
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await CourseModel.findOne({
        slug: dto.slug,
        _id: { $ne: existing._id },
      })
        .select({ _id: 1 })
        .lean();
      if (slugTaken) {
        throw new ConflictError(`دوره‌ای با شناسه یکتای "${dto.slug}" از قبل وجود دارد`);
      }
    }

    await adminMediaService.assertMediaKeysExist([
      dto.coverStorageKey,
      dto.icon?.kind === 'media' ? dto.icon.storageKey : undefined,
      dto.seo?.ogImageStorageKey,
    ]);

    const updateSet: Record<string, unknown> = {
      updatedBy: actor.objectId,
    };
    const changedFields: string[] = [];

    const mutableFields = [
      'slug',
      'title',
      'summary',
      'description',
      'level',
      'icon',
      'coverStorageKey',
      'tags',
      'prerequisites',
      'targetAudience',
      'order',
      'seo',
    ] as const;

    for (const field of mutableFields) {
      if (dto[field] !== undefined) {
        updateSet[field] = dto[field];
        changedFields.push(field);
      }
    }

    if (existing.status === 'published' && dto.seo) {
      const seoCheck = PublishedSeoMetadataSchema.safeParse(dto.seo);
      if (!seoCheck.success) {
        throw new BadRequestError(
          `تنظیمات SEO برای دوره منتشرشده معتبر نیست: ${seoCheck.error.issues.map((i) => i.message).join(', ')}`
        );
      }
    }

    const oldSlug = existing.slug;

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await CourseModel.findOneAndUpdate(
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
        throw new ConflictError('دوره همزمان توسط کاربر دیگری ویرایش شده است');
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'course',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: dto.changeSummary || 'بروزرسانی اطلاعات دوره',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'update',
          resourceType: 'course',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields,
          changeSummary: dto.changeSummary || `ویرایش دوره "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    if (updated.status === 'published') {
      await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(updated.slug));
      if (oldSlug !== updated.slug) {
        await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(oldSlug));
      }
    }

    return toAdminCourseDto(updated);
  }

  public async publishCourse(
    courseId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminCourseDto> {
    const existing = await CourseModel.findById(courseId);
    if (!existing) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (existing.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام انتشار دوره', {
        currentVersion: existing.version ?? 1,
        expectedVersion,
      });
    }

    const seoValidation = PublishedSeoMetadataSchema.safeParse(existing.seo);
    if (!seoValidation.success) {
      throw new BadRequestError(
        `دوره برای انتشار نیاز به تکمیل متادیتای SEO استاندارد دارد: ${seoValidation.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    const now = new Date();
    const updated = await withOptionalTransaction(async (session) => {
      const doc = await CourseModel.findOneAndUpdate(
        {
          _id: existing._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: {
            status: 'published',
            lastPublishedAt: now,
            publishedAt: existing.publishedAt || now,
            archivedAt: null,
            updatedBy: actor.objectId,
          },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) {
        throw new ConflictError('دوره همزمان تغییر کرده است');
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'course',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'انتشار عمومی دوره',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'publish',
          resourceType: 'course',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'publishedAt', 'lastPublishedAt'],
          changeSummary: changeSummary || `انتشار دوره "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );

      return doc;
    });

    await courseStatsService.recalculateCourseStats(updated._id);
    await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(updated.slug));
    const refreshed = await CourseModel.findById(updated._id).lean<CourseRaw>();
    return toAdminCourseDto(refreshed || updated);
  }

  public async unpublishCourse(
    courseId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminCourseDto> {
    const existing = await CourseModel.findById(courseId);
    if (!existing) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (existing.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام خارج کردن دوره از انتشار', {
        currentVersion: existing.version ?? 1,
        expectedVersion,
      });
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await CourseModel.findOneAndUpdate(
        {
          _id: existing._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'draft', updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) {
        throw new ConflictError('دوره همزمان تغییر کرده است');
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'course',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'تبدیل وضعیت دوره به پیش‌نویس',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'unpublish',
          resourceType: 'course',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status'],
          changeSummary: changeSummary || `خروج دوره "${doc.title}" از انتشار عمومی`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(updated.slug));
    return toAdminCourseDto(updated);
  }

  public async archiveCourse(
    courseId: string,
    actor: AuthenticatedAdminActor,
    ctx: RequestAuditContext,
    expectedVersion?: number,
    changeSummary?: string
  ): Promise<AdminCourseDto> {
    const existing = await CourseModel.findById(courseId);
    if (!existing) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    if (expectedVersion !== undefined && (existing.version ?? 1) !== expectedVersion) {
      throw new ConflictError('تضاد نسخه هنگام بایگانی دوره', {
        currentVersion: existing.version ?? 1,
        expectedVersion,
      });
    }

    const updated = await withOptionalTransaction(async (session) => {
      const doc = await CourseModel.findOneAndUpdate(
        {
          _id: existing._id,
          ...(expectedVersion !== undefined ? { version: expectedVersion } : {}),
        },
        {
          $set: { status: 'archived', archivedAt: new Date(), updatedBy: actor.objectId },
          $inc: { version: 1 },
        },
        { new: true, session }
      );
      if (!doc) {
        throw new ConflictError('دوره همزمان تغییر کرده است');
      }

      await contentRevisionService.createRevision(
        {
          resourceType: 'course',
          resourceId: doc._id.toString(),
          snapshot: doc.toObject(),
          changeSummary: changeSummary || 'بایگانی دوره',
          createdBy: actor.objectId,
        },
        session
      );

      await adminAuditService.record(
        {
          actorUserId: actor.objectId,
          actorRole: actor.primaryRole,
          action: 'archive',
          resourceType: 'course',
          resourceId: doc._id.toString(),
          result: 'success',
          requestId: ctx.requestId,
          changedFields: ['status', 'archivedAt'],
          changeSummary: changeSummary || `بایگانی دوره "${doc.title}"`,
          ipHash: ctx.ipHash,
          userAgent: ctx.userAgent,
        },
        session
      );
      return doc;
    });

    await cacheInvalidationService.invalidate(buildCourseRevalidationTargets(updated.slug));
    return toAdminCourseDto(updated);
  }

  public async getCourseStats(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    const course = await CourseModel.findById(courseId).lean<CourseRaw>();
    if (!course) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    const [
      totalChapters,
      publishedChapters,
      draftChapters,
      totalLessons,
      publishedLessons,
      draftLessons,
      recalculated,
    ] = await Promise.all([
      ChapterModel.countDocuments({ courseId: course._id }),
      ChapterModel.countDocuments({ courseId: course._id, status: 'published' }),
      ChapterModel.countDocuments({ courseId: course._id, status: 'draft' }),
      LessonModel.countDocuments({ courseId: course._id }),
      LessonModel.countDocuments({ courseId: course._id, status: 'published' }),
      LessonModel.countDocuments({ courseId: course._id, status: 'draft' }),
      courseStatsService.recalculateCourseStats(course._id),
    ]);

    return {
      courseId: course._id.toString(),
      status: course.status,
      publicStats: recalculated,
      adminBreakdown: {
        totalChapters,
        publishedChapters,
        draftChapters,
        totalLessons,
        publishedLessons,
        draftLessons,
      },
    };
  }

  public async getCourseOutline(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }
    const course = await CourseModel.findById(courseId).lean<CourseRaw>();
    if (!course) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    const [chapters, lessons] = await Promise.all([
      ChapterModel.find({ courseId: course._id }).sort({ order: 1, _id: 1 }).lean(),
      LessonModel.find({ courseId: course._id })
        .select({
          _id: 1,
          chapterId: 1,
          title: 1,
          slug: 1,
          order: 1,
          status: 1,
          version: 1,
          readingTimeMinutes: 1,
          publishedAt: 1,
          updatedAt: 1,
        })
        .sort({ order: 1, _id: 1 })
        .lean(),
    ]);

    const lessonsByChapter = new Map<string, any[]>();
    for (const lesson of lessons || []) {
      const chId = lesson.chapterId.toString();
      const arr = lessonsByChapter.get(chId) || [];
      arr.push({
        id: lesson._id.toString(),
        chapterId: chId,
        title: lesson.title,
        slug: lesson.slug,
        order: lesson.order,
        status: lesson.status,
        version: lesson.version ?? 1,
        readingTimeMinutes: lesson.readingTimeMinutes,
        publishedAt: lesson.publishedAt ? new Date(lesson.publishedAt).toISOString() : null,
        updatedAt: lesson.updatedAt ? new Date(lesson.updatedAt).toISOString() : null,
      });
      lessonsByChapter.set(chId, arr);
    }

    return {
      course: toAdminCourseDto(course),
      chapters: (chapters || []).map((ch) => ({
        id: ch._id.toString(),
        title: ch.title,
        slug: ch.slug,
        summary: ch.summary,
        order: ch.order,
        status: ch.status,
        version: ch.version ?? 1,
        publishedAt: ch.publishedAt ? new Date(ch.publishedAt).toISOString() : null,
        lessons: lessonsByChapter.get(ch._id.toString()) || [],
      })),
    };
  }
}

export const adminCoursesService = new AdminCoursesService();

import { Request, Response } from 'express';
import {
  AdminCourseListQuerySchema,
  AdminCreateCourseDtoSchema,
  AdminUpdateCourseDtoSchema,
  CourseIdParamSchema,
  ChapterIdParamSchema,
  LessonIdParamSchema,
  MediaIdParamSchema,
  PageIdParamSchema,
  UserIdParamSchema,
  RevisionIdParamSchema,
  RevisionResourceParamsSchema,
  RevisionResourceTypeSchema,
  ExpectedVersionBodySchema,
  AdminChapterListQuerySchema,
  AdminCreateChapterDtoSchema,
  AdminUpdateChapterDtoSchema,
  AdminReorderChaptersDtoSchema,
  AdminLessonListQuerySchema,
  AdminCreateLessonDtoSchema,
  AdminUpdateLessonDtoSchema,
  AdminReorderLessonsDtoSchema,
  AdminMediaListQuerySchema,
  AdminUpdateMediaDtoSchema,
  AdminSitePageListQuerySchema,
  AdminCreateSitePageDtoSchema,
  AdminUpdateSitePageDtoSchema,
  AdminUpdateSiteSettingsDtoSchema,
  AdminUserListQuerySchema,
  AdminUpdateUserStatusDtoSchema,
  AdminUpdateUserRolesDtoSchema,
  AdminRevokeSessionsDtoSchema,
  AdminRestoreRevisionDtoSchema,
  AdminAuditLogQuerySchema,
  AdminPaginationQuerySchema,
} from '@techa/shared';
import { sendSuccess } from '../../core/utils/api-response';
import { hashIpAddress } from '../auth/auth.security';
import { extractAdminActor } from './authz/permissions.middleware';
import { adminCoursesService } from './courses/admin-courses.service';
import { adminChaptersService } from './chapters/admin-chapters.service';
import { adminLessonsService } from './lessons/admin-lessons.service';
import { adminMediaService, RequestAuditContext } from './media/media.service';
import { localMediaStorage } from './media/media-storage.service';
import { adminPagesService } from './pages/admin-pages.service';
import { adminSettingsService } from './settings/admin-settings.service';
import { adminUsersService } from './users/admin-users.service';
import { contentRevisionService } from './revisions/revision.service';
import { adminRevisionsRestoreService } from './revisions/admin-revisions-restore.service';
import { adminAuditService } from './audit/audit.service';
import { adminDashboardService } from './dashboard/admin-dashboard.service';
import { NotFoundError } from '../../core/errors/app-error';

function buildAuditContext(req: Request): RequestAuditContext {
  return {
    requestId: req.id ? String(req.id) : 'unknown',
    ipHash: hashIpAddress(req.ip),
    userAgent: req.get('user-agent') || null,
  };
}

export class AdminController {
  // ---------------------------------------------------------------------------
  // 1. Dashboard & Preview
  // ---------------------------------------------------------------------------
  public getDashboardSummary = async (_req: Request, res: Response) => {
    const summary = await adminDashboardService.getDashboardSummary();
    return sendSuccess(res, summary);
  };

  public previewLesson = async (req: Request, res: Response) => {
    const { lessonId } = LessonIdParamSchema.parse(req.params);
    const actor = extractAdminActor(req);
    const preview = await adminDashboardService.previewLesson(lessonId, actor);
    return sendSuccess(res, preview);
  };

  public previewCourse = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const actor = extractAdminActor(req);
    const preview = await adminDashboardService.previewCourse(courseId, actor);
    return sendSuccess(res, preview);
  };

  // ---------------------------------------------------------------------------
  // 2. Courses
  // ---------------------------------------------------------------------------
  public listCourses = async (req: Request, res: Response) => {
    const query = AdminCourseListQuerySchema.parse(req.query);
    const result = await adminCoursesService.listCourses(query);
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };

  public getCourse = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const course = await adminCoursesService.getCourseById(courseId);
    return sendSuccess(res, course);
  };

  public createCourse = async (req: Request, res: Response) => {
    const dto = AdminCreateCourseDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const course = await adminCoursesService.createCourse(dto, actor, buildAuditContext(req));
    return sendSuccess(res, course, 201, 'دوره جدید با موفقیت ایجاد شد');
  };

  public updateCourse = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const dto = AdminUpdateCourseDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const course = await adminCoursesService.updateCourse(
      courseId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, course, 200, 'دوره با موفقیت بروزرسانی شد');
  };

  public publishCourse = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const course = await adminCoursesService.publishCourse(
      courseId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, course, 200, 'دوره با موفقیت منتشر شد');
  };

  public unpublishCourse = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const course = await adminCoursesService.unpublishCourse(
      courseId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, course, 200, 'دوره به وضعیت پیش‌نویس بازگردانده شد');
  };

  public archiveCourse = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const course = await adminCoursesService.archiveCourse(
      courseId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, course, 200, 'دوره با موفقیت بایگانی شد');
  };

  public getCourseStats = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const stats = await adminCoursesService.getCourseStats(courseId);
    return sendSuccess(res, stats);
  };

  public getCourseOutline = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const outline = await adminCoursesService.getCourseOutline(courseId);
    return sendSuccess(res, outline);
  };

  // ---------------------------------------------------------------------------
  // 3. Chapters
  // ---------------------------------------------------------------------------
  public listChapters = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const query = AdminChapterListQuerySchema.parse(req.query);
    const chapters = await adminChaptersService.listChaptersByCourse(courseId, query.status);
    return sendSuccess(res, chapters);
  };

  public getChapter = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const chapter = await adminChaptersService.getChapterById(chapterId);
    return sendSuccess(res, chapter);
  };

  public createChapter = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const dto = AdminCreateChapterDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const chapter = await adminChaptersService.createChapter(
      courseId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, chapter, 201, 'فصل جدید با موفقیت ایجاد شد');
  };

  public updateChapter = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const dto = AdminUpdateChapterDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const chapter = await adminChaptersService.updateChapter(
      chapterId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, chapter, 200, 'فصل با موفقیت بروزرسانی شد');
  };

  public publishChapter = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const chapter = await adminChaptersService.publishChapter(
      chapterId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, chapter, 200, 'فصل با موفقیت منتشر شد');
  };

  public unpublishChapter = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const chapter = await adminChaptersService.unpublishChapter(
      chapterId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, chapter, 200, 'فصل به وضعیت پیش‌نویس تغییر یافت');
  };

  public archiveChapter = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const chapter = await adminChaptersService.archiveChapter(
      chapterId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, chapter, 200, 'فصل با موفقیت بایگانی شد');
  };

  public reorderChapters = async (req: Request, res: Response) => {
    const { courseId } = CourseIdParamSchema.parse(req.params);
    const dto = AdminReorderChaptersDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const chapters = await adminChaptersService.reorderChapters(
      courseId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, chapters, 200, 'ترتیب فصل‌ها با موفقیت بروزرسانی شد');
  };

  // ---------------------------------------------------------------------------
  // 4. Lessons
  // ---------------------------------------------------------------------------
  public listLessons = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const query = AdminLessonListQuerySchema.parse(req.query);
    const lessons = await adminLessonsService.listLessonsByChapter(chapterId, query.status);
    return sendSuccess(res, lessons);
  };

  public getLesson = async (req: Request, res: Response) => {
    const { lessonId } = LessonIdParamSchema.parse(req.params);
    const lesson = await adminLessonsService.getLessonById(lessonId);
    return sendSuccess(res, lesson);
  };

  public createLesson = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const dto = AdminCreateLessonDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const lesson = await adminLessonsService.createLesson(
      chapterId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, lesson, 201, 'درس جدید با موفقیت ایجاد شد');
  };

  public updateLesson = async (req: Request, res: Response) => {
    const { lessonId } = LessonIdParamSchema.parse(req.params);
    const dto = AdminUpdateLessonDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const lesson = await adminLessonsService.updateLesson(
      lessonId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, lesson, 200, 'درس با موفقیت بروزرسانی شد');
  };

  public publishLesson = async (req: Request, res: Response) => {
    const { lessonId } = LessonIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const lesson = await adminLessonsService.publishLesson(
      lessonId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, lesson, 200, 'درس با موفقیت منتشر شد');
  };

  public unpublishLesson = async (req: Request, res: Response) => {
    const { lessonId } = LessonIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const lesson = await adminLessonsService.unpublishLesson(
      lessonId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, lesson, 200, 'درس به وضعیت پیش‌نویس تغییر یافت');
  };

  public archiveLesson = async (req: Request, res: Response) => {
    const { lessonId } = LessonIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const lesson = await adminLessonsService.archiveLesson(
      lessonId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, lesson, 200, 'درس با موفقیت بایگانی شد');
  };

  public reorderLessons = async (req: Request, res: Response) => {
    const { chapterId } = ChapterIdParamSchema.parse(req.params);
    const dto = AdminReorderLessonsDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const lessons = await adminLessonsService.reorderLessons(
      chapterId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, lessons, 200, 'ترتیب درس‌ها با موفقیت بروزرسانی شد');
  };

  // ---------------------------------------------------------------------------
  // 5. Media Management
  // ---------------------------------------------------------------------------
  public listMedia = async (req: Request, res: Response) => {
    const query = AdminMediaListQuerySchema.parse(req.query);
    const result = await adminMediaService.listMedia(query);
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };

  public uploadMedia = async (req: Request, res: Response) => {
    const actor = extractAdminActor(req);
    const media = await adminMediaService.uploadFromMultipartRequest(
      req,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, media, 201, 'فایل با موفقیت بارگذاری و ثبت شد');
  };

  public getMedia = async (req: Request, res: Response) => {
    const { mediaId } = MediaIdParamSchema.parse(req.params);
    const media = await adminMediaService.getMediaById(mediaId);
    return sendSuccess(res, media);
  };

  public serveAdminMediaFile = async (req: Request, res: Response) => {
    const { mediaId } = MediaIdParamSchema.parse(req.params);
    const media = await adminMediaService.getMediaById(mediaId);
    const exists = await localMediaStorage.exists(media.storageKey);
    if (!exists) {
      throw new NotFoundError('فایل فیزیکی رسانه در ذخیره‌سازی یافت نشد');
    }
    const { stream, sizeBytes } = await localMediaStorage.openReadStreamSafe(media.storageKey);
    const disposition = media.mediaType === 'document' ? 'attachment' : 'inline';
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', String(sizeBytes));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(media.originalFileName)}"`
    );
    stream.pipe(res);
  };

  public updateMedia = async (req: Request, res: Response) => {
    const { mediaId } = MediaIdParamSchema.parse(req.params);
    const dto = AdminUpdateMediaDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const media = await adminMediaService.updateMedia(
      mediaId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, media, 200, 'مشخصات رسانه با موفقیت بروزرسانی شد');
  };

  public getMediaUsage = async (req: Request, res: Response) => {
    const { mediaId } = MediaIdParamSchema.parse(req.params);
    const usage = await adminMediaService.getMediaUsage(mediaId);
    return sendSuccess(res, usage);
  };

  public deleteMedia = async (req: Request, res: Response) => {
    const { mediaId } = MediaIdParamSchema.parse(req.params);
    const actor = extractAdminActor(req);
    const result = await adminMediaService.deleteMedia(
      mediaId,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, result, 200, 'فایل رسانه با موفقیت حذف شد');
  };

  // ---------------------------------------------------------------------------
  // 6. Site Pages & Site Settings
  // ---------------------------------------------------------------------------
  public listPages = async (req: Request, res: Response) => {
    const query = AdminSitePageListQuerySchema.parse(req.query);
    const result = await adminPagesService.listPages(query);
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };

  public getPage = async (req: Request, res: Response) => {
    const { pageId } = PageIdParamSchema.parse(req.params);
    const page = await adminPagesService.getPageById(pageId);
    return sendSuccess(res, page);
  };

  public createPage = async (req: Request, res: Response) => {
    const dto = AdminCreateSitePageDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const page = await adminPagesService.createPage(dto, actor, buildAuditContext(req));
    return sendSuccess(res, page, 201, 'صفحه جدید با موفقیت ایجاد شد');
  };

  public updatePage = async (req: Request, res: Response) => {
    const { pageId } = PageIdParamSchema.parse(req.params);
    const dto = AdminUpdateSitePageDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const page = await adminPagesService.updatePage(pageId, dto, actor, buildAuditContext(req));
    return sendSuccess(res, page, 200, 'صفحه با موفقیت بروزرسانی شد');
  };

  public publishPage = async (req: Request, res: Response) => {
    const { pageId } = PageIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const page = await adminPagesService.publishPage(
      pageId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, page, 200, 'صفحه با موفقیت منتشر شد');
  };

  public unpublishPage = async (req: Request, res: Response) => {
    const { pageId } = PageIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const page = await adminPagesService.unpublishPage(
      pageId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, page, 200, 'صفحه به وضعیت پیش‌نویس بازگردانده شد');
  };

  public archivePage = async (req: Request, res: Response) => {
    const { pageId } = PageIdParamSchema.parse(req.params);
    const body = ExpectedVersionBodySchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const page = await adminPagesService.archivePage(
      pageId,
      actor,
      buildAuditContext(req),
      body.expectedVersion,
      body.changeSummary
    );
    return sendSuccess(res, page, 200, 'صفحه با موفقیت بایگانی شد');
  };

  public getSettings = async (_req: Request, res: Response) => {
    const settings = await adminSettingsService.getSettings();
    return sendSuccess(res, settings);
  };

  public updateSettings = async (req: Request, res: Response) => {
    const dto = AdminUpdateSiteSettingsDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const settings = await adminSettingsService.updateSettings(
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, settings, 200, 'تنظیمات عمومی سایت با موفقیت بروزرسانی شد');
  };

  // ---------------------------------------------------------------------------
  // 7. Users Management
  // ---------------------------------------------------------------------------
  public listUsers = async (req: Request, res: Response) => {
    const query = AdminUserListQuerySchema.parse(req.query);
    const result = await adminUsersService.listUsers(query);
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };

  public getUserDetail = async (req: Request, res: Response) => {
    const { userId } = UserIdParamSchema.parse(req.params);
    const detail = await adminUsersService.getUserDetail(userId);
    return sendSuccess(res, detail);
  };

  public updateUserStatus = async (req: Request, res: Response) => {
    const { userId } = UserIdParamSchema.parse(req.params);
    const dto = AdminUpdateUserStatusDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const user = await adminUsersService.updateUserStatus(
      userId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, user, 200, 'وضعیت حساب کاربر با موفقیت تغییر یافت');
  };

  public updateUserRoles = async (req: Request, res: Response) => {
    const { userId } = UserIdParamSchema.parse(req.params);
    const dto = AdminUpdateUserRolesDtoSchema.parse(req.body);
    const actor = extractAdminActor(req);
    const user = await adminUsersService.updateUserRoles(
      userId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, user, 200, 'نقش‌های کاربر با موفقیت بروزرسانی شد');
  };

  public getUserSessions = async (req: Request, res: Response) => {
    const { userId } = UserIdParamSchema.parse(req.params);
    const sessions = await adminUsersService.getUserSessions(userId);
    return sendSuccess(res, sessions);
  };

  public revokeUserSessions = async (req: Request, res: Response) => {
    const { userId } = UserIdParamSchema.parse(req.params);
    const dto = AdminRevokeSessionsDtoSchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const result = await adminUsersService.revokeAllUserSessions(
      userId,
      dto.reason,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, result, 200, 'تمام نشست‌های فعال کاربر با موفقیت لغو شدند');
  };

  // ---------------------------------------------------------------------------
  // 8. Revisions & Audit Logs
  // ---------------------------------------------------------------------------
  public listAllRevisions = async (req: Request, res: Response) => {
    const pagination = AdminPaginationQuerySchema.parse(req.query);
    const resourceTypeRaw = typeof req.query.resourceType === 'string' && req.query.resourceType ? req.query.resourceType : undefined;
    const resourceIdRaw = typeof req.query.resourceId === 'string' && req.query.resourceId.trim() ? req.query.resourceId.trim() : undefined;
    const resourceType = resourceTypeRaw ? RevisionResourceTypeSchema.parse(resourceTypeRaw) : undefined;
    const result = await contentRevisionService.listAllRevisions({
      resourceType,
      resourceId: resourceIdRaw,
      q: pagination.q,
      page: pagination.page,
      limit: pagination.limit,
    });
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };

  public listRevisions = async (req: Request, res: Response) => {
    const { resourceType, resourceId } = RevisionResourceParamsSchema.parse(req.params);
    const pagination = AdminPaginationQuerySchema.parse(req.query);
    const result = await contentRevisionService.listRevisions(
      resourceType,
      resourceId,
      pagination.page,
      pagination.limit
    );
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };

  public getRevision = async (req: Request, res: Response) => {
    const { revisionId } = RevisionIdParamSchema.parse(req.params);
    const revision = await contentRevisionService.getRevisionById(revisionId);
    return sendSuccess(res, revision);
  };

  public restoreRevision = async (req: Request, res: Response) => {
    const { revisionId } = RevisionIdParamSchema.parse(req.params);
    const dto = AdminRestoreRevisionDtoSchema.parse(req.body || {});
    const actor = extractAdminActor(req);
    const result = await adminRevisionsRestoreService.restoreRevision(
      revisionId,
      dto,
      actor,
      buildAuditContext(req)
    );
    return sendSuccess(res, result, 200, 'بازگردانی به نسخه انتخاب‌شده با موفقیت انجام شد');
  };

  public listAuditLogs = async (req: Request, res: Response) => {
    const query = AdminAuditLogQuerySchema.parse(req.query);
    const result = await adminAuditService.queryLogs(query);
    return sendSuccess(res, result.items, 200, undefined, {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      },
    });
  };
}

export const adminController = new AdminController();

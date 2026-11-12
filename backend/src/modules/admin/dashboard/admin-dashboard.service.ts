import { Types } from 'mongoose';
import { AdminDashboardSummaryDto } from '@techa/shared';
import { CourseModel } from '../../../models/course.model';
import { ChapterModel } from '../../../models/chapter.model';
import { LessonModel } from '../../../models/lesson.model';
import { MediaAssetModel } from '../../../models/media-asset.model';
import { SitePageModel } from '../../../models/site-page.model';
import { UserModel } from '../../../models/user.model';
import { AdminAuditLogModel } from '../../../models/admin-audit-log.model';
import { NotFoundError } from '../../../core/errors/app-error';
import {
  AuthenticatedAdminActor,
  assertOwnershipIfEditorOnly,
} from '../authz/permissions.middleware';
import { toAuditLogDto } from '../audit/audit.service';
import { toAdminCourseDto } from '../courses/admin-courses.service';
import { toAdminLessonDto } from '../lessons/admin-lessons.service';

export class AdminDashboardService {
  public async getDashboardSummary(): Promise<AdminDashboardSummaryDto> {
    const [
      coursesTotal,
      coursesPublished,
      coursesDraft,
      coursesArchived,
      chaptersTotal,
      chaptersPublished,
      chaptersDraft,
      lessonsTotal,
      lessonsPublished,
      lessonsDraft,
      mediaTotal,
      mediaBytesAgg,
      pagesTotal,
      pagesPublished,
      usersTotal,
      usersActive,
      usersAdmins,
      recentAuditDocs,
    ] = await Promise.all([
      CourseModel.countDocuments({}),
      CourseModel.countDocuments({ status: 'published' }),
      CourseModel.countDocuments({ status: 'draft' }),
      CourseModel.countDocuments({ status: 'archived' }),
      ChapterModel.countDocuments({}),
      ChapterModel.countDocuments({ status: 'published' }),
      ChapterModel.countDocuments({ status: 'draft' }),
      LessonModel.countDocuments({}),
      LessonModel.countDocuments({ status: 'published' }),
      LessonModel.countDocuments({ status: 'draft' }),
      MediaAssetModel.countDocuments({ status: { $ne: 'archived' } }),
      MediaAssetModel.aggregate([
        { $match: { status: { $ne: 'archived' } } },
        { $group: { _id: null, totalBytes: { $sum: '$sizeBytes' } } },
      ]),
      SitePageModel.countDocuments({}),
      SitePageModel.countDocuments({ status: 'published' }),
      UserModel.countDocuments({}),
      UserModel.countDocuments({ status: 'active' }),
      UserModel.countDocuments({
        roles: { $in: ['content_editor', 'content_manager', 'admin', 'super_admin'] },
      }),
      AdminAuditLogModel.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return {
      courses: {
        total: coursesTotal || 0,
        published: coursesPublished || 0,
        draft: coursesDraft || 0,
        archived: coursesArchived || 0,
      },
      chapters: {
        total: chaptersTotal || 0,
        published: chaptersPublished || 0,
        draft: chaptersDraft || 0,
      },
      lessons: {
        total: lessonsTotal || 0,
        published: lessonsPublished || 0,
        draft: lessonsDraft || 0,
      },
      media: {
        total: mediaTotal || 0,
        totalBytes: mediaBytesAgg?.[0]?.totalBytes || 0,
      },
      pages: {
        total: pagesTotal || 0,
        published: pagesPublished || 0,
      },
      users: {
        total: usersTotal || 0,
        active: usersActive || 0,
        admins: usersAdmins || 0,
      },
      recentAuditLogs: (recentAuditDocs || []).map(toAuditLogDto),
    };
  }

  public async previewLesson(lessonId: string, actor: AuthenticatedAdminActor) {
    if (!Types.ObjectId.isValid(lessonId)) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }

    const lesson = await LessonModel.findById(lessonId).lean();
    if (!lesson) {
      throw new NotFoundError('درس مورد نظر یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, lesson.createdBy, 'درس');

    const [course, chapter] = await Promise.all([
      CourseModel.findById(lesson.courseId).lean(),
      ChapterModel.findById(lesson.chapterId).lean(),
    ]);

    return {
      previewMode: true,
      lesson: toAdminLessonDto(lesson),
      parentCourse: course
        ? { id: course._id.toString(), title: course.title, slug: course.slug, status: course.status }
        : null,
      parentChapter: chapter
        ? { id: chapter._id.toString(), title: chapter.title, slug: chapter.slug, status: chapter.status }
        : null,
    };
  }

  public async previewCourse(courseId: string, actor: AuthenticatedAdminActor) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    const course = await CourseModel.findById(courseId).lean();
    if (!course) {
      throw new NotFoundError('دوره مورد نظر یافت نشد');
    }

    assertOwnershipIfEditorOnly(actor, course.createdBy, 'دوره');

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
          readingTimeMinutes: 1,
          publishedAt: 1,
        })
        .sort({ order: 1, _id: 1 })
        .lean(),
    ]);

    const lessonsByChapter = new Map<string, any[]>();
    for (const l of lessons || []) {
      const chId = l.chapterId.toString();
      const arr = lessonsByChapter.get(chId) || [];
      arr.push({
        id: l._id.toString(),
        title: l.title,
        slug: l.slug,
        order: l.order,
        status: l.status,
        readingTimeMinutes: l.readingTimeMinutes,
      });
      lessonsByChapter.set(chId, arr);
    }

    return {
      previewMode: true,
      course: toAdminCourseDto(course),
      outline: (chapters || []).map((ch) => ({
        id: ch._id.toString(),
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        status: ch.status,
        lessons: lessonsByChapter.get(ch._id.toString()) || [],
      })),
    };
  }
}

export const adminDashboardService = new AdminDashboardService();

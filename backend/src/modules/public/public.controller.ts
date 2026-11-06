import { Request, Response } from 'express';
import {
  CourseListQuerySchema,
  CourseSlugParamSchema,
  LessonSlugParamsSchema,
} from '@techa/shared';
import { publicService } from './public.service';
import { sendSuccess } from '../../core/utils/api-response';

export class PublicController {
  /**
   * GET /api/v1/public/home
   */
  public getHomepage = async (_req: Request, res: Response): Promise<void> => {
    const page = await publicService.getHomepage();
    sendSuccess(res, page, 200);
  };

  /**
   * GET /api/v1/public/courses
   */
  public getCourses = async (req: Request, res: Response): Promise<void> => {
    const query = CourseListQuerySchema.parse(req.query);
    const result = await publicService.getPublishedCourses(query);

    sendSuccess(res, result.courses, 200, undefined, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * GET /api/v1/public/courses/:courseSlug
   */
  public getCourseDetail = async (req: Request, res: Response): Promise<void> => {
    const { courseSlug } = CourseSlugParamSchema.parse(req.params);
    const course = await publicService.getPublishedCourseDetail(courseSlug);
    sendSuccess(res, course, 200);
  };

  /**
   * GET /api/v1/public/courses/:courseSlug/outline
   */
  public getCourseOutline = async (req: Request, res: Response): Promise<void> => {
    const { courseSlug } = CourseSlugParamSchema.parse(req.params);
    const outline = await publicService.getCourseOutline(courseSlug);
    sendSuccess(res, outline, 200);
  };

  /**
   * GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug
   */
  public getLessonDetail = async (req: Request, res: Response): Promise<void> => {
    const { courseSlug, lessonSlug } = LessonSlugParamsSchema.parse(req.params);
    const lesson = await publicService.getPublishedLessonDetail(courseSlug, lessonSlug);
    sendSuccess(res, lesson, 200);
  };
}

export const publicController = new PublicController();

import { Router } from 'express';
import { publicController } from './public.controller';
import { asyncHandler } from '../../core/utils/async-handler';

export const publicRoutes = Router();

// 1. Homepage
publicRoutes.get('/home', asyncHandler(publicController.getHomepage));

// 2. Published course list
publicRoutes.get('/courses', asyncHandler(publicController.getCourses));

// 3. Course detail
publicRoutes.get('/courses/:courseSlug', asyncHandler(publicController.getCourseDetail));

// 4. Course outline
publicRoutes.get('/courses/:courseSlug/outline', asyncHandler(publicController.getCourseOutline));

// 5. Lesson detail
publicRoutes.get(
  '/courses/:courseSlug/lessons/:lessonSlug',
  asyncHandler(publicController.getLessonDetail)
);

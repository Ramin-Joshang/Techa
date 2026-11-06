import { z } from 'zod';
import {
  SlugSchema,
  ObjectIdSchema,
  CourseLevelSchema,
  CourseStatsSchema,
} from './primitives.schema';
import { CourseTagSchema } from './course.schema';

export const CourseListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive('Page must be a positive integer').default(1),
    limit: z.coerce.number().int().positive('Limit must be a positive integer').max(50, 'Limit cannot exceed 50').default(20),
    level: CourseLevelSchema.optional(),
    tag: CourseTagSchema.optional(),
  })
  .strict();

export const CourseSlugParamSchema = z
  .object({
    courseSlug: SlugSchema,
  })
  .strict();

export const LessonSlugParamsSchema = z
  .object({
    courseSlug: SlugSchema,
    lessonSlug: SlugSchema,
  })
  .strict();

export const LessonOutlineItemDtoSchema = z.object({
  id: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  order: z.number().int(),
  readingTimeMinutes: z.number().int(),
});

export const ChapterOutlinePublicDtoSchema = z.object({
  id: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  summary: z.string().optional(),
  order: z.number().int(),
  lessons: z.array(LessonOutlineItemDtoSchema),
});

export const CourseOutlinePublicDtoSchema = z.object({
  course: z.object({
    id: ObjectIdSchema,
    slug: SlugSchema,
    title: z.string(),
    stats: CourseStatsSchema,
  }),
  chapters: z.array(ChapterOutlinePublicDtoSchema),
});

export type CourseListQuery = z.infer<typeof CourseListQuerySchema>;
export type CourseSlugParam = z.infer<typeof CourseSlugParamSchema>;
export type LessonSlugParams = z.infer<typeof LessonSlugParamsSchema>;
export type LessonOutlineItemDto = z.infer<typeof LessonOutlineItemDtoSchema>;
export type ChapterOutlinePublicDto = z.infer<typeof ChapterOutlinePublicDtoSchema>;
export type CourseOutlinePublicDto = z.infer<typeof CourseOutlinePublicDtoSchema>;

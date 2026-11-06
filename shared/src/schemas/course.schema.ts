import { z } from 'zod';
import {
  SlugSchema,
  StorageKeySchema,
  CourseLevelSchema,
  CourseIconSchema,
  PublicationStatusSchema,
  SeoMetadataSchema,
  CourseStatsSchema,
  ObjectIdSchema,
} from './primitives.schema';

export const CourseTagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(30, 'Tag cannot exceed 30 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Tag must be lowercase alphanumeric with single hyphens');

export const CourseSchema = z.object({
  id: ObjectIdSchema.optional(),
  slug: SlugSchema,
  title: z.string().min(1, 'Title cannot be empty').max(150, 'Title cannot exceed 150 characters'),
  summary: z.string().min(1, 'Summary cannot be empty').max(300, 'Summary cannot exceed 300 characters'),
  description: z.string().min(1, 'Description cannot be empty').max(5000, 'Description cannot exceed 5000 characters'),
  level: CourseLevelSchema,
  icon: CourseIconSchema,
  coverStorageKey: StorageKeySchema.optional(),
  tags: z.array(CourseTagSchema).max(10, 'Cannot exceed 10 tags').default([]),
  prerequisites: z.array(z.string().min(1).max(150)).max(10, 'Cannot exceed 10 prerequisites').default([]),
  targetAudience: z.array(z.string().min(1).max(150)).max(10, 'Cannot exceed 10 audience points').default([]),
  order: z.number().int().nonnegative().default(0),
  status: PublicationStatusSchema.default('draft'),
  stats: CourseStatsSchema.default({
    totalChapters: 0,
    totalLessons: 0,
    estimatedReadingTimeMinutes: 0,
  }),
  seo: SeoMetadataSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  lastPublishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateCourseDtoSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1).max(150),
  summary: z.string().min(1).max(300),
  description: z.string().min(1).max(5000),
  level: CourseLevelSchema,
  icon: CourseIconSchema,
  coverStorageKey: StorageKeySchema.optional(),
  tags: z.array(CourseTagSchema).max(10).default([]),
  prerequisites: z.array(z.string().min(1).max(150)).max(10).default([]),
  targetAudience: z.array(z.string().min(1).max(150)).max(10).default([]),
  order: z.number().int().nonnegative().default(0),
  seo: SeoMetadataSchema,
});

export const UpdateCourseDtoSchema = CreateCourseDtoSchema.partial().extend({
  status: PublicationStatusSchema.optional(),
});

export const CoursePublicDtoSchema = z.object({
  id: ObjectIdSchema,
  slug: SlugSchema,
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  level: CourseLevelSchema,
  icon: CourseIconSchema,
  coverStorageKey: StorageKeySchema.optional(),
  tags: z.array(z.string()),
  prerequisites: z.array(z.string()),
  targetAudience: z.array(z.string()),
  order: z.number().int(),
  stats: CourseStatsSchema,
  seo: SeoMetadataSchema,
  publishedAt: z.string().datetime().nullable().optional(),
});

export type Course = z.infer<typeof CourseSchema>;
export type CreateCourseDto = z.input<typeof CreateCourseDtoSchema>;
export type UpdateCourseDto = z.input<typeof UpdateCourseDtoSchema>;
export type CoursePublicDto = z.infer<typeof CoursePublicDtoSchema>;

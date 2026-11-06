import { z } from 'zod';
import {
  SlugSchema,
  ObjectIdSchema,
  PublicationStatusSchema,
  SeoMetadataSchema,
} from './primitives.schema';
import { ContentBlockSchema } from './content-blocks.schema';

export const LessonContentSchemaVersion = z.literal(1);

export const LessonSchema = z.object({
  id: ObjectIdSchema.optional(),
  courseId: ObjectIdSchema,
  chapterId: ObjectIdSchema,
  title: z.string().min(1, 'Title cannot be empty').max(150, 'Title cannot exceed 150 characters'),
  slug: SlugSchema,
  order: z.number().int().nonnegative().default(0),
  readingTimeMinutes: z.number().int().nonnegative().default(1),
  contentSchemaVersion: LessonContentSchemaVersion.default(1),
  contentBlocks: z.array(ContentBlockSchema).default([]),
  status: PublicationStatusSchema.default('draft'),
  seo: SeoMetadataSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  lastPublishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateLessonDtoSchema = z.object({
  courseId: ObjectIdSchema,
  chapterId: ObjectIdSchema,
  title: z.string().min(1).max(150),
  slug: SlugSchema,
  order: z.number().int().nonnegative().default(0),
  readingTimeMinutes: z.number().int().nonnegative().default(1),
  contentSchemaVersion: LessonContentSchemaVersion.default(1),
  contentBlocks: z.array(ContentBlockSchema).default([]),
  seo: SeoMetadataSchema,
});

export const UpdateLessonDtoSchema = CreateLessonDtoSchema.partial().extend({
  status: PublicationStatusSchema.optional(),
});

export const LessonPublicDtoSchema = z.object({
  id: ObjectIdSchema,
  courseId: ObjectIdSchema,
  chapterId: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  order: z.number().int(),
  readingTimeMinutes: z.number().int(),
  contentSchemaVersion: LessonContentSchemaVersion,
  contentBlocks: z.array(ContentBlockSchema),
  seo: SeoMetadataSchema,
  publishedAt: z.string().datetime().nullable().optional(),
});

export const LessonSummaryPublicDtoSchema = z.object({
  id: ObjectIdSchema,
  courseId: ObjectIdSchema,
  chapterId: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  order: z.number().int(),
  readingTimeMinutes: z.number().int(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export type Lesson = z.infer<typeof LessonSchema>;
export type CreateLessonDto = z.input<typeof CreateLessonDtoSchema>;
export type UpdateLessonDto = z.input<typeof UpdateLessonDtoSchema>;
export type LessonPublicDto = z.infer<typeof LessonPublicDtoSchema>;
export type LessonSummaryPublicDto = z.infer<typeof LessonSummaryPublicDtoSchema>;

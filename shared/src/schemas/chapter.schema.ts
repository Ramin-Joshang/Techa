import { z } from 'zod';
import {
  SlugSchema,
  ObjectIdSchema,
  PublicationStatusSchema,
} from './primitives.schema';

export const ChapterSchema = z.object({
  id: ObjectIdSchema.optional(),
  courseId: ObjectIdSchema,
  title: z.string().min(1, 'Title cannot be empty').max(150, 'Title cannot exceed 150 characters'),
  slug: SlugSchema,
  summary: z.string().max(300, 'Summary cannot exceed 300 characters').optional(),
  order: z.number().int().nonnegative().default(0),
  status: PublicationStatusSchema.default('draft'),
  publishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateChapterDtoSchema = z.object({
  courseId: ObjectIdSchema,
  title: z.string().min(1).max(150),
  slug: SlugSchema,
  summary: z.string().max(300).optional(),
  order: z.number().int().nonnegative().default(0),
});

export const UpdateChapterDtoSchema = CreateChapterDtoSchema.partial().extend({
  status: PublicationStatusSchema.optional(),
});

export const ChapterPublicDtoSchema = z.object({
  id: ObjectIdSchema,
  courseId: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  summary: z.string().optional(),
  order: z.number().int(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export type Chapter = z.infer<typeof ChapterSchema>;
export type CreateChapterDto = z.input<typeof CreateChapterDtoSchema>;
export type UpdateChapterDto = z.input<typeof UpdateChapterDtoSchema>;
export type ChapterPublicDto = z.infer<typeof ChapterPublicDtoSchema>;

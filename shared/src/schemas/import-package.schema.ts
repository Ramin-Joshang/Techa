import { z } from 'zod';
import {
  SlugSchema,
  StorageKeySchema,
  CourseLevelSchema,
  CourseIconSchema,
  SeoMetadataSchema,
  MediaCategorySchema,
} from './primitives.schema';
import { ContentBlockSchema } from './content-blocks.schema';

export const ChapterImportItemSchema = z.object({
  chapterImportKey: z
    .string()
    .min(1, 'Chapter import key cannot be empty')
    .max(50, 'Chapter import key cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Chapter import key must be alphanumeric, hyphen, or underscore'),
  title: z.string().min(1, 'Chapter title cannot be empty').max(150),
  slug: SlugSchema,
  summary: z.string().max(300).optional(),
  order: z.number().int().nonnegative(),
});

export const LessonImportItemSchema = z.object({
  chapterImportKey: z.string().min(1, 'Chapter reference key cannot be empty'),
  title: z.string().min(1, 'Lesson title cannot be empty').max(150),
  slug: SlugSchema,
  order: z.number().int().nonnegative(),
  readingTimeMinutes: z.number().int().positive().default(5),
  contentBlocks: z.array(ContentBlockSchema).min(1, 'Imported lesson must have at least 1 content block'),
  seo: SeoMetadataSchema,
});

export const MediaManifestItemSchema = z.object({
  storageKey: StorageKeySchema,
  originalFileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  sizeBytes: z.number().int().positive(),
  category: MediaCategorySchema,
  altText: z.string().max(200).optional(),
});

export const CourseImportPackageSchema = z
  .object({
    contractVersion: z.literal(1),
    contentSchemaVersion: z.literal(1),
    course: z.object({
      slug: SlugSchema,
      title: z.string().min(1).max(150),
      summary: z.string().min(1).max(300),
      description: z.string().min(1).max(5000),
      level: CourseLevelSchema,
      icon: CourseIconSchema,
      coverStorageKey: StorageKeySchema.optional(),
      tags: z.array(z.string().min(1).max(30)).max(10).default([]),
      prerequisites: z.array(z.string().min(1).max(150)).max(10).default([]),
      targetAudience: z.array(z.string().min(1).max(150)).max(10).default([]),
      order: z.number().int().nonnegative().default(0),
      seo: SeoMetadataSchema,
    }),
    chapters: z.array(ChapterImportItemSchema).min(1, 'Package must contain at least 1 chapter'),
    lessons: z.array(LessonImportItemSchema).min(1, 'Package must contain at least 1 lesson'),
    mediaManifest: z.array(MediaManifestItemSchema).default([]),
  })
  .superRefine((pkg, ctx) => {
    // 1. Unique chapter import keys
    const chapterKeys = new Set<string>();
    const chapterSlugs = new Set<string>();

    pkg.chapters.forEach((ch, idx) => {
      if (chapterKeys.has(ch.chapterImportKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['chapters', idx, 'chapterImportKey'],
          message: `Duplicate chapterImportKey "${ch.chapterImportKey}" in chapters list`,
        });
      }
      chapterKeys.add(ch.chapterImportKey);

      if (chapterSlugs.has(ch.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['chapters', idx, 'slug'],
          message: `Duplicate chapter slug "${ch.slug}" in chapters list`,
        });
      }
      chapterSlugs.add(ch.slug);
    });

    // 2. Unique lesson slugs & existing chapter reference
    const lessonSlugs = new Set<string>();
    const allBlockIds = new Set<string>();

    pkg.lessons.forEach((lesson, lIdx) => {
      if (!chapterKeys.has(lesson.chapterImportKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lessons', lIdx, 'chapterImportKey'],
          message: `Referenced chapterImportKey "${lesson.chapterImportKey}" does not exist in chapters`,
        });
      }

      if (lessonSlugs.has(lesson.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lessons', lIdx, 'slug'],
          message: `Duplicate lesson slug "${lesson.slug}" across course lessons`,
        });
      }
      lessonSlugs.add(lesson.slug);

      // 3. Unique block IDs across package
      lesson.contentBlocks.forEach((block, bIdx) => {
        if (allBlockIds.has(block.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lessons', lIdx, 'contentBlocks', bIdx, 'id'],
            message: `Duplicate block ID "${block.id}" found in lesson "${lesson.slug}"`,
          });
        }
        allBlockIds.add(block.id);
      });
    });

    // 4. Media manifest integrity
    const declaredStorageKeys = new Set(pkg.mediaManifest.map((m) => m.storageKey));
    if (pkg.course.icon.kind === 'media' && !declaredStorageKeys.has(pkg.course.icon.storageKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['course', 'icon', 'storageKey'],
        message: `Course icon storageKey "${pkg.course.icon.storageKey}" is not declared in mediaManifest`,
      });
    }
    if (pkg.course.coverStorageKey && !declaredStorageKeys.has(pkg.course.coverStorageKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['course', 'coverStorageKey'],
        message: `Course cover storageKey "${pkg.course.coverStorageKey}" is not declared in mediaManifest`,
      });
    }
  });

export type CourseImportPackage = z.infer<typeof CourseImportPackageSchema>;

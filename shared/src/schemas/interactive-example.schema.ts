import { z } from 'zod';
import {
  INTERACTIVE_ENVIRONMENTS,
  INTERACTIVE_PRESETS,
} from '../constants/content.constants';

const ALLOWED_LANGUAGES = ['javascript', 'typescript', 'html', 'css', 'json'] as const;

export const InteractiveFileLanguageSchema = z.enum(ALLOWED_LANGUAGES);

const EXTENSION_TO_LANG: Record<string, (typeof ALLOWED_LANGUAGES)[number]> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
};

const ENVIRONMENT_ALLOWED_EXTENSIONS: Record<string, string[]> = {
  'html-css-js': ['html', 'css', 'js', 'json'],
  react: ['jsx', 'tsx', 'js', 'ts', 'css', 'json'],
  'react-tailwind': ['jsx', 'tsx', 'js', 'ts', 'css', 'json'],
};

const ENVIRONMENT_ENTRYPOINT_EXTENSIONS: Record<string, string[]> = {
  'html-css-js': ['html'],
  react: ['jsx', 'tsx', 'js', 'ts'],
  'react-tailwind': ['jsx', 'tsx', 'js', 'ts'],
};

const textEncoder = new TextEncoder();

export function getUtf8ByteLength(str: string): number {
  return textEncoder.encode(str).length;
}

export const InteractiveFilePathSchema = z
  .string()
  .min(1, 'File path cannot be empty')
  .max(150, 'File path cannot exceed 150 characters')
  .superRefine((path, ctx) => {
    if (path.includes('\0')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'File path cannot contain null bytes',
      });
      return;
    }
    if (path.includes('\\')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'File path cannot contain backslashes; use forward slashes',
      });
      return;
    }
    if (path.startsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'File path cannot be absolute or start with a slash',
      });
      return;
    }
    if (path.endsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'File path cannot end with a slash',
      });
      return;
    }

    const segments = path.split('/');
    for (const segment of segments) {
      if (segment.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'File path contains empty segments',
        });
        return;
      }
      if (segment === '.' || segment === '..') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Path traversal using "." or ".." is forbidden',
        });
        return;
      }
      if (!/^[a-zA-Z0-9_\-.]+$/.test(segment)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Path segment "${segment}" contains forbidden characters`,
        });
        return;
      }
    }

    const dotIndex = path.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === path.length - 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'File must have a valid file extension',
      });
    }
  });

export const InteractiveFileSchema = z
  .object({
    path: InteractiveFilePathSchema,
    language: InteractiveFileLanguageSchema,
    content: z.string().superRefine((content, ctx) => {
      const bytes = getUtf8ByteLength(content);
      if (bytes > 50 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `File content exceeds maximum limit of 50 KB (received ${bytes} bytes)`,
        });
      }
    }),
    entryPoint: z.boolean(),
    readOnly: z.boolean().optional().default(false),
  })
  .superRefine((file, ctx) => {
    const ext = file.path.split('.').pop()?.toLowerCase() || '';
    const expectedLang = EXTENSION_TO_LANG[ext];
    if (expectedLang && expectedLang !== file.language) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['language'],
        message: `Language "${file.language}" does not match file extension ".${ext}" (expected "${expectedLang}")`,
      });
    }
  });

export const InteractiveExampleDataSchema = z
  .object({
    environment: z.enum(INTERACTIVE_ENVIRONMENTS),
    preset: z.enum(INTERACTIVE_PRESETS),
    title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    files: z
      .array(InteractiveFileSchema)
      .min(1, 'An interactive example must have at least 1 file')
      .max(10, 'An interactive example cannot have more than 10 files'),
  })
  .superRefine((data, ctx) => {
    // 1. Exactly one entry point
    const entryPoints = data.files.filter((f) => f.entryPoint);
    if (entryPoints.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['files'],
        message: 'Interactive example must have exactly one entryPoint file',
      });
    } else if (entryPoints.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['files'],
        message: `Interactive example has ${entryPoints.length} entry points; exactly 1 is allowed`,
      });
    }

    // 2. Unique file paths (case-insensitively)
    const pathsSeen = new Set<string>();
    for (let i = 0; i < data.files.length; i++) {
      const normalizedPath = data.files[i].path.toLowerCase();
      if (pathsSeen.has(normalizedPath)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['files', i, 'path'],
          message: `Duplicate file path "${data.files[i].path}" detected`,
        });
      }
      pathsSeen.add(normalizedPath);
    }

    // 3. Environment compatibility checks
    const allowedExtensions = ENVIRONMENT_ALLOWED_EXTENSIONS[data.environment] || [];
    const allowedEntryExts = ENVIRONMENT_ENTRYPOINT_EXTENSIONS[data.environment] || [];

    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i];
      const ext = file.path.split('.').pop()?.toLowerCase() || '';

      if (!allowedExtensions.includes(ext)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['files', i, 'path'],
          message: `Extension ".${ext}" is not permitted in "${data.environment}" environment (allowed: ${allowedExtensions.join(', ')})`,
        });
      }

      if (file.entryPoint && !allowedEntryExts.includes(ext)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['files', i, 'path'],
          message: `Entry point extension ".${ext}" is not valid for "${data.environment}" (must be: ${allowedEntryExts.join(', ')})`,
        });
      }
    }

    // 4. Total project size across all files <= 256,000 UTF-8 bytes
    let totalBytes = 0;
    for (const file of data.files) {
      totalBytes += getUtf8ByteLength(file.content);
    }
    if (totalBytes > 256000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['files'],
        message: `Total project size (${totalBytes} bytes) exceeds maximum limit of 256,000 UTF-8 bytes`,
      });
    }
  });

export type InteractiveFile = z.infer<typeof InteractiveFileSchema>;


import { z } from 'zod';
import {
  CODE_LANGUAGES,
  CALLOUT_TYPES,
  LIST_FORMATS,
} from '../constants/content.constants';
import { StorageKeySchema } from './primitives.schema';
import {
  InteractiveExampleDataSchema,
  getUtf8ByteLength,
} from './interactive-example.schema';

export const BlockIdSchema = z
  .string()
  .regex(
    /^blk_[a-zA-Z0-9_-]{8,32}$/,
    'Block ID must follow pattern "blk_<suffix>" (8-32 alphanumeric characters, hyphens, or underscores)'
  );

export const ContentBlockVersionSchema = z.literal(1);

// 1. Heading Block
export const HeadingBlockDataSchema = z.object({
  level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1, 'Heading text cannot be empty').max(250, 'Heading text cannot exceed 250 characters'),
});

export const HeadingBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('heading'),
  data: HeadingBlockDataSchema,
});

// 2. Paragraph Block
export const ParagraphBlockDataSchema = z.object({
  text: z.string().min(1, 'Paragraph text cannot be empty').max(5000, 'Paragraph text cannot exceed 5000 characters'),
});

export const ParagraphBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('paragraph'),
  data: ParagraphBlockDataSchema,
});

// 3. Rich Text Block
export const RichTextSpanSchema = z.object({
  text: z.string().min(1, 'Span text cannot be empty').max(1000, 'Span text cannot exceed 1000 characters'),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  code: z.boolean().optional(),
  underline: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
  link: z
    .object({
      url: z.string().url('Link must be a valid URL'),
      openInNewTab: z.boolean().optional(),
    })
    .optional(),
});

export const RichTextBlockDataSchema = z.object({
  spans: z
    .array(RichTextSpanSchema)
    .min(1, 'Rich text block must contain at least one span')
    .max(100, 'Rich text block cannot exceed 100 spans'),
});

export const RichTextBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('richText'),
  data: RichTextBlockDataSchema,
});

// 4. Code Block
export const CodeBlockDataSchema = z.object({
  code: z
    .string()
    .min(1, 'Code cannot be empty')
    .max(50000, 'Code character count cannot exceed 50,000')
    .superRefine((val, ctx) => {
      const bytes = getUtf8ByteLength(val);
      if (bytes > 50 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Code block exceeds 50 KB UTF-8 limit (${bytes} bytes)`,
        });
      }
    }),
  language: z.enum(CODE_LANGUAGES),
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  showLineNumbers: z.boolean().optional().default(true),
});

export const CodeBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('codeBlock'),
  data: CodeBlockDataSchema,
});

// 5. Image Block
export const ImageBlockDataSchema = z.object({
  storageKey: StorageKeySchema,
  altText: z.string().min(1, 'Alt text is required for accessibility').max(200, 'Alt text cannot exceed 200 characters'),
  caption: z.string().max(300, 'Caption cannot exceed 300 characters').optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const ImageBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('image'),
  data: ImageBlockDataSchema,
});

// 6. Video Block
export const VideoBlockDataSchema = z.object({
  storageKey: StorageKeySchema,
  posterStorageKey: StorageKeySchema.optional(),
  caption: z.string().max(300, 'Caption cannot exceed 300 characters').optional(),
  durationSeconds: z.number().int().positive().optional(),
});

export const VideoBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('video'),
  data: VideoBlockDataSchema,
});

// 7. Table Block
export const TableBlockDataSchema = z
  .object({
    headers: z
      .array(z.string().min(1, 'Header cell cannot be empty').max(100, 'Header cell cannot exceed 100 characters'))
      .min(1, 'Table must have at least 1 column')
      .max(10, 'Table cannot exceed 10 columns'),
    rows: z
      .array(z.array(z.string().max(500, 'Table cell cannot exceed 500 characters')))
      .min(1, 'Table must have at least 1 row')
      .max(100, 'Table cannot exceed 100 rows'),
  })
  .superRefine((data, ctx) => {
    const colCount = data.headers.length;
    for (let r = 0; r < data.rows.length; r++) {
      if (data.rows[r].length !== colCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rows', r],
          message: `Row ${r + 1} has ${data.rows[r].length} cells, but header has ${colCount} columns`,
        });
      }
    }
  });

export const TableBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('table'),
  data: TableBlockDataSchema,
});

// 8. Callout Block
export const CalloutBlockDataSchema = z.object({
  type: z.enum(CALLOUT_TYPES),
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  text: z.string().min(1, 'Callout text cannot be empty').max(2000, 'Callout text cannot exceed 2000 characters'),
});

export const CalloutBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('callout'),
  data: CalloutBlockDataSchema,
});

// 9. Quote Block
export const QuoteBlockDataSchema = z.object({
  text: z.string().min(1, 'Quote text cannot be empty').max(1000, 'Quote text cannot exceed 1000 characters'),
  author: z.string().max(100, 'Author cannot exceed 100 characters').optional(),
  citationUrl: z.string().url('Citation URL must be a valid URL').max(255).optional(),
});

export const QuoteBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('quote'),
  data: QuoteBlockDataSchema,
});

// 10. Divider Block
export const DividerBlockDataSchema = z.object({}).strict();

export const DividerBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('divider'),
  data: DividerBlockDataSchema,
});

// 11. Downloadable File Block
export const DownloadableFileBlockDataSchema = z.object({
  storageKey: StorageKeySchema,
  title: z.string().min(1, 'File title cannot be empty').max(150, 'File title cannot exceed 150 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  sizeBytes: z
    .number()
    .int('File size must be an integer')
    .positive('File size must be greater than zero')
    .max(500 * 1024 * 1024, 'Downloadable file cannot exceed 500 MB'),
});

export const DownloadableFileBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('downloadableFile'),
  data: DownloadableFileBlockDataSchema,
});

// 12. List Block
export const ListBlockDataSchema = z.object({
  format: z.enum(LIST_FORMATS),
  items: z
    .array(z.string().min(1, 'List item cannot be empty').max(500, 'List item cannot exceed 500 characters'))
    .min(1, 'List must contain at least 1 item')
    .max(50, 'List cannot exceed 50 items'),
});

export const ListBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('list'),
  data: ListBlockDataSchema,
});

// 13. Interactive Example Block
export const InteractiveExampleBlockSchema = z.object({
  id: BlockIdSchema,
  version: ContentBlockVersionSchema,
  type: z.literal('interactiveExample'),
  data: InteractiveExampleDataSchema,
});

// Master Discriminated Union
export const ContentBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  RichTextBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  TableBlockSchema,
  CalloutBlockSchema,
  QuoteBlockSchema,
  DividerBlockSchema,
  DownloadableFileBlockSchema,
  ListBlockSchema,
  InteractiveExampleBlockSchema,
]);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;
export type ParagraphBlock = z.infer<typeof ParagraphBlockSchema>;
export type RichTextBlock = z.infer<typeof RichTextBlockSchema>;
export type CodeBlock = z.infer<typeof CodeBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type VideoBlock = z.infer<typeof VideoBlockSchema>;
export type TableBlock = z.infer<typeof TableBlockSchema>;
export type CalloutBlock = z.infer<typeof CalloutBlockSchema>;
export type QuoteBlock = z.infer<typeof QuoteBlockSchema>;
export type DividerBlock = z.infer<typeof DividerBlockSchema>;
export type DownloadableFileBlock = z.infer<typeof DownloadableFileBlockSchema>;
export type ListBlock = z.infer<typeof ListBlockSchema>;
export type InteractiveExampleBlock = z.infer<typeof InteractiveExampleBlockSchema>;

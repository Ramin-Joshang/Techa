import { Schema } from 'mongoose';
import {
  CODE_LANGUAGES,
  CALLOUT_TYPES,
  LIST_FORMATS,
  INTERACTIVE_ENVIRONMENTS,
  INTERACTIVE_PRESETS,
} from '@techa/shared';

// Base content block schema with discriminator key 'type'
export const BaseContentBlockSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      match: [/^blk_[a-zA-Z0-9_-]{8,32}$/, 'Invalid block ID format'],
    },
    version: {
      type: Number,
      required: true,
      enum: [1],
      default: 1,
    },
  },
  {
    discriminatorKey: 'type',
    _id: false,
  }
);

// 1. Heading
const HeadingBlockDataSchema = new Schema(
  {
    level: { type: Number, required: true, enum: [2, 3, 4] },
    text: { type: String, required: true, minlength: 1, maxlength: 250 },
  },
  { _id: false }
);
export const HeadingBlockSchema = new Schema(
  { data: { type: HeadingBlockDataSchema, required: true } },
  { _id: false }
);

// 2. Paragraph
const ParagraphBlockDataSchema = new Schema(
  {
    text: { type: String, required: true, minlength: 1, maxlength: 5000 },
  },
  { _id: false }
);
export const ParagraphBlockSchema = new Schema(
  { data: { type: ParagraphBlockDataSchema, required: true } },
  { _id: false }
);

// 3. RichText
const RichTextLinkSchema = new Schema(
  {
    url: { type: String, required: true },
    openInNewTab: { type: Boolean, default: false },
  },
  { _id: false }
);

const RichTextSpanSchema = new Schema(
  {
    text: { type: String, required: true, minlength: 1, maxlength: 1000 },
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    code: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    strikethrough: { type: Boolean, default: false },
    link: { type: RichTextLinkSchema, default: undefined },
  },
  { _id: false }
);

const RichTextBlockDataSchema = new Schema(
  {
    spans: {
      type: [RichTextSpanSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length >= 1 && v.length <= 100,
        message: 'RichText spans must be between 1 and 100 items',
      },
    },
  },
  { _id: false }
);
export const RichTextBlockSchema = new Schema(
  { data: { type: RichTextBlockDataSchema, required: true } },
  { _id: false }
);

// 4. CodeBlock
const CodeBlockDataSchema = new Schema(
  {
    code: { type: String, required: true, maxlength: 50000 },
    language: { type: String, required: true, enum: CODE_LANGUAGES },
    title: { type: String, maxlength: 100 },
    showLineNumbers: { type: Boolean, default: true },
  },
  { _id: false }
);
export const CodeBlockSchema = new Schema(
  { data: { type: CodeBlockDataSchema, required: true } },
  { _id: false }
);

// 5. Image
const ImageBlockDataSchema = new Schema(
  {
    storageKey: { type: String, required: true, minlength: 3, maxlength: 200 },
    altText: { type: String, required: true, minlength: 1, maxlength: 200 },
    caption: { type: String, maxlength: 300 },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);
export const ImageBlockSchema = new Schema(
  { data: { type: ImageBlockDataSchema, required: true } },
  { _id: false }
);

// 6. Video
const VideoBlockDataSchema = new Schema(
  {
    storageKey: { type: String, required: true, minlength: 3, maxlength: 200 },
    posterStorageKey: { type: String, maxlength: 200 },
    caption: { type: String, maxlength: 300 },
    durationSeconds: { type: Number },
  },
  { _id: false }
);
export const VideoBlockSchema = new Schema(
  { data: { type: VideoBlockDataSchema, required: true } },
  { _id: false }
);

// 7. Table
const TableBlockDataSchema = new Schema(
  {
    headers: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1 && v.length <= 10,
        message: 'Table headers must contain between 1 and 10 columns',
      },
    },
    rows: {
      type: [[String]],
      required: true,
      validate: {
        validator: function (this: unknown, rows: string[][]) {
          if (!Array.isArray(rows) || rows.length < 1 || rows.length > 100) return false;
          const context = this as { headers?: string[] };
          const colCount = context?.headers ? context.headers.length : 0;
          return rows.every((row) => Array.isArray(row) && (colCount === 0 || row.length === colCount));
        },
        message: 'Every table row must contain exactly the same number of cells as the header',
      },
    },
  },
  { _id: false }
);
export const TableBlockSchema = new Schema(
  { data: { type: TableBlockDataSchema, required: true } },
  { _id: false }
);

// 8. Callout
const CalloutBlockDataSchema = new Schema(
  {
    type: { type: String, required: true, enum: CALLOUT_TYPES },
    title: { type: String, maxlength: 100 },
    text: { type: String, required: true, minlength: 1, maxlength: 2000 },
  },
  { _id: false }
);
export const CalloutBlockSchema = new Schema(
  { data: { type: CalloutBlockDataSchema, required: true } },
  { _id: false }
);

// 9. Quote
const QuoteBlockDataSchema = new Schema(
  {
    text: { type: String, required: true, minlength: 1, maxlength: 1000 },
    author: { type: String, maxlength: 100 },
    citationUrl: { type: String, maxlength: 255 },
  },
  { _id: false }
);
export const QuoteBlockSchema = new Schema(
  { data: { type: QuoteBlockDataSchema, required: true } },
  { _id: false }
);

// 10. Divider
const DividerBlockDataSchema = new Schema({}, { _id: false, strict: true });
export const DividerBlockSchema = new Schema(
  { data: { type: DividerBlockDataSchema, required: true, default: () => ({}) } },
  { _id: false }
);

// 11. DownloadableFile
const DownloadableFileBlockDataSchema = new Schema(
  {
    storageKey: { type: String, required: true, minlength: 3, maxlength: 200 },
    title: { type: String, required: true, minlength: 1, maxlength: 150 },
    description: { type: String, maxlength: 500 },
    sizeBytes: { type: Number, required: true, min: 1, max: 500 * 1024 * 1024 },
  },
  { _id: false }
);
export const DownloadableFileBlockSchema = new Schema(
  { data: { type: DownloadableFileBlockDataSchema, required: true } },
  { _id: false }
);

// 12. List
const ListBlockDataSchema = new Schema(
  {
    format: { type: String, required: true, enum: LIST_FORMATS },
    items: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1 && v.length <= 50,
        message: 'List items must contain between 1 and 50 entries',
      },
    },
  },
  { _id: false }
);
export const ListBlockSchema = new Schema(
  { data: { type: ListBlockDataSchema, required: true } },
  { _id: false }
);

// 13. InteractiveExample
const InteractiveFileSubSchema = new Schema(
  {
    path: { type: String, required: true, maxlength: 150 },
    language: { type: String, required: true, enum: ['javascript', 'typescript', 'html', 'css', 'json'] },
    content: { type: String, required: true, maxlength: 50000 },
    entryPoint: { type: Boolean, required: true },
    readOnly: { type: Boolean, default: false },
  },
  { _id: false }
);

const InteractiveExampleBlockDataSchema = new Schema(
  {
    environment: { type: String, required: true, enum: INTERACTIVE_ENVIRONMENTS },
    preset: { type: String, required: true, enum: INTERACTIVE_PRESETS },
    title: { type: String, required: true, minlength: 1, maxlength: 150 },
    description: { type: String, maxlength: 500 },
    files: {
      type: [InteractiveFileSubSchema],
      required: true,
      validate: {
        validator: (files: unknown[]) =>
          Array.isArray(files) &&
          files.length >= 1 &&
          files.length <= 10 &&
          (files as Array<{ entryPoint?: boolean }>).filter((f) => f.entryPoint).length === 1,
        message: 'Interactive files must be 1 to 10 files with exactly 1 entryPoint',
      },
    },
  },
  { _id: false }
);
export const InteractiveExampleBlockSchema = new Schema(
  { data: { type: InteractiveExampleBlockDataSchema, required: true } },
  { _id: false }
);

/**
 * Register all 13 subdocument discriminators onto a document array schema
 */
export function registerContentBlockDiscriminators(
  contentBlocksArray: Schema.Types.DocumentArray
): void {
  contentBlocksArray.discriminator('heading', HeadingBlockSchema);
  contentBlocksArray.discriminator('paragraph', ParagraphBlockSchema);
  contentBlocksArray.discriminator('richText', RichTextBlockSchema);
  contentBlocksArray.discriminator('codeBlock', CodeBlockSchema);
  contentBlocksArray.discriminator('image', ImageBlockSchema);
  contentBlocksArray.discriminator('video', VideoBlockSchema);
  contentBlocksArray.discriminator('table', TableBlockSchema);
  contentBlocksArray.discriminator('callout', CalloutBlockSchema);
  contentBlocksArray.discriminator('quote', QuoteBlockSchema);
  contentBlocksArray.discriminator('divider', DividerBlockSchema);
  contentBlocksArray.discriminator('downloadableFile', DownloadableFileBlockSchema);
  contentBlocksArray.discriminator('list', ListBlockSchema);
  contentBlocksArray.discriminator('interactiveExample', InteractiveExampleBlockSchema);
}

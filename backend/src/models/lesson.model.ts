import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import { PublicationStatus, PUBLICATION_STATUSES, ContentBlock } from '@techa/shared';
import {
  BaseContentBlockSchema,
  registerContentBlockDiscriminators,
} from './content-block.schema';

export interface LessonRaw {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  chapterId: Types.ObjectId;
  title: string;
  slug: string;
  order: number;
  readingTimeMinutes: number;
  contentSchemaVersion: 1;
  contentBlocks: ContentBlock[];
  status: PublicationStatus;
  version: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrlOverride?: string;
    ogImageStorageKey?: string;
  };
  publishedAt?: Date | null;
  lastPublishedAt?: Date | null;
  archivedAt?: Date | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LessonDocument = HydratedDocument<LessonRaw>;

const LessonSeoSchema = new Schema(
  {
    metaTitle: { type: String, required: true, minlength: 1, maxlength: 100 },
    metaDescription: { type: String, required: true, minlength: 1, maxlength: 300 },
    canonicalUrlOverride: { type: String, maxlength: 255 },
    ogImageStorageKey: { type: String, maxlength: 200 },
  },
  { _id: false }
);

export const LessonSchema = new Schema<LessonRaw>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    },
    order: { type: Number, required: true, default: 0, min: 0 },
    readingTimeMinutes: { type: Number, required: true, default: 1, min: 1 },
    contentSchemaVersion: { type: Number, required: true, enum: [1], default: 1 },
    contentBlocks: {
      type: [BaseContentBlockSchema],
      default: [],
    },
    status: { type: String, required: true, enum: PUBLICATION_STATUSES, default: 'draft' },
    version: { type: Number, required: true, default: 1, min: 1 },
    seo: { type: LessonSeoSchema, required: true },
    publishedAt: { type: Date, default: null },
    lastPublishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    collection: 'lessons',
    timestamps: true,
  }
);

// Register embedded discriminators for all 13 block types with explicit schemas
const contentBlocksPath = LessonSchema.path('contentBlocks') as Schema.Types.DocumentArray;
registerContentBlockDiscriminators(contentBlocksPath);

// Indexes:
// 1. Lesson lookup by courseId + slug (unique)
LessonSchema.index({ courseId: 1, slug: 1 }, { unique: true });

// 2. Published lessons for a course, ordered by order
LessonSchema.index({ courseId: 1, status: 1, order: 1 });

// 3. Published lessons for a chapter, ordered by order
LessonSchema.index({ chapterId: 1, status: 1, order: 1 });

// 4. Admin lesson ordering & status indexes
LessonSchema.index({ chapterId: 1, order: 1 });
LessonSchema.index({ status: 1 });

export const LessonModel: Model<LessonRaw> = model<LessonRaw>('Lesson', LessonSchema);

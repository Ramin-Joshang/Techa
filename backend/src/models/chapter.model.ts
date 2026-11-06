import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import { PublicationStatus, PUBLICATION_STATUSES } from '@techa/shared';

export interface ChapterRaw {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  slug: string;
  summary?: string;
  order: number;
  status: PublicationStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ChapterDocument = HydratedDocument<ChapterRaw>;

export const ChapterSchema = new Schema<ChapterRaw>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
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
    summary: { type: String, trim: true, maxlength: 300 },
    order: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, required: true, enum: PUBLICATION_STATUSES, default: 'draft' },
    publishedAt: { type: Date, default: null },
  },
  {
    collection: 'chapters',
    timestamps: true,
  }
);

// Indexes:
// 1. Chapter lookup by courseId + slug (unique)
ChapterSchema.index({ courseId: 1, slug: 1 }, { unique: true });

// 2. Published chapters by courseId, ordered by order
ChapterSchema.index({ courseId: 1, status: 1, order: 1 });

export const ChapterModel: Model<ChapterRaw> = model<ChapterRaw>('Chapter', ChapterSchema);

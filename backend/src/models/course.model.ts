import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import {
  CourseLevel,
  COURSE_LEVELS,
  PublicationStatus,
  PUBLICATION_STATUSES,
} from '@techa/shared';

export interface CourseRaw {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: CourseLevel;
  icon:
    | { kind: 'system'; name: string }
    | { kind: 'media'; storageKey: string };
  coverStorageKey?: string;
  tags: string[];
  prerequisites: string[];
  targetAudience: string[];
  order: number;
  status: PublicationStatus;
  stats: {
    totalChapters: number;
    totalLessons: number;
    estimatedReadingTimeMinutes: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrlOverride?: string;
    ogImageStorageKey?: string;
  };
  publishedAt?: Date | null;
  lastPublishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseDocument = HydratedDocument<CourseRaw>;

const CourseIconSchema = new Schema(
  {
    kind: { type: String, required: true, enum: ['system', 'media'] },
    name: {
      type: String,
      required: function (this: { kind?: string }) {
        return this.kind === 'system';
      },
    },
    storageKey: {
      type: String,
      required: function (this: { kind?: string }) {
        return this.kind === 'media';
      },
    },
  },
  { _id: false }
);

const CourseStatsSchema = new Schema(
  {
    totalChapters: { type: Number, required: true, default: 0, min: 0 },
    totalLessons: { type: Number, required: true, default: 0, min: 0 },
    estimatedReadingTimeMinutes: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const CourseSeoSchema = new Schema(
  {
    metaTitle: { type: String, required: true, minlength: 1, maxlength: 100 },
    metaDescription: { type: String, required: true, minlength: 1, maxlength: 300 },
    canonicalUrlOverride: { type: String, maxlength: 255 },
    ogImageStorageKey: { type: String, maxlength: 200 },
  },
  { _id: false }
);

export const CourseSchema = new Schema<CourseRaw>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 },
    summary: { type: String, required: true, trim: true, minlength: 1, maxlength: 300 },
    description: { type: String, required: true, trim: true, minlength: 1, maxlength: 5000 },
    level: { type: String, required: true, enum: COURSE_LEVELS },
    icon: { type: CourseIconSchema, required: true },
    coverStorageKey: { type: String, trim: true },
    tags: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    targetAudience: { type: [String], default: [] },
    order: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, required: true, enum: PUBLICATION_STATUSES, default: 'draft' },
    stats: { type: CourseStatsSchema, required: true, default: () => ({}) },
    seo: { type: CourseSeoSchema, required: true },
    publishedAt: { type: Date, default: null },
    lastPublishedAt: { type: Date, default: null },
  },
  {
    collection: 'courses',
    timestamps: true,
  }
);

// Indexes:
// 1. Published courses ordered by `order`
CourseSchema.index({ status: 1, order: 1 });

// 2. Published courses filtered by tags and ordered by `order`
CourseSchema.index({ status: 1, tags: 1, order: 1 });

export const CourseModel: Model<CourseRaw> = model<CourseRaw>('Course', CourseSchema);

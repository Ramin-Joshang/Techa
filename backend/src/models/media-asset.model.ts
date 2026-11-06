import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import { MediaCategory, MEDIA_CATEGORIES } from '@techa/shared';

export interface MediaAssetRaw {
  _id: Types.ObjectId;
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  checksumSha256?: string;
  category: MediaCategory;
  altText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaAssetDocument = HydratedDocument<MediaAssetRaw>;

export const MediaAssetSchema = new Schema<MediaAssetRaw>(
  {
    storageKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    checksumSha256: {
      type: String,
      match: [/^[0-9a-fA-F]{64}$/, 'Invalid SHA-256 checksum format'],
    },
    category: {
      type: String,
      required: true,
      enum: MEDIA_CATEGORIES,
    },
    altText: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    collection: 'media_assets',
    timestamps: true,
  }
);

// Indexes:
// 1. MediaAsset lookup by unique storageKey
// (storageKey has unique: true in schema definition, which creates unique index)

// 2. Querying media assets by category
MediaAssetSchema.index({ category: 1 });

export const MediaAssetModel: Model<MediaAssetRaw> = model<MediaAssetRaw>(
  'MediaAsset',
  MediaAssetSchema
);

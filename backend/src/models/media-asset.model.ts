import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import {
  MediaCategory,
  MEDIA_CATEGORIES,
  MediaStatus,
  MEDIA_STATUSES,
  MediaType,
  MEDIA_TYPES,
  MediaVisibility,
  MEDIA_VISIBILITIES,
} from '@techa/shared';

export interface MediaAssetRaw {
  _id: Types.ObjectId;
  storageKey: string;
  safeFilename?: string;
  originalFileName: string;
  mimeType: string;
  mediaType: MediaType;
  sizeBytes: number;
  width?: number;
  height?: number;
  checksumSha256?: string;
  category: MediaCategory;
  storageProvider: 'local';
  visibility: MediaVisibility;
  status: MediaStatus;
  altText?: string;
  uploadedBy?: Types.ObjectId | null;
  archivedAt?: Date | null;
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
    safeFilename: {
      type: String,
      trim: true,
      maxlength: 255,
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
    mediaType: {
      type: String,
      required: true,
      enum: MEDIA_TYPES,
      default: 'image',
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
    storageProvider: {
      type: String,
      enum: ['local'],
      default: 'local',
    },
    visibility: {
      type: String,
      enum: MEDIA_VISIBILITIES,
      default: 'public',
    },
    status: {
      type: String,
      enum: MEDIA_STATUSES,
      default: 'ready',
    },
    altText: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'media_assets',
    timestamps: true,
  }
);

MediaAssetSchema.index({ category: 1 });
MediaAssetSchema.index({ status: 1, category: 1, createdAt: -1 });
MediaAssetSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaAssetSchema.index({ checksumSha256: 1 });

export const MediaAssetModel: Model<MediaAssetRaw> = model<MediaAssetRaw>(
  'MediaAsset',
  MediaAssetSchema
);

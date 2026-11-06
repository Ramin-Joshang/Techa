import { z } from 'zod';
import {
  ObjectIdSchema,
  StorageKeySchema,
  MediaCategorySchema,
} from './primitives.schema';

export const MediaAssetSchema = z.object({
  id: ObjectIdSchema.optional(),
  storageKey: StorageKeySchema,
  originalFileName: z.string().min(1, 'Original file name cannot be empty').max(255, 'File name cannot exceed 255 characters'),
  mimeType: z
    .string()
    .min(3, 'MIME type cannot be empty')
    .max(100, 'MIME type cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/, 'Invalid MIME type format'),
  sizeBytes: z.number().int().positive('Size must be a positive integer'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  checksumSha256: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'Checksum must be a 64-character SHA-256 hexadecimal string')
    .optional(),
  category: MediaCategorySchema,
  altText: z.string().max(200, 'Alt text cannot exceed 200 characters').optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateMediaAssetDtoSchema = z.object({
  storageKey: StorageKeySchema,
  originalFileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  checksumSha256: z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
  category: MediaCategorySchema,
  altText: z.string().max(200).optional(),
});

export const UpdateMediaAssetDtoSchema = CreateMediaAssetDtoSchema.partial().omit({
  storageKey: true,
});

export const MediaAssetPublicDtoSchema = z.object({
  id: ObjectIdSchema,
  storageKey: StorageKeySchema,
  originalFileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  category: MediaCategorySchema,
  altText: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type CreateMediaAssetDto = z.input<typeof CreateMediaAssetDtoSchema>;
export type UpdateMediaAssetDto = z.input<typeof UpdateMediaAssetDtoSchema>;
export type MediaAssetPublicDto = z.infer<typeof MediaAssetPublicDtoSchema>;

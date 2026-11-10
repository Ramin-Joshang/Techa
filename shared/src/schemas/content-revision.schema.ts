import { z } from 'zod';
import { RevisionResourceTypeSchema, ObjectIdSchema } from './primitives.schema';

export const ContentRevisionSchema = z.object({
  id: ObjectIdSchema.optional(),
  resourceType: RevisionResourceTypeSchema,
  resourceId: z.string().min(1).max(100),
  revisionNumber: z.number().int().positive(),
  changeSummary: z.string().min(1).max(500),
  contentHash: z.string().length(64, 'Content hash must be 64-char SHA-256 hex string'),
  snapshotJson: z.string().min(2, 'Snapshot JSON cannot be empty').max(500000, 'Snapshot payload cannot exceed 500KB'),
  createdBy: ObjectIdSchema.nullable().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});

export const CreateContentRevisionDtoSchema = ContentRevisionSchema.omit({
  id: true,
  createdAt: true,
});

export type ContentRevision = z.infer<typeof ContentRevisionSchema>;
export type CreateContentRevisionDto = z.infer<typeof CreateContentRevisionDtoSchema>;

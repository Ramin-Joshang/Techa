import { z } from 'zod';
import { AuditActionSchema, AuditResultSchema, ObjectIdSchema } from './primitives.schema';

export const AdminAuditLogSchema = z.object({
  id: ObjectIdSchema.optional(),
  actorUserId: ObjectIdSchema.nullable().optional(),
  actorRole: z.string().min(1).max(50),
  action: AuditActionSchema,
  resourceType: z.string().min(1).max(50),
  resourceId: z.string().min(1).max(100),
  result: AuditResultSchema.default('success'),
  requestId: z.string().min(1).max(100),
  changedFields: z.array(z.string().min(1).max(50)).max(50).default([]),
  changeSummary: z.string().min(1).max(500),
  ipHash: z.string().max(64).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});

export const CreateAdminAuditLogDtoSchema = AdminAuditLogSchema.omit({
  id: true,
  createdAt: true,
});

export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>;
export type CreateAdminAuditLogDto = z.infer<typeof CreateAdminAuditLogDtoSchema>;

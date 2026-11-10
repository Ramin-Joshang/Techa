import { z } from 'zod';
import { ObjectIdSchema } from './primitives.schema';

export const AuthSessionSchema = z.object({
  id: ObjectIdSchema.optional(),
  userId: ObjectIdSchema,
  tokenHash: z.string().length(64, 'Token hash must be 64-char SHA-256 hex string'),
  familyId: z.string().uuid('Family ID must be a valid UUID for session rotation tracking'),
  jti: z.string().uuid('JTI must be a valid UUID'),
  expiresAt: z.string().datetime(),
  issuedAt: z.string().datetime().default(() => new Date().toISOString()),
  lastUsedAt: z.string().datetime().default(() => new Date().toISOString()),
  revokedAt: z.string().datetime().nullable().optional(),
  revokeReason: z.string().max(200).nullable().optional(),
  replacedBySessionId: ObjectIdSchema.nullable().optional(),
  ipHash: z.string().max(64).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

export const CreateAuthSessionDtoSchema = AuthSessionSchema.omit({
  id: true,
  createdAt: true,
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type CreateAuthSessionDto = z.infer<typeof CreateAuthSessionDtoSchema>;

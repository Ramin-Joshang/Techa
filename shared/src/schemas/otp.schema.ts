import { z } from 'zod';
import {
  PhoneE164Schema,
  OtpPurposeSchema,
  OtpStatusSchema,
  ObjectIdSchema,
} from './primitives.schema';

export const OtpChallengeSchema = z.object({
  id: ObjectIdSchema.optional(),
  phoneE164: PhoneE164Schema,
  userId: ObjectIdSchema.nullable().optional(),
  purpose: OtpPurposeSchema,
  codeDigest: z.string().length(64, 'OTP digest must be 64-char HMAC-SHA256 hex string'),
  digestKeyVersion: z.number().int().positive().default(1),
  provider: z.literal('kavenegar').default('kavenegar'),
  providerMessageId: z.string().max(100).nullable().optional(),
  status: OtpStatusSchema.default('pending'),
  attemptCount: z.number().int().nonnegative().default(0),
  maxAttempts: z.number().int().positive().default(5),
  expiresAt: z.string().datetime(),
  sentAt: z.string().datetime().default(() => new Date().toISOString()),
  consumedAt: z.string().datetime().nullable().optional(),
  resendAvailableAt: z.string().datetime(),
  invalidatedAt: z.string().datetime().nullable().optional(),
  ipHash: z.string().max(64).nullable().optional(),
  createdAt: z.string().datetime().optional(),
});

export const CreateOtpChallengeDtoSchema = OtpChallengeSchema.omit({
  id: true,
  status: true,
  attemptCount: true,
  consumedAt: true,
  invalidatedAt: true,
  createdAt: true,
});

export type OtpChallenge = z.infer<typeof OtpChallengeSchema>;
export type CreateOtpChallengeDto = z.infer<typeof CreateOtpChallengeDtoSchema>;

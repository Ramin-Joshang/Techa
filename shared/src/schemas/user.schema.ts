import { z } from 'zod';
import {
  PhoneE164Schema,
  UserRoleSchema,
  AccountStatusSchema,
  ObjectIdSchema,
} from './primitives.schema';

export const UserSchema = z.object({
  id: ObjectIdSchema.optional(),
  phoneE164: PhoneE164Schema,
  phoneVerifiedAt: z.string().datetime().nullable().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  passwordHash: z.string().min(20, 'Password hash is required and must be properly formatted'),
  passwordChangedAt: z.string().datetime().optional(),
  roles: z.array(UserRoleSchema).min(1, 'User must have at least one role').default(['student']),
  status: AccountStatusSchema.default('pending_verification'),
  failedLoginCount: z.number().int().nonnegative().default(0),
  lockedUntil: z.string().datetime().nullable().optional(),
  lastLoginAt: z.string().datetime().nullable().optional(),
  lastPasswordResetAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateUserDtoSchema = z.object({
  phoneE164: PhoneE164Schema,
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  passwordHash: z.string().min(20),
  roles: z.array(UserRoleSchema).default(['student']),
});

export const UserPublicProfileDtoSchema = z.object({
  id: ObjectIdSchema,
  phoneE164: PhoneE164Schema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(UserRoleSchema),
  status: AccountStatusSchema,
  createdAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
export type UserPublicProfileDto = z.infer<typeof UserPublicProfileDtoSchema>;

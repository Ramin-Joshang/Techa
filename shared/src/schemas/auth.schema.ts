import { z } from 'zod';
import {
  ObjectIdSchema,
  PhoneE164Schema,
  UserRoleSchema,
  AccountStatusSchema,
} from './primitives.schema';

export const PasswordSchema = z
  .string()
  .min(12, 'رمز عبور باید حداقل ۱۲ کاراکتر باشد')
  .max(128, 'رمز عبور نمی‌تواند بیش از ۱۲۸ کاراکتر باشد');

// 1. Register DTOs
export const RegisterRequestSchema = z
  .object({
    phone: z.string().min(10, 'شماره موبایل وارد شده معتبر نیست').max(20),
    firstName: z.string().trim().min(2, 'نام باید حداقل ۲ کاراکتر باشد').max(50, 'نام نمی‌تواند بیش از ۵۰ کاراکتر باشد'),
    lastName: z.string().trim().max(50, 'نام خانوادگی نمی‌تواند بیش از ۵۰ کاراکتر باشد').optional().nullable(),
    password: PasswordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

export const RegisterResponseSchema = z.object({
  id: ObjectIdSchema,
  phoneE164: PhoneE164Schema,
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  status: z.literal('pending_verification'),
  message: z.string(),
});

// 2. Login DTOs
export const LoginRequestSchema = z.object({
  phone: z.string().min(10, 'شماره موبایل معتبر نیست').max(20),
  password: z.string().min(1, 'رمز عبور الزامی است').max(128),
});

// 3. User Safe Public Profile for Auth Context
export const AuthUserSchema = z.object({
  id: ObjectIdSchema,
  phoneE164: PhoneE164Schema,
  phoneMasked: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  roles: z.array(UserRoleSchema),
  status: AccountStatusSchema,
  phoneVerified: z.boolean(),
  createdAt: z.string(),
  lastLoginAt: z.string().nullable().optional(),
});

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  message: z.string(),
});

// 4. Session Item DTO
export const SessionItemSchema = z.object({
  id: ObjectIdSchema,
  createdAt: z.string(),
  lastUsedAt: z.string().nullable().optional(),
  expiresAt: z.string(),
  userAgent: z.string().nullable().optional(),
  isCurrent: z.boolean(),
});

export const SessionsListResponseSchema = z.object({
  sessions: z.array(SessionItemSchema),
});

// 5. Change Password DTO
export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
    newPassword: PasswordSchema,
    confirmNewPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmNewPassword || data.newPassword === data.confirmNewPassword, {
    message: 'رمز عبور جدید و تکرار آن یکسان نیستند',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'رمز عبور جدید نمی‌تواند مشابه رمز عبور فعلی باشد',
    path: ['newPassword'],
  });

// Types
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SessionItem = z.infer<typeof SessionItemSchema>;
export type SessionsListResponse = z.infer<typeof SessionsListResponseSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

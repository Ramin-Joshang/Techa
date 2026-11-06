import { z } from 'zod';

export const ApiMetaSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  total: z.number().int().nonnegative().optional(),
  timestamp: z.string().optional(),
});

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number().int(),
    data: dataSchema,
    message: z.string().optional(),
    meta: ApiMetaSchema.optional(),
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number().int(),
  error: ApiErrorDetailSchema,
});

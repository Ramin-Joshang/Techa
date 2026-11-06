import { z } from 'zod';
import {
  ApiMetaSchema,
  ApiErrorDetailSchema,
  ApiErrorResponseSchema,
} from '../schemas/api.schema';
import {
  LivenessResponseSchema,
  ReadinessResponseSchema,
} from '../schemas/health.schema';

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  message?: string;
  meta?: z.infer<typeof ApiMetaSchema>;
}

export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type LivenessResponse = z.infer<typeof LivenessResponseSchema>;
export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;

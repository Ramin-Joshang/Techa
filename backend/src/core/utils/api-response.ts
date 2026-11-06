import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '@techa/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp?: string;
  }
): Response {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    statusCode,
    data,
    ...(message ? { message } : {}),
    ...(meta ? { meta } : {}),
  };

  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    statusCode,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };

  return res.status(statusCode).json(payload);
}

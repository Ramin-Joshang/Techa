import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '@techa/shared';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SuccessMeta {
  requestId?: string;
  pagination?: PaginationMeta;
  page?: number;
  limit?: number;
  total?: number;
  timestamp?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
  meta?: SuccessMeta
): Response {
  const reqId = meta?.requestId || (res.req?.id ? String(res.req.id) : undefined);

  const finalMeta: SuccessMeta = {
    ...(reqId ? { requestId: reqId } : {}),
    timestamp: meta?.timestamp || new Date().toISOString(),
    ...meta,
  };

  // If pagination is present, ensure compatibility fields exist
  if (meta?.pagination) {
    finalMeta.page = meta.pagination.page;
    finalMeta.limit = meta.pagination.limit;
    finalMeta.total = meta.pagination.totalItems;
  }

  const payload: ApiSuccessResponse<T> = {
    success: true,
    statusCode,
    data,
    ...(message ? { message } : {}),
    meta: finalMeta,
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
  const reqId = requestId || (res.req?.id ? String(res.req.id) : undefined);

  const payload: ApiErrorResponse = {
    success: false,
    statusCode,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(reqId ? { requestId: reqId } : {}),
    },
    meta: {
      ...(reqId ? { requestId: reqId } : {}),
    },
  };

  return res.status(statusCode).json(payload);
}

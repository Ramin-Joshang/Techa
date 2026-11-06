import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import { sendError } from '../utils/api-response';
import { logger } from '../logger/logger';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const reqId = req.id ? String(req.id) : undefined;

  // 1. Domain AppError
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, reqId }, `[AppError] Non-operational error: ${err.message}`);
    } else {
      logger.warn({ code: err.code, message: err.message, reqId }, `[AppError] Operational error`);
    }

    sendError(res, err.statusCode, err.code, err.message, err.details, reqId);
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    logger.warn({ issues: err.issues, reqId }, '[ValidationError] Zod validation failed');
    sendError(
      res,
      422,
      'VALIDATION_ERROR',
      'Request input validation failed',
      err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      })),
      reqId
    );
    return;
  }

  // 3. Body-parser JSON Syntax Error
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 400 && err instanceof SyntaxError) {
    logger.warn({ err, reqId }, '[SyntaxError] Malformed JSON in request body');
    sendError(res, 400, 'MALFORMED_JSON', 'Malformed JSON in request body', undefined, reqId);
    return;
  }

  // 4. Mongoose specific errors
  if (err && typeof err === 'object' && 'name' in err) {
    const errorName = (err as { name: string }).name;

    if (errorName === 'CastError') {
      sendError(res, 400, 'INVALID_IDENTIFIER', 'Invalid resource identifier format', undefined, reqId);
      return;
    }

    if (errorName === 'ValidationError') {
      sendError(res, 422, 'DATABASE_VALIDATION_ERROR', 'Database validation constraint failed', undefined, reqId);
      return;
    }
  }

  // 5. Unexpected / Unhandled Error
  logger.error({ err, reqId }, '[ErrorHandler] Unhandled internal error');

  const message = env.NODE_ENV === 'production'
    ? 'Internal server error occurred'
    : err instanceof Error ? err.message : 'Unknown server error';

  const details = env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : undefined;

  sendError(res, 500, 'INTERNAL_SERVER_ERROR', message, details, reqId);
}

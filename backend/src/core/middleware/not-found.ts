import { Request, Response } from 'express';
import { sendError } from '../utils/api-response';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    404,
    'NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl}`,
    undefined,
    req.id ? String(req.id) : undefined
  );
}

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' && incomingId.trim().length > 0
    ? incomingId.trim()
    : randomUUID();

  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/env';
import { sendError } from '../utils/api-response';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 200 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendError(
      res,
      429,
      'TOO_MANY_REQUESTS',
      'Too many requests from this IP, please try again after 15 minutes',
      undefined,
      req.id ? String(req.id) : undefined
    );
  },
  skip: () => env.NODE_ENV === 'test',
});

import helmet from 'helmet';
import cors from 'cors';
import { RequestHandler } from 'express';
import { env } from '../config/env';

export function createSecurityMiddlewares(): RequestHandler[] {
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    maxAge: 86400,
  });

  const helmetMiddleware = helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  return [helmetMiddleware, corsMiddleware];
}

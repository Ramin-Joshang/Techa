import helmet from 'helmet';
import cors from 'cors';
import { RequestHandler } from 'express';
import { env } from '../config/env';

export function createSecurityMiddlewares(): RequestHandler[] {
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-side SSR, curl, postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit allowlist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow local development origins in development mode
      if (env.NODE_ENV === 'development' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
        return callback(null, true);
      }

      // Disallow origin (no CORS headers emitted)
      return callback(null, false);
    },
    credentials: false, // Public read-only APIs do not require cookies; avoid wildcard credentials
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    maxAge: 86400,
  });

  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", env.CANONICAL_API_URL],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  return [helmetMiddleware, corsMiddleware];
}

import express, { Express } from 'express';
import { env } from './core/config/env';
import { requestIdMiddleware } from './core/middleware/request-id';
import { requestLogger } from './core/middleware/request-logger';
import { createSecurityMiddlewares } from './core/middleware/security';
import { globalRateLimiter } from './core/middleware/rate-limiter';
import { notFoundHandler } from './core/middleware/not-found';
import { errorHandler } from './core/errors/error-handler';
import { healthRoutes } from './modules/health/health.routes';

export function createApp(): Express {
  const app = express();

  // Reverse proxy support
  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  app.disable('x-powered-by');

  // Request correlation & logging
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // Security headers & CORS
  const securityMiddlewares = createSecurityMiddlewares();
  securityMiddlewares.forEach((mw) => app.use(mw));

  // Rate limiting
  app.use(globalRateLimiter);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API v1 Routes
  app.use('/api/v1/health', healthRoutes);

  // 404 Fallback
  app.use(notFoundHandler);

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

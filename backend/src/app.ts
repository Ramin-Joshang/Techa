import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './core/config/env';
import { requestIdMiddleware } from './core/middleware/request-id';
import { requestLogger } from './core/middleware/request-logger';
import { createSecurityMiddlewares } from './core/middleware/security';
import { globalRateLimiter } from './core/middleware/rate-limiter';
import { notFoundHandler } from './core/middleware/not-found';
import { errorHandler } from './core/errors/error-handler';
import { healthRoutes } from './modules/health/health.routes';
import { publicRoutes } from './modules/public/public.routes';
import { openApiDocument } from './core/docs/openapi';
import { getLandingPageHtml } from './core/docs/landing-page';

export function createApp(): Express {
  const app = express();

  // Reverse proxy support: trust loopback or configured hops behind IIS ARR
  app.set('trust proxy', env.TRUST_PROXY_HOPS === 1 ? 'loopback' : env.TRUST_PROXY_HOPS);
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

  // 1. Root & Backend Landing Page (GET / and GET /backend)
  const landingHandler = (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(getLandingPageHtml());
  };
  app.get('/', landingHandler);
  app.get('/backend', landingHandler);

  // 2. OpenAPI & Swagger UI Documentation
  if (env.SWAGGER_ENABLED) {
    app.get('/api-docs.json', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(openApiDocument);
    });

    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, {
        customSiteTitle: 'TECHA API Documentation',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
        },
      })
    );
  }

  // 3. Health & Observability Probes
  app.get('/health', healthRoutes);
  app.use('/api/v1/health', healthRoutes);

  // 4. API v1 Public Routes
  app.use('/api/v1/public', publicRoutes);

  // 4. 404 Fallback
  app.use(notFoundHandler);

  // 5. Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

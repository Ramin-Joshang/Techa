import { app } from './app';
import { env } from './core/config/env';
import { logger } from './core/logger/logger';
import { connectToDatabase, disconnectFromDatabase } from './core/database/mongoose';

async function bootstrap(): Promise<void> {
  if (!env.MONGODB_URI && env.NODE_ENV === 'production') {
    logger.fatal('[Bootstrap] MONGODB_URI is required in production environment. Aborting startup.');
    process.exit(1);
  }

  const server = app.listen(env.API_PORT, env.API_HOST, () => {
    logger.info(
      `[Server] Backend API is running on http://${env.API_HOST}:${env.API_PORT} in ${env.NODE_ENV} mode`
    );
  });

  if (env.MONGODB_URI) {
    connectToDatabase().catch((err) => {
      logger.error({ err }, '[Bootstrap] Initial database connection failed.');
      if (env.NODE_ENV === 'production') {
        server.close(() => process.exit(1));
      }
    });
  } else {
    logger.warn('[Bootstrap] Starting server without database connection (MONGODB_URI not configured).');
  }

  const shutdown = async (signal: string) => {
    logger.info(`[Server] Received ${signal}. Initiating graceful shutdown...`);

    // Force exit timeout
    const forceExitTimer = setTimeout(() => {
      logger.error('[Server] Graceful shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000);
    forceExitTimer.unref();

    server.close(async () => {
      logger.info('[Server] HTTP server closed. Cleaning up database connections...');
      await disconnectFromDatabase();
      logger.info('[Server] Graceful shutdown completed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.fatal({ error }, '[Server] Fatal error during bootstrap');
  process.exit(1);
});

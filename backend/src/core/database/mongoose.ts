import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../logger/logger';
import { isDatabaseConnected, getDatabaseStatus } from './database-status';

export function sanitizeMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  } catch {
    return '[SANITIZED_URI]';
  }
}

let connectionPromise: Promise<typeof mongoose | null> | null = null;
let eventListenersRegistered = false;

function registerConnectionEvents(): void {
  if (eventListenersRegistered) return;
  eventListenersRegistered = true;

  mongoose.connection.on('connected', () => {
    logger.info('[Database] MongoDB connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, '[Database] MongoDB connection error occurred.');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('[Database] MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('[Database] MongoDB connection re-established.');
  });
}

export async function connectToDatabase(uriOverride?: string): Promise<typeof mongoose | null> {
  const uri = uriOverride || env.MONGODB_URI;

  if (!uri) {
    if (env.NODE_ENV === 'production') {
      throw new Error('[Database] MONGODB_URI is required in production environment.');
    }
    logger.warn('[Database] MONGODB_URI not configured. Database connection skipped in non-production mode.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Prevent duplicate concurrent connection attempts
  if (connectionPromise) {
    logger.debug('[Database] Awaiting in-flight connection attempt...');
    return connectionPromise;
  }

  const sanitized = sanitizeMongoUri(uri);
  logger.info({ uri: sanitized }, '[Database] Connecting to MongoDB Atlas...');

  registerConnectionEvents();

  connectionPromise = (async () => {
    try {
      mongoose.set('strictQuery', true);

      await mongoose.connect(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
      });

      return mongoose;
    } catch (error) {
      logger.error({ error }, '[Database] Failed to connect to MongoDB Atlas.');
      if (env.NODE_ENV === 'production') {
        throw error;
      }
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export async function disconnectFromDatabase(): Promise<void> {
  connectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    logger.info('[Database] Closing MongoDB connection...');
    try {
      await mongoose.disconnect();
      logger.info('[Database] MongoDB connection closed.');
    } catch (err) {
      logger.error({ err }, '[Database] Error while closing MongoDB connection.');
    }
  }
}

// Canonical aliases
export const connectDatabase = connectToDatabase;
export const disconnectDatabase = disconnectFromDatabase;
export { isDatabaseConnected, getDatabaseStatus };

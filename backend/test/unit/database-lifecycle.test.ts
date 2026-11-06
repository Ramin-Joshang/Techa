import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  connectToDatabase,
  disconnectFromDatabase,
  sanitizeMongoUri,
  getDatabaseStatus,
  isDatabaseConnected,
} from '../../src/core/database/mongoose';
import { env } from '../../src/core/config/env';

describe('MongoDB Connection & Lifecycle Infrastructure', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('URI Sanitization & Secret Hygiene', () => {
    it('masks credentials in MongoDB Atlas connection string', () => {
      const sensitiveUri = 'mongodb+srv://admin_user:SuperSecretPassword123@cluster0.abcde.mongodb.net/techa_db?retryWrites=true&w=majority';
      const sanitized = sanitizeMongoUri(sensitiveUri);

      expect(sanitized).not.toContain('admin_user');
      expect(sanitized).not.toContain('SuperSecretPassword123');
      expect(sanitized).toContain('//***:***@cluster0.abcde.mongodb.net');
    });

    it('masks credentials in replica set connection string with ports', () => {
      const replicaUri = 'mongodb://app_user:MyPass@host1:27017,host2:27017/?replicaSet=mySet';
      const sanitized = sanitizeMongoUri(replicaUri);

      expect(sanitized).not.toContain('app_user');
      expect(sanitized).not.toContain('MyPass');
      expect(sanitized).toContain('//***:***@host1:27017');
    });

    it('handles malformed string gracefully without crashing', () => {
      expect(sanitizeMongoUri('not-a-uri')).toBe('not-a-uri');
    });
  });

  describe('Connection Lifecycle', () => {
    it('skips connection and returns null when MONGODB_URI is omitted in non-production mode', async () => {
      const originalUri = env.MONGODB_URI;
      const originalEnv = env.NODE_ENV;
      (env as { MONGODB_URI?: string }).MONGODB_URI = undefined;
      (env as { NODE_ENV: string }).NODE_ENV = 'development';

      try {
        const result = await connectToDatabase();
        expect(result).toBeNull();
      } finally {
        (env as { MONGODB_URI?: string }).MONGODB_URI = originalUri;
        (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
      }
    });

    it('throws error when MONGODB_URI is missing in production mode', async () => {
      const originalUri = env.MONGODB_URI;
      const originalEnv = env.NODE_ENV;
      (env as { MONGODB_URI?: string }).MONGODB_URI = undefined;
      (env as { NODE_ENV: string }).NODE_ENV = 'production';

      try {
        await expect(connectToDatabase()).rejects.toThrow(/MONGODB_URI is required in production/i);
      } finally {
        (env as { MONGODB_URI?: string }).MONGODB_URI = originalUri;
        (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
      }
    });

    it('reuses existing connection when readyState === 1', async () => {
      const originalState = mongoose.connection.readyState;
      (mongoose.connection as any).readyState = 1;
      const connectSpy = vi.spyOn(mongoose, 'connect');

      try {
        const result = await connectToDatabase('mongodb://localhost:27017/test');
        expect(result).toBe(mongoose);
        expect(connectSpy).not.toHaveBeenCalled();
      } finally {
        (mongoose.connection as any).readyState = originalState;
      }
    });

    it('correctly reports database status when connected and disconnected', () => {
      const originalState = mongoose.connection.readyState;

      try {
        (mongoose.connection as any).readyState = 1;
        expect(isDatabaseConnected()).toBe(true);
        expect(getDatabaseStatus()).toBe('connected');

        (mongoose.connection as any).readyState = 0;
        expect(isDatabaseConnected()).toBe(false);
        expect(getDatabaseStatus()).toBe('disconnected');

        (mongoose.connection as any).readyState = 2; // connecting
        expect(isDatabaseConnected()).toBe(false);
        expect(getDatabaseStatus()).toBe('disconnected');
      } finally {
        (mongoose.connection as any).readyState = originalState;
      }
    });

    it('disconnectFromDatabase closes connection safely and handles errors', async () => {
      const originalState = mongoose.connection.readyState;
      (mongoose.connection as any).readyState = 1;
      const disconnectSpy = vi.spyOn(mongoose, 'disconnect').mockResolvedValue();

      try {
        await disconnectFromDatabase();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
      } finally {
        (mongoose.connection as any).readyState = originalState;
      }
    });
  });
});

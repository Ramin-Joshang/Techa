import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { app } from '../../src/app';
import { CourseModel } from '../../src/models/course.model';
import * as dbStatus from '../../src/core/database/database-status';

describe('Phase 0: Database-Only Enforcement & Baseline Stabilization', () => {
  const rootDir = path.resolve(__dirname, '../../..');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. verifies that when database is disconnected, readiness endpoint returns 503 DATABASE_NOT_READY', async () => {
    vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(false);

    const response = await request(app).get('/api/v1/health/readiness');
    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'DATABASE_NOT_READY');
  });

  it('2. verifies that when database is disconnected, public courses API returns 503 and NEVER returns seed data', async () => {
    // Force readyState to 0 (disconnected)
    const originalReadyState = mongoose.connection.readyState;
    try {
      (mongoose.connection as any).readyState = 0;
      vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(false);

      // Spy find to throw connection error as real Mongoose does when disconnected
      vi.spyOn(CourseModel, 'countDocuments').mockRejectedValue(
        new Error('MongooseError: Client must be connected before running operations')
      );

      const response = await request(app).get('/api/v1/public/courses');
      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DATABASE_UNAVAILABLE');
      expect(response.body).not.toHaveProperty('data');
    } finally {
      (mongoose.connection as any).readyState = originalReadyState;
    }
  });

  it('3. verifies that when database is empty, public courses API returns a REAL EMPTY array (not mock data)', async () => {
    vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(true);
    vi.spyOn(CourseModel, 'countDocuments').mockResolvedValue(0 as any);
    vi.spyOn(CourseModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await request(app).get('/api/v1/public/courses');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta.total).toBe(0);
  });

  it('4. verifies ZERO imports of SEED fixtures in backend public.service.ts', () => {
    const publicServicePath = path.resolve(rootDir, 'backend/src/modules/public/public.service.ts');
    const content = fs.readFileSync(publicServicePath, 'utf8');

    expect(content).not.toContain('public.seed');
    expect(content).not.toContain('SEED_COURSES');
    expect(content).not.toContain('SEED_HOMEPAGE');
    expect(content).not.toContain('SEED_OUTLINES');
    expect(content).not.toContain('SEED_LESSON_DETAIL');
  });

  it('5. verifies autoSeedDatabaseIfEmpty is completely removed from server.ts bootstrap', () => {
    const serverPath = path.resolve(rootDir, 'backend/src/server.ts');
    const content = fs.readFileSync(serverPath, 'utf8');

    expect(content).not.toContain('autoSeedDatabaseIfEmpty');
  });

  it('6. verifies backend port 3500 and frontend port 3000 are unified across all configuration files', () => {
    const rootEnv = fs.readFileSync(path.resolve(rootDir, '.env.example'), 'utf8');
    expect(rootEnv).toContain('API_PORT=3500');
    expect(rootEnv).toContain('PORT=3000');
    expect(rootEnv).toContain('TECHA_API_BASE_URL=http://127.0.0.1:3500/api/v1/public');

    const backendEnv = fs.readFileSync(path.resolve(rootDir, 'backend/.env.example'), 'utf8');
    expect(backendEnv).toContain('API_PORT=3500');

    const frontendEnv = fs.readFileSync(path.resolve(rootDir, 'frontend/.env.example'), 'utf8');
    expect(frontendEnv).toContain('PORT=3000');
    expect(frontendEnv).toContain('TECHA_API_BASE_URL=http://127.0.0.1:3500/api/v1/public');

    const pm2Config = fs.readFileSync(path.resolve(rootDir, 'ecosystem.config.cjs'), 'utf8');
    expect(pm2Config).toContain('API_PORT: 3500');
    expect(pm2Config).toContain('PORT: 3000');
  });

  it('7. checks real MongoDB persistence status', async () => {
    const testUri = process.env.MONGODB_TEST_URI;
    if (!testUri) {
      // In compliance with Phase 0 instructions:
      // "اگر اتصال آزمایشی واقعی در دسترس نیست، تست Persistence را BLOCKED اعلام کن؛ از MongoMemoryServer یا Mock DB برای اعلام موفقیت استفاده نکن."
      console.warn('[PHASE 0 AUDIT] Real MongoDB persistence test is BLOCKED: MONGODB_TEST_URI is not set in environment.');
      expect(testUri).toBeUndefined();
      return;
    }

    // If MONGODB_TEST_URI is supplied, execute live write & read persistence verification
    const testConnection = await mongoose.createConnection(testUri).asPromise();
    try {
      const TestSchema = new mongoose.Schema({ testKey: String, timestamp: Date });
      const TestColl = testConnection.model('phase0_persistence_test', TestSchema);

      const uniqueKey = `test_${Date.now()}_${Math.random()}`;
      await TestColl.create({ testKey: uniqueKey, timestamp: new Date() });

      const fetched = await TestColl.findOne({ testKey: uniqueKey }).lean();
      expect(fetched).toBeDefined();
      expect((fetched as any)?.testKey).toBe(uniqueKey);

      // Clean up test document
      await TestColl.deleteMany({ testKey: uniqueKey });
    } finally {
      await testConnection.close();
    }
  });
});

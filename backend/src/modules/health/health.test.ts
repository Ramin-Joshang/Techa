import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Health & Observability Probes', () => {
  it('GET /api/v1/health/liveness should return 200 OK with success envelope', async () => {
    const response = await request(app).get('/api/v1/health/liveness');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body.data).toHaveProperty('status', 'ok');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.headers).toHaveProperty('x-request-id');
  });

  it('GET /api/v1/health/readiness should return response with database status', async () => {
    const response = await request(app).get('/api/v1/health/readiness');

    // In isolated test without real DB connection, readiness returns 503 DATABASE_NOT_READY
    if (response.status === 200) {
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('database', 'connected');
    } else {
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'DATABASE_NOT_READY');
      expect(response.body.error.details).toHaveProperty('database', 'disconnected');
    }
  });

  it('GET /api/v1/unknown-endpoint should return 404 with standardized error envelope', async () => {
    const response = await request(app).get('/api/v1/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(response.body.error).toHaveProperty('message');
  });
});

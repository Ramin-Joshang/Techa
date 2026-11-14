import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { validateEnv } from '../../src/core/config/env';

describe('CORS, Trusted Proxy & Environment Validation', () => {
  // 1. CORS Behavior
  describe('CORS Origin Filtering & Security', () => {
    it('should set Access-Control-Allow-Origin and Vary for allowed production origin https://techa.ir', async () => {
      const res = await request(app)
        .get('/api/v1/health/liveness')
        .set('Origin', 'https://techa.ir');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://techa.ir');
      expect(res.headers['vary']).toMatch(/Origin/i);
      expect(res.headers['access-control-allow-credentials']).toBeUndefined();
    });

    it('should set Access-Control-Allow-Origin for allowed www production origin https://www.techa.ir', async () => {
      const res = await request(app)
        .get('/api/v1/health/liveness')
        .set('Origin', 'https://www.techa.ir');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://www.techa.ir');
    });

    it('should NOT set Access-Control-Allow-Origin for disallowed external origins', async () => {
      const res = await request(app)
        .get('/api/v1/health/liveness')
        .set('Origin', 'https://attacker-domain.com');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should succeed with HTTP 200 for requests without Origin header (SSR / curl)', async () => {
      const res = await request(app).get('/api/v1/health/liveness');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should handle preflight OPTIONS requests for allowed origin', async () => {
      const res = await request(app)
        .options('/api/v1/public/courses')
        .set('Origin', 'https://techa.ir')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type,x-request-id');

      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBe('https://techa.ir');
      expect(res.headers['access-control-allow-methods']).toMatch(/GET/);
    });

    it('should not allow wildcard credentials combination', async () => {
      const res = await request(app)
        .get('/api/v1/health/liveness')
        .set('Origin', 'https://techa.ir');

      // Credentials must be false, preventing wildcard credentials vulnerability
      expect(res.headers['access-control-allow-credentials']).toBeUndefined();
      expect(res.headers['access-control-allow-origin']).not.toBe('*');
    });
  });

  // 2. Typed Environment Validation
  describe('Typed Environment Validation (Zod 4)', () => {
    it('should pass with valid development defaults', () => {
      const valid = validateEnv({
        NODE_ENV: 'development',
        API_PORT: '3500',
        API_HOST: '127.0.0.1',
      });
      expect(valid.NODE_ENV).toBe('development');
      expect(valid.API_PORT).toBe(3500);
      expect(valid.API_HOST).toBe('127.0.0.1');
    });

    it('should fail fast when MONGODB_URI is missing in production mode', () => {
      expect(() => {
        validateEnv({
          NODE_ENV: 'production',
          API_PORT: '3500',
          API_HOST: '127.0.0.1',
          MONGODB_URI: '',
        });
      }).toThrow(/MONGODB_URI is strictly required in production mode/);
    });

    it('should succeed in production mode when valid MONGODB_URI is provided', () => {
      const valid = validateEnv({
        NODE_ENV: 'production',
        API_PORT: '3500',
        API_HOST: '127.0.0.1',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/techa_prod',
      });
      expect(valid.NODE_ENV).toBe('production');
      expect(valid.MONGODB_URI).toBe('mongodb+srv://user:pass@cluster.mongodb.net/techa_prod');
    });

    it('should reject invalid port numbers below 1024 or above 65535', () => {
      expect(() => {
        validateEnv({
          NODE_ENV: 'development',
          API_PORT: '80', // Below 1024 privileged port
        });
      }).toThrow(/Port must be >= 1024/);

      expect(() => {
        validateEnv({
          NODE_ENV: 'development',
          API_PORT: '70000', // Above 65535
        });
      }).toThrow(/Port must be <= 65535/);
    });

    it('should reject invalid CANONICAL_API_URL', () => {
      expect(() => {
        validateEnv({
          NODE_ENV: 'development',
          CANONICAL_API_URL: 'not-a-valid-url',
        });
      }).toThrow(/CANONICAL_API_URL must be a valid URL/);
    });

    it('should parse boolean AUTH_OTP_ENABLED strings accurately including "false" and smart-enable when API key exists', () => {
      const explicitFalse = validateEnv({
        NODE_ENV: 'development',
        AUTH_OTP_ENABLED: 'false',
        KAVENEGAR_API_KEY: 'sample-valid-api-key-value',
      });
      expect(explicitFalse.AUTH_OTP_ENABLED).toBe(false);

      const autoEnabled = validateEnv({
        NODE_ENV: 'development',
        KAVENEGAR_API_KEY: ' "sample-valid-api-key-value" ',
      });
      expect(autoEnabled.AUTH_OTP_ENABLED).toBe(true);
      expect(autoEnabled.KAVENEGAR_API_KEY).toBe('sample-valid-api-key-value');
    });
  });
});

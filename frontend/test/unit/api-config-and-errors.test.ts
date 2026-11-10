import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, assertServerOnly } from '../../src/lib/server/api-config';
import {
  ApiError,
  NotFoundError,
  ValidationError,
  ServiceUnavailableError,
  ServerError,
  NetworkError,
  ContractValidationError,
  isNotFoundError,
  isServiceUnavailable,
  sanitizeClientErrorMessage,
} from '../../src/lib/server/api-errors';

describe('Frontend Server-Only API Config & Error Abstractions', () => {
  const originalEnv = process.env.TECHA_API_BASE_URL;

  afterEach(() => {
    process.env.TECHA_API_BASE_URL = originalEnv;
  });

  describe('api-config', () => {
    it('returns default fallback URL when TECHA_API_BASE_URL is not set', () => {
      delete process.env.TECHA_API_BASE_URL;
      const url = getApiBaseUrl();
      expect(url).toBe('http://127.0.0.1:3500/api/v1/public');
    });

    it('returns configured URL without trailing slashes', () => {
      process.env.TECHA_API_BASE_URL = 'http://127.0.0.1:3500/api/v1/public///';
      const url = getApiBaseUrl();
      expect(url).toBe('http://127.0.0.1:3500/api/v1/public');
    });

    it('throws when configured URL protocol is invalid', () => {
      process.env.TECHA_API_BASE_URL = 'ftp://internal.cluster/api';
      expect(() => getApiBaseUrl()).toThrow(/Invalid protocol/);
    });

    it('assertServerOnly succeeds in Node.js environment', () => {
      expect(() => assertServerOnly()).not.toThrow();
    });
  });

  describe('api-errors hierarchy', () => {
    it('constructs NotFoundError with 404 code and default Persian message', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.name).toBe('NotFoundError');
      expect(isNotFoundError(err)).toBe(true);
    });

    it('constructs ValidationError with 422 code', () => {
      const err = new ValidationError('Invalid slug');
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe('VALIDATION_ERROR');
    });

    it('constructs ServiceUnavailableError with 503 code', () => {
      const err = new ServiceUnavailableError();
      expect(err.statusCode).toBe(503);
      expect(err.code).toBe('SERVICE_UNAVAILABLE');
      expect(isServiceUnavailable(err)).toBe(true);
    });

    it('constructs NetworkError with 502 code and marks as service unavailable', () => {
      const err = new NetworkError('Backend down');
      expect(err.statusCode).toBe(502);
      expect(isServiceUnavailable(err)).toBe(true);
    });

    it('constructs ContractValidationError with 500 code', () => {
      const err = new ContractValidationError();
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('CONTRACT_VALIDATION_ERROR');
    });

    it('sanitizes connection strings and passwords from error messages', () => {
      const leak = 'Failed mongodb+srv://admin:superSecret123@cluster.net/techa on 127.0.0.1';
      const clean = sanitizeClientErrorMessage(leak);
      expect(clean).not.toContain('superSecret123');
      expect(clean).not.toContain('127.0.0.1');
      expect(clean).toContain('[DATABASE_URI_REDACTED]');
      expect(clean).toContain('[SERVER]');
    });
  });
});

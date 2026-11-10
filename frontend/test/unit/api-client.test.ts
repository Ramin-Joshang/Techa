import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { fetchFromPublicApi } from '../../src/lib/server/api-client';
import {
  NotFoundError,
  ValidationError,
  ServiceUnavailableError,
  NetworkError,
  ServerError,
  ContractValidationError,
} from '../../src/lib/server/api-errors';

describe('Frontend Server-Side API Client (fetchFromPublicApi)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const TestPayloadSchema = z.object({
    id: z.string(),
    name: z.string(),
  });

  it('successfully fetches and validates response data matching shared schema', async () => {
    const mockEnvelope = {
      success: true,
      statusCode: 200,
      data: { id: 'obj_123', name: 'React Foundations' },
      meta: { page: 1, limit: 10, total: 1 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockEnvelope,
    } as unknown as Response);

    const result = await fetchFromPublicApi('/test-endpoint', TestPayloadSchema, {
      searchParams: { page: 1, limit: 10 },
      revalidate: 60,
      tags: ['test-tag'],
    });

    expect(result.data).toEqual({ id: 'obj_123', name: 'React Foundations' });
    expect(result.meta?.total).toBe(1);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/public/test-endpoint?page=1&limit=10'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Accept: 'application/json' }),
        next: { revalidate: 60, tags: ['test-tag'] },
      })
    );
  });

  it('throws NotFoundError when backend returns HTTP 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        statusCode: 404,
        error: { code: 'NOT_FOUND', message: 'Course not found' },
      }),
    } as unknown as Response);

    await expect(fetchFromPublicApi('/courses/unknown', TestPayloadSchema)).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws ValidationError when backend returns HTTP 422', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        statusCode: 422,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid slug parameter' },
      }),
    } as unknown as Response);

    await expect(fetchFromPublicApi('/courses/INVALID', TestPayloadSchema)).rejects.toThrow(
      ValidationError
    );
  });

  it('throws ServiceUnavailableError when backend returns HTTP 503', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        statusCode: 503,
        error: { code: 'DATABASE_NOT_READY', message: 'Database connecting' },
      }),
    } as unknown as Response);

    await expect(fetchFromPublicApi('/health', TestPayloadSchema)).rejects.toThrow(
      ServiceUnavailableError
    );
  });

  it('wraps fetch network exceptions into NetworkError without credential leakage', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:3500'));

    await expect(fetchFromPublicApi('/home', TestPayloadSchema)).rejects.toThrow(NetworkError);
  });

  it('throws ServerError when backend returns unparseable non-JSON text', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    } as unknown as Response);

    await expect(fetchFromPublicApi('/bad-json', TestPayloadSchema)).rejects.toThrow(ServerError);
  });

  it('throws ContractValidationError when response payload violates the shared Zod schema', async () => {
    const invalidEnvelope = {
      success: true,
      statusCode: 200,
      data: { id: 12345, missingName: true }, // violates TestPayloadSchema
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => invalidEnvelope,
    } as unknown as Response);

    await expect(fetchFromPublicApi('/contract-break', TestPayloadSchema)).rejects.toThrow(
      ContractValidationError
    );
  });
});

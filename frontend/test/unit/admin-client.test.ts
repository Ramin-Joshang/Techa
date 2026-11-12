import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { adminClient, AdminApiError } from '../../src/lib/admin/admin-client';

describe('Phase 7 Admin Client (BFF Relative Proxy, CSRF, Single-Flight Refresh, Error Mapping)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('uses relative /api/v1/* endpoints with credentials: include and cache: no-store', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        statusCode: 200,
        data: { items: [], total: 0 },
      }),
    } as unknown as Response);
    global.fetch = fetchMock;

    await adminClient.getSettings();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/admin/settings');
    expect(url).not.toContain('3500');
    expect(init.credentials).toBe('include');
    expect(init.cache).toBe('no-store');
  });

  it('automatically fetches CSRF token and sends x-csrf-token header on mutating requests', async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url === '/api/v1/auth/csrf') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            statusCode: 200,
            data: { csrfToken: 'csrf_test_token_123' },
          }),
        } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          statusCode: 200,
          data: { id: '507f1f77bcf86cd799439011', status: 'published' },
        }),
      } as unknown as Response;
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await adminClient.publishCourse('507f1f77bcf86cd799439011', { expectedVersion: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/csrf',
      expect.objectContaining({ method: 'GET', credentials: 'include' })
    );

    const publishCall = fetchMock.mock.calls.find(
      ([u]) => u === '/api/v1/admin/courses/507f1f77bcf86cd799439011/publish'
    );
    expect(publishCall).toBeDefined();
    const headers = publishCall?.[1]?.headers as Headers;
    expect(headers.get('x-csrf-token')).toBe('csrf_test_token_123');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('performs single-flight 401 session refresh and retries failed request once', async () => {
    let coursesAttempt = 0;
    let refreshCalls = 0;

    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/v1/auth/csrf') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { csrfToken: 'csrf_abc' } }),
        } as unknown as Response;
      }
      if (url === '/api/v1/auth/refresh') {
        refreshCalls++;
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { ok: true } }),
        } as unknown as Response;
      }
      if (url.startsWith('/api/v1/admin/courses')) {
        coursesAttempt++;
        if (coursesAttempt === 1) {
          return {
            ok: false,
            status: 401,
            json: async () => ({
              success: false,
              error: { code: 'UNAUTHORIZED', message: 'Access token expired' },
            }),
          } as unknown as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [],
            meta: {
              pagination: {
                page: 1,
                limit: 20,
                totalItems: 0,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
              },
            },
          }),
        } as unknown as Response;
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await adminClient.listCourses({ page: 1, limit: 20 });
    expect(result.items).toEqual([]);
    expect(refreshCalls).toBe(1);
    expect(coursesAttempt).toBe(2);
  });

  it('distinguishes 403 Forbidden and 409 Conflict via AdminApiError helpers', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      }),
    } as unknown as Response);

    try {
      await adminClient.getDashboardSummary();
      expect.unreachable('Should throw AdminApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(AdminApiError);
      const apiErr = err as AdminApiError;
      expect(apiErr.status).toBe(403);
      expect(apiErr.isForbidden()).toBe(true);
      expect(apiErr.isUnauthorized()).toBe(false);
      expect(apiErr.isConflict()).toBe(false);
    }

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/csrf') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { csrfToken: 't' } }),
        } as unknown as Response;
      }
      return {
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: { code: 'VERSION_CONFLICT', message: 'Concurrent modification' },
        }),
      } as unknown as Response;
    });

    try {
      await adminClient.updateCourse('507f1f77bcf86cd799439011', {
        title: 'Updated',
        expectedVersion: 1,
      });
      expect.unreachable('Should throw AdminApiError 409');
    } catch (err) {
      expect(err).toBeInstanceOf(AdminApiError);
      const apiErr = err as AdminApiError;
      expect(apiErr.status).toBe(409);
      expect(apiErr.isConflict()).toBe(true);
      expect(apiErr.isForbidden()).toBe(false);
    }
  });
});

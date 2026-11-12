import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { authClient } from '../../src/lib/auth-client';
import { AuthProvider } from '../../src/context/AuthContext';
import Header from '../../src/components/layout/Header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => React.createElement('img', props),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...rest }, children),
}));

describe('Public Auth Client & Header Navigation Controls', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('uses relative same-origin /api/v1/auth paths and never hardcodes localhost:3500 in auth-client.ts', () => {
    const authClientPath = path.resolve(__dirname, '../../src/lib/auth-client.ts');
    const source = fs.readFileSync(authClientPath, 'utf8');
    expect(source).not.toContain('http://localhost:3500');
  });

  it('sends login requests to /api/v1/auth/login with credentials include and CSRF header', async () => {
    const mockFetch = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url === '/api/v1/auth/csrf') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { csrfToken: 'csrf_auth_123' } }),
        } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            user: {
              id: 'u1',
              phoneE164: '+989195993264',
              phoneMasked: '+98 919 *** 3264',
              firstName: 'Ramin',
              lastName: null,
              roles: ['super_admin', 'admin'],
              status: 'active',
              phoneVerified: true,
              createdAt: '2026-11-12T00:00:00.000Z',
              lastLoginAt: null,
            },
            csrfToken: 'csrf_auth_123',
          },
        }),
      } as unknown as Response;
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    const res = await authClient.login({ phone: '09195993264', password: 'Ramin12345678' });
    expect(res.user.roles).toContain('super_admin');
    expect(mockFetch.mock.calls.some(([u]) => u === '/api/v1/auth/login')).toBe(true);
    const loginCall = mockFetch.mock.calls.find(([u]) => u === '/api/v1/auth/login');
    expect(loginCall?.[1]?.credentials).toBe('include');
  });

  it('renders login and register links in public Header when unauthenticated', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuthProvider, null, React.createElement(Header))
    );
    expect(html).toContain('href="/login"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('ورود');
    expect(html).toContain('ثبت‌نام');
  });
});

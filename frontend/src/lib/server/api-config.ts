/**
 * Server-only API Configuration
 * The API base URL is resolved on the Node.js server and NEVER exposed to browser bundles.
 */

export function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: Server data-access modules cannot be executed in client bundles.');
  }
}

export const DEFAULT_TECHA_API_BASE_URL = 'http://127.0.0.1:3500/api/v1/public';

function getInternalBackendApiBaseUrl(): string {
  if (process.env.BACKEND_INTERNAL_URL) {
    return `${process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, '')}/api/v1/public`;
  }
  if (process.env.API_PORT && process.env.API_PORT !== '3000') {
    const host = process.env.API_HOST || '127.0.0.1';
    return `http://${host}:${process.env.API_PORT}/api/v1/public`;
  }
  return DEFAULT_TECHA_API_BASE_URL;
}

export function getApiBaseUrl(): string {
  assertServerOnly();

  const url = process.env.TECHA_API_BASE_URL || getInternalBackendApiBaseUrl();

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol in TECHA_API_BASE_URL: ${parsed.protocol}`);
    }
    if (
      (parsed.pathname === '/' || parsed.pathname === '') &&
      parsed.hostname !== '127.0.0.1' &&
      parsed.hostname !== 'localhost'
    ) {
      return getInternalBackendApiBaseUrl();
    }
    return url.replace(/\/+$/, '');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid TECHA_API_BASE_URL configuration: ${message}`);
  }
}

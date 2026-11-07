/**
 * Server-only API Configuration
 * The API base URL is resolved on the Node.js server and NEVER exposed to browser bundles.
 */

export function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: Server data-access modules cannot be executed in client bundles.');
  }
}

export function getApiBaseUrl(): string {
  assertServerOnly();

  const url = process.env.TECHA_API_BASE_URL || 'http://127.0.0.1:5000/api/v1/public';

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol in TECHA_API_BASE_URL: ${parsed.protocol}`);
    }
    return url.replace(/\/+$/, '');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid TECHA_API_BASE_URL configuration: ${message}`);
  }
}

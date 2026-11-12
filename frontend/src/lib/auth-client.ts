import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AuthUser,
  ChangePasswordRequest,
  SessionItem,
} from '@techa/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

let inflightCsrfPromise: Promise<string | null> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  const existing = getCookie('techa_csrf');
  if (existing) return existing;

  if (!inflightCsrfPromise) {
    inflightCsrfPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        const body = await res.json().catch(() => null);
        return (body?.data?.csrfToken as string) || getCookie('techa_csrf') || null;
      } catch {
        return null;
      } finally {
        inflightCsrfPromise = null;
      }
    })();
  }

  return inflightCsrfPromise;
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  // Add JSON content type for bodies
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Double submit cookie CSRF token header for mutating requests
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
    const csrfToken = getCookie('techa_csrf') || (await ensureCsrfToken());
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'include', // Ensure HttpOnly cookies (techa_at, techa_rt) are sent
      cache: 'no-store',
    });
  } catch {
    const error = new Error('خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت یا وضعیت سرویس را بررسی کنید.');
    (error as any).status = 0;
    (error as any).code = 'NETWORK_ERROR';
    throw error;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error?.message || `خطای سرور (${response.status})`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).code = data?.error?.code;
    throw error;
  }

  return data?.data;
}

export const authClient = {
  async register(input: RegisterRequest): Promise<RegisterResponse> {
    return fetchWithAuth('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async login(input: LoginRequest): Promise<{ user: AuthUser; csrfToken: string }> {
    return fetchWithAuth('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async refresh(): Promise<{ user: AuthUser; csrfToken: string }> {
    return fetchWithAuth('/api/v1/auth/refresh', {
      method: 'POST',
    });
  },

  async logout(): Promise<void> {
    return fetchWithAuth('/api/v1/auth/logout', {
      method: 'POST',
    });
  },

  async logoutAll(): Promise<void> {
    return fetchWithAuth('/api/v1/auth/logout-all', {
      method: 'POST',
    });
  },

  async getMe(): Promise<{ user: AuthUser }> {
    return fetchWithAuth('/api/v1/auth/me', {
      method: 'GET',
    });
  },

  async getSessions(): Promise<{ sessions: SessionItem[] }> {
    return fetchWithAuth('/api/v1/auth/sessions', {
      method: 'GET',
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    return fetchWithAuth(`/api/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async changePassword(input: ChangePasswordRequest): Promise<void> {
    return fetchWithAuth('/api/v1/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async requestOtp(phone: string): Promise<any> {
    return fetchWithAuth('/api/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(input: { challengeId: string; code: string }): Promise<{ user: AuthUser; csrfToken: string; message: string }> {
    return fetchWithAuth('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async resendOtp(challengeId: string): Promise<any> {
    return fetchWithAuth('/api/v1/auth/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    });
  },

  async forgotPassword(phone: string): Promise<any> {
    return fetchWithAuth('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async resetPassword(input: { challengeId: string; code: string; newPassword: string; confirmPassword?: string }): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth('/api/v1/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async initCsrf(): Promise<string> {
    const res = await fetchWithAuth('/api/v1/auth/csrf', { method: 'GET' });
    return res?.csrfToken || '';
  },
};

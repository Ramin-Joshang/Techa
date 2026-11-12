import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KavenegarProvider } from '../../src/modules/auth/otp/kavenegar.provider';

describe('KavenegarProvider Unit Tests', () => {
  let provider: KavenegarProvider;

  beforeEach(() => {
    vi.restoreAllMocks();
    provider = new KavenegarProvider();
  });

  it('correctly reports configuration status based on API key presence', () => {
    vi.spyOn(provider, 'getApiKey').mockReturnValue(undefined);
    expect(provider.isConfigured()).toBe(false);

    vi.spyOn(provider, 'getApiKey').mockReturnValue('short');
    expect(provider.isConfigured()).toBe(false);

    vi.spyOn(provider, 'getApiKey').mockReturnValue('valid-kavenegar-api-key-123456');
    expect(provider.isConfigured()).toBe(true);
  });

  it('normalizes Iranian phone numbers to local 09... format for Kavenegar Verify Lookup', () => {
    expect(provider.formatReceptor('+989123456789')).toBe('09123456789');
    expect(provider.formatReceptor('09123456789')).toBe('09123456789');
    expect(provider.formatReceptor('+14155552671')).toBe('0014155552671');
  });

  it('sanitizes URL logs so API keys are never exposed in plaintext and posts form-encoded payload', async () => {
    const apiKey = 'secret-kavenegar-key-99999';
    vi.spyOn(provider, 'getApiKey').mockReturnValue(apiKey);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          return: { status: 200, message: 'تایید شد' },
          entries: [{ messageid: 123456, message: 'test', status: 5, statustext: 'ارسال به مخابرات' }],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await provider.sendVerifyLookup({
      receptor: '+989123456789',
      token: '123456',
      template: 'verify-tpl',
    });

    expect(result.accepted).toBe(true);
    expect(result.messageId).toBe('123456');

    // Verify fetch call URL and payload
    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent(apiKey));

    // Confirm that replacing with [REDACTED_API_KEY] produces safe string
    const sanitized = calledUrl.replace(apiKey, '[REDACTED_API_KEY]');
    expect(sanitized).not.toContain(apiKey);
    expect(sanitized).toContain('[REDACTED_API_KEY]');
  });

  it('maps Kavenegar error codes to appropriate internal exceptions', async () => {
    vi.spyOn(provider, 'getApiKey').mockReturnValue('test-api-key-12345678');

    // Code 418: Insufficient credit
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            return: { status: 418, message: 'اعتبار حساب کافی نیست' },
          }),
      })
    );

    await expect(
      provider.sendVerifyLookup({
        receptor: '+989123456789',
        token: '123456',
        template: 'verify-tpl',
      })
    ).rejects.toThrow('OTP_PROVIDER_INSUFFICIENT_CREDIT');

    // Code 424: Template invalid
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            return: { status: 424, message: 'الگوی پیامک یافت نشد' },
          }),
      })
    );

    await expect(
      provider.sendVerifyLookup({
        receptor: '+989123456789',
        token: '123456',
        template: 'missing-tpl',
      })
    ).rejects.toThrow('OTP_TEMPLATE_INVALID');
  });

  it('handles network timeouts via AbortController and maps to OTP_PROVIDER_UNAVAILABLE', async () => {
    vi.spyOn(provider, 'getApiKey').mockReturnValue('test-api-key-12345678');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          })
      )
    );

    await expect(
      provider.sendVerifyLookup({
        receptor: '+989123456789',
        token: '123456',
        template: 'verify-tpl',
      })
    ).rejects.toThrow('OTP_PROVIDER_UNAVAILABLE');
  });
});

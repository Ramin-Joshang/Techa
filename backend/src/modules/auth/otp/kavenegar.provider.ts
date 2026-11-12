import { env } from '../../../core/config/env';
import { logger } from '../../../core/logger/logger';

export interface SendVerifyOtpParams {
  receptor: string;
  token: string;
  template: string;
  token2?: string;
  token3?: string;
  type?: 'sms' | 'call';
  tag?: string;
}

export interface KavenegarVerifyResult {
  accepted: boolean;
  messageId?: string;
  status?: number;
  statustext?: string;
  sender?: string;
  cost?: number;
}

export class KavenegarProvider {
  private readonly baseUrl = 'https://api.kavenegar.com/v1';
  private readonly timeoutMs = 8000;

  /**
   * Checks if Kavenegar OTP is configured with a valid API key.
   */
  isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.trim().length > 10;
  }

  getApiKey(): string | undefined {
    return process.env.KAVENEGAR_API_KEY || env.KAVENEGAR_API_KEY;
  }

  /**
   * Formats phone number for Kavenegar Verify Lookup:
   * - Iranian mobile (+989...): formatted to 09...
   * - International: formatted with 00 (e.g. 001...)
   */
  formatReceptor(phoneE164: string): string {
    const trimmed = phoneE164.trim();
    if (trimmed.startsWith('+98') && trimmed.length === 13) {
      return '0' + trimmed.slice(3);
    }
    if (trimmed.startsWith('+')) {
      return '00' + trimmed.slice(1);
    }
    return trimmed;
  }

  /**
   * Dispatches OTP verification via Kavenegar Verify Lookup API.
   * NEVER logs the API key or raw OTP token.
   */
  async sendVerifyLookup(params: SendVerifyOtpParams): Promise<KavenegarVerifyResult> {
    const apiKey = this.getApiKey();
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('OTP_PROVIDER_NOT_CONFIGURED');
    }

    if (!params.template || params.template.trim().length === 0) {
      throw new Error('OTP_TEMPLATE_INVALID');
    }

    const receptor = this.formatReceptor(params.receptor);
    const sanitizedLogUrl = `${this.baseUrl}/[REDACTED_API_KEY]/verify/lookup.json`;

    logger.info(
      {
        endpoint: sanitizedLogUrl,
        template: params.template,
        receptorPrefix: receptor.slice(0, 4) + '***',
      },
      '[Kavenegar] Dispatching OTP verify lookup'
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${this.baseUrl}/${encodeURIComponent(apiKey)}/verify/lookup.json`;

      // Kavenegar accepts POST with application/x-www-form-urlencoded
      const body = new URLSearchParams();
      body.append('receptor', receptor);
      body.append('token', params.token);
      body.append('template', params.template);
      if (params.token2) body.append('token2', params.token2);
      if (params.token3) body.append('token3', params.token3);
      if (params.type) body.append('type', params.type);
      if (params.tag) body.append('tag', params.tag);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        signal: controller.signal,
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        logger.error({ status: response.status }, '[Kavenegar] Non-JSON response received');
        throw new Error('OTP_PROVIDER_UNAVAILABLE');
      }

      if (!data || typeof data !== 'object') {
        throw new Error('OTP_PROVIDER_UNAVAILABLE');
      }

      const returnStatus = data.return?.status;
      const returnMessage = data.return?.message;

      // Handle HTTP status or Kavenegar return status
      if (response.status === 401 || response.status === 403) {
        throw new Error('OTP_PROVIDER_AUTH_FAILED');
      }

      if (returnStatus !== 200) {
        this.mapKavenegarError(returnStatus, returnMessage);
      }

      // Kavenegar returns entries array on 200
      const entry = Array.isArray(data.entries) ? data.entries[0] : null;

      logger.info(
        {
          messageId: entry?.messageid,
          status: entry?.status,
        },
        '[Kavenegar] OTP lookup accepted by provider'
      );

      return {
        accepted: true,
        messageId: entry?.messageid ? String(entry.messageid) : undefined,
        status: entry?.status,
        statustext: entry?.statustext,
        sender: entry?.sender,
        cost: entry?.cost,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          logger.error('[Kavenegar] Request timed out after ' + this.timeoutMs + 'ms');
          throw new Error('OTP_PROVIDER_UNAVAILABLE');
        }
        // If already mapped to internal code, rethrow
        if (err.message.startsWith('OTP_')) {
          throw err;
        }
      }
      logger.error({ err }, '[Kavenegar] Unexpected dispatch error');
      throw new Error('OTP_DELIVERY_FAILED');
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapKavenegarError(status: number, message?: string): never {
    logger.warn({ kavenegarStatus: status, message }, '[Kavenegar] Provider returned error status');
    switch (status) {
      case 418:
        throw new Error('OTP_PROVIDER_INSUFFICIENT_CREDIT');
      case 422:
      case 431:
        throw new Error('OTP_INVALID');
      case 424:
      case 432:
        throw new Error('OTP_TEMPLATE_INVALID');
      case 426:
        throw new Error('OTP_PROVIDER_AUTH_FAILED');
      case 428:
      case 607:
        throw new Error('OTP_DELIVERY_FAILED');
      default:
        throw new Error('OTP_DELIVERY_FAILED');
    }
  }
}

export const kavenegarProvider = new KavenegarProvider();

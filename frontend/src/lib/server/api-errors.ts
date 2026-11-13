/**
 * Typed Server-Side API Errors
 * Distinguishes 404, 422, 503, network, and schema validation failures.
 * Guarantees zero credential or internal error leakage.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'محتوای درخواستی یافت نشد یا در دسترس نیست.', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'پارامترهای درخواست نامعتبر است.', details?: unknown) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'سرویس پایگاه داده موقتاً در دسترس نیست.', details?: unknown) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
    this.name = 'ServiceUnavailableError';
  }
}

export class ServerError extends ApiError {
  constructor(message = 'خطای غیرمنتظره در سرور رخ داده است.', statusCode = 500, details?: unknown) {
    super(message, statusCode, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'ServerError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'عدم برقراری ارتباط با سرویس‌دهنده پشتیبان.', details?: unknown) {
    super(message, 502, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ContractValidationError extends ApiError {
  constructor(message = 'قالب پاسخ سرور با قرارداد تعریف‌شده همخوانی ندارد.', details?: unknown) {
    super(message, 500, 'CONTRACT_VALIDATION_ERROR', details);
    this.name = 'ContractValidationError';
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof NotFoundError || (error instanceof ApiError && error.statusCode === 404);
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError;
}

export function isServiceUnavailable(error: unknown): boolean {
  return (
    error instanceof ServiceUnavailableError ||
    error instanceof NetworkError ||
    (error instanceof ApiError && error.statusCode === 503)
  );
}

/**
 * Strips all potential credentials or IP leakages from user-facing strings.
 */
export function sanitizeClientErrorMessage(message: string): string {
  return message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '[DATABASE_URI_REDACTED]')
    .replace(/127\.0\.0\.1|localhost/gi, '[SERVER]')
    .replace(/password|secret|token/gi, '***');
}

import { z } from 'zod';
import { ApiResponseSchema, ApiErrorResponseSchema } from '@techa/shared';
import { getApiBaseUrl, getInternalBackendApiBaseUrl } from './api-config';
import {
  ApiError,
  NotFoundError,
  ValidationError,
  ServiceUnavailableError,
  ServerError,
  NetworkError,
  ContractValidationError,
} from './api-errors';

export interface FetchOptions {
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  revalidate?: number | false;
  tags?: string[];
  headers?: Record<string, string>;
}

export interface FetchResult<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp?: string;
  };
}

function buildTargetUrl(baseUrl: string, cleanEndpoint: string, searchParams?: FetchOptions['searchParams']): URL {
  const url = new URL(`${baseUrl}${cleanEndpoint}`);
  if (searchParams) {
    for (const [key, val] of Object.entries(searchParams)) {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.set(key, String(val));
      }
    }
  }
  return url;
}

/**
 * Low-level typed fetcher for Techa public APIs.
 * Validates request parameters and enforces the shared Zod response contracts.
 */
export async function fetchFromPublicApi<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Build target URL safely
  let targetUrl: URL;
  try {
    targetUrl = buildTargetUrl(baseUrl, cleanEndpoint, options.searchParams);
  } catch {
    throw new ServerError(`خطا در ایجاد نشانی سرویس: ${cleanEndpoint}`);
  }

  // Next.js caching options
  const fetchInit: RequestInit = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  };

  // Configure Next.js caching if running inside Next.js server runtime
  const nextOptions: Record<string, unknown> = {};
  if (options.revalidate !== undefined) {
    nextOptions.revalidate = options.revalidate;
  }
  if (options.tags && options.tags.length > 0) {
    nextOptions.tags = options.tags;
  }

  if (Object.keys(nextOptions).length > 0) {
    (fetchInit as unknown as { next?: unknown }).next = nextOptions;
  }

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), fetchInit);
  } catch (err: unknown) {
    const internalBaseUrl = getInternalBackendApiBaseUrl();
    const isLoopback = targetUrl.hostname === '127.0.0.1' || targetUrl.hostname === 'localhost';
    if (isLoopback && baseUrl !== internalBaseUrl) {
      try {
        const fallbackUrl = buildTargetUrl(internalBaseUrl, cleanEndpoint, options.searchParams);
        response = await fetch(fallbackUrl.toString(), fetchInit);
      } catch (fallbackErr: unknown) {
        const fallbackDetails = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        throw new NetworkError('امکان برقراری ارتباط با سرور داده‌ها وجود ندارد.', fallbackDetails);
      }
    } else {
      const errorDetails = err instanceof Error ? err.message : String(err);
      // Never leak internal hostnames or credentials to clients
      throw new NetworkError('امکان برقراری ارتباط با سرور داده‌ها وجود ندارد.', errorDetails);
    }
  }

  // Parse JSON response body
  let bodyJson: unknown;
  try {
    bodyJson = await response.json();
  } catch {
    if (response.status === 404) {
      throw new NotFoundError('محتوای مورد نظر یافت نشد.');
    }
    if (response.status === 503) {
      throw new ServiceUnavailableError();
    }
    throw new ServerError(`خطا در دریافت پاسخ معتبر از سرور (کد وضعیت: ${response.status})`);
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    const errorParse = ApiErrorResponseSchema.safeParse(bodyJson);
    const errorMessage = errorParse.success ? errorParse.data.error.message : 'خطای سرور';
    const errorCode = errorParse.success ? errorParse.data.error.code : 'UNKNOWN_ERROR';
    const errorDetails = errorParse.success ? errorParse.data.error.details : undefined;

    if (response.status === 404) {
      throw new NotFoundError(errorMessage, errorDetails);
    }
    if (response.status === 422) {
      throw new ValidationError(errorMessage, errorDetails);
    }
    if (response.status === 503 || errorCode === 'DATABASE_NOT_READY' || errorCode === 'DATABASE_UNAVAILABLE') {
      throw new ServiceUnavailableError(errorMessage, errorDetails);
    }

    throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
  }

  // Validate standardized success envelope
  const envelopeSchema = ApiResponseSchema(schema);
  const envelopeResult = envelopeSchema.safeParse(bodyJson);

  if (!envelopeResult.success) {
    throw new ContractValidationError(
      'ساختار پاسخ دریافت شده از سرور با قرارداد تعریف‌شده همخوانی ندارد.',
      envelopeResult.error.issues
    );
  }

  return {
    data: envelopeResult.data.data,
    meta: envelopeResult.data.meta,
  };
}

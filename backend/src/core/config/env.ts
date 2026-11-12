import './load-env';
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().min(1, 'API_HOST cannot be empty').default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1024, 'Port must be >= 1024').max(65535, 'Port must be <= 65535').default(3500),
  MONGODB_URI: z.string().optional(),
  FRONTEND_ORIGIN: z.string().default('https://techa.ir'),
  CORS_ORIGINS: z.string().default('https://techa.ir,https://www.techa.ir,http://localhost:3000,http://127.0.0.1:3000'),
  CANONICAL_API_URL: z.string().url('CANONICAL_API_URL must be a valid URL').default('https://techa.ir'),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(1),
  // Phase 5 Kavenegar OTP Configuration
  AUTH_OTP_ENABLED: z.coerce.boolean().default(false),
  KAVENEGAR_API_KEY: z.string().optional(),
  KAVENEGAR_VERIFY_TEMPLATE: z.string().optional(),
  KAVENEGAR_REGISTER_TEMPLATE: z.string().optional(),
  KAVENEGAR_LOGIN_TEMPLATE: z.string().optional(),
  KAVENEGAR_PASSWORD_RESET_TEMPLATE: z.string().optional(),
  OTP_HASH_SECRET: z.string().default('techa_dev_otp_hmac_secret_2026_at_least_32_chars!'),
  OTP_CODE_DIGITS: z.coerce.number().int().min(4).max(8).default(6),
  OTP_TTL_SECONDS: z.coerce.number().int().min(60).max(1800).default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(10).max(300).default(60),
  OTP_MAX_SENDS_PER_PHONE_PER_HOUR: z.coerce.number().int().min(1).max(30).default(5),
  OTP_MAX_SENDS_PER_IP_PER_HOUR: z.coerce.number().int().min(1).max(60).default(10),
  KAVENEGAR_LIVE_TEST_ENABLED: z.coerce.boolean().default(false),
  KAVENEGAR_LIVE_TEST_RECEPTOR: z.string().optional(),
  // Phase 6 CMS Media Storage & Cache Revalidation
  TECHA_MEDIA_STORAGE_ROOT: z.string().min(1).default('./var/media'),
  MEDIA_MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  MEDIA_MAX_DOCUMENT_BYTES: z.coerce.number().int().positive().default(50 * 1024 * 1024),
  MEDIA_MAX_VIDEO_BYTES: z.coerce.number().int().positive().default(200 * 1024 * 1024),
  FRONTEND_INTERNAL_URL: z.string().url().default('http://127.0.0.1:3000'),
  CACHE_REVALIDATION_SECRET: z.string().default('techa_dev_revalidation_secret_2026_at_least_32_chars!'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env as Record<string, unknown>): EnvConfig {
  const normalizedRaw = {
    ...rawEnv,
    API_HOST: rawEnv.API_HOST || rawEnv.BACKEND_HOST,
    API_PORT: rawEnv.API_PORT || rawEnv.BACKEND_PORT,
    CANONICAL_API_URL: rawEnv.CANONICAL_API_URL || rawEnv.PUBLIC_API_URL,
    CORS_ORIGINS: rawEnv.CORS_ORIGINS || rawEnv.CORS_ALLOWED_ORIGINS,
    TRUST_PROXY_HOPS:
      rawEnv.TRUST_PROXY_HOPS !== undefined
        ? rawEnv.TRUST_PROXY_HOPS
        : rawEnv.TRUST_PROXY !== undefined
          ? rawEnv.TRUST_PROXY
          : undefined,
  };
  const result = EnvSchema.safeParse(normalizedRaw);
  if (!result.success) {
    // Sanitize issues to avoid printing sensitive values
    const safeIssues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
    }));
    throw new Error(`[Config] Invalid Environment Configuration:\n${JSON.stringify(safeIssues, null, 2)}`);
  }

  const config = result.data;

  if (config.NODE_ENV === 'production' && !config.MONGODB_URI) {
    throw new Error('[Config] MONGODB_URI is strictly required in production mode');
  }

  return config;
}

export const env = validateEnv();

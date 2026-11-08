import './load-env';
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().min(1, 'API_HOST cannot be empty').default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1024, 'Port must be >= 1024').max(65535, 'Port must be <= 65535').default(5000),
  MONGODB_URI: z.string().optional(),
  FRONTEND_ORIGIN: z.string().default('https://techa.ir'),
  CORS_ORIGINS: z.string().default('https://techa.ir,https://www.techa.ir,http://localhost:3000,http://127.0.0.1:3000'),
  CANONICAL_API_URL: z.string().url('CANONICAL_API_URL must be a valid URL').default('https://techa.ir'),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(1),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env as Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(rawEnv);
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

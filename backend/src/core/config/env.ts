import './load-env';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().default('127.0.0.1'),
  API_PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().optional(),
  FRONTEND_ORIGIN: z.string().default('http://127.0.0.1:3000'),
  CORS_ORIGINS: z.string().default('http://127.0.0.1:3000,http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(1),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function parseEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    throw new Error(`[Config] Invalid Environment Configuration:\n${errorDetails}`);
  }

  const config = result.data;

  if (config.NODE_ENV === 'production' && !config.MONGODB_URI) {
    throw new Error('[Config] MONGODB_URI is strictly required in production mode');
  }

  return config;
}

export const env = parseEnv();

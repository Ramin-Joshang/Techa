import { z } from 'zod';

export const LivenessResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
});

export const ReadinessResponseSchema = z.object({
  status: z.enum(['ready', 'not_ready']),
  database: z.enum(['connected', 'disconnected']),
  timestamp: z.string(),
});

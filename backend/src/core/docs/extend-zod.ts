import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export function patchZodInstance(zodInstance: any, openapiFn: any): void {
  if (!zodInstance || !openapiFn) return;
  for (const key of Object.keys(zodInstance)) {
    if (key.startsWith('Zod') && zodInstance[key]?.prototype && !zodInstance[key].prototype.openapi) {
      zodInstance[key].prototype.openapi = openapiFn;
    }
  }
}

export function patchZodWithOpenApi(): void {
  extendZodWithOpenApi(z);
  const openapiFn = (z.ZodType.prototype as any).openapi;
  if (!openapiFn) {
    return;
  }

  // 1. Patch ESM z prototypes
  patchZodInstance(z, openapiFn);

  // 2. Patch CJS z if loaded separately in dual-module environments
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cjsZod = require('zod');
    if (cjsZod && cjsZod !== z) {
      extendZodWithOpenApi(cjsZod);
      patchZodInstance(cjsZod, openapiFn);
    }
  } catch {
    // Ignore in pure ESM environments
  }
}

export function ensureOpenApi<T extends z.ZodTypeAny>(schema: T): T {
  const openapiFn = (z.ZodType.prototype as any)?.openapi;
  if (!openapiFn) return schema;

  let current = schema as any;
  while (current && current !== Object.prototype) {
    const proto = Object.getPrototypeOf(current);
    if (proto && proto !== Object.prototype && !proto.openapi) {
      proto.openapi = openapiFn;
    }
    current = proto;
  }

  return schema;
}

patchZodWithOpenApi();

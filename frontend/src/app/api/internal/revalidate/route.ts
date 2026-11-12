import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

const RevalidatePayloadSchema = z.object({
  tags: z.array(z.string().min(1).max(150)).max(50).default([]),
  paths: z.array(z.string().min(1).max(200)).max(50).default([]),
});

const ALLOWED_TAG_PREFIXES = [
  'techa-home',
  'techa-courses',
  'techa-course:',
  'techa-course-outline:',
  'techa-lesson:',
  'techa-search',
  'techa-settings',
  'techa-pages',
  'techa-page:',
];

function isAllowedTag(tag: string): boolean {
  return ALLOWED_TAG_PREFIXES.some((prefix) =>
    prefix.endsWith(':') ? tag.startsWith(prefix) : tag === prefix
  );
}

function isAllowedPath(p: string): boolean {
  return p === '/' || p === '/docs' || p === '/sitemap.xml' || p.startsWith('/docs/');
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.CACHE_REVALIDATION_SECRET;
  const expectedSecret =
    configuredSecret ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'techa_dev_revalidation_secret_2026_at_least_32_chars!');

  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Revalidation secret is not configured' } },
      { status: 503 }
    );
  }

  const providedSecret = request.headers.get('x-techa-revalidation-secret') || '';

  if (!providedSecret || !constantTimeEquals(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid revalidation secret' } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON payload' } },
      { status: 400 }
    );
  }

  const parsed = RevalidatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid revalidation body' } },
      { status: 422 }
    );
  }

  const revalidatedTags: string[] = [];
  const revalidatedPaths: string[] = [];

  for (const tag of parsed.data.tags) {
    if (isAllowedTag(tag)) {
      revalidateTag(tag, { expire: 0 });
      revalidatedTags.push(tag);
    }
  }

  for (const p of parsed.data.paths) {
    if (isAllowedPath(p)) {
      revalidatePath(p);
      revalidatedPaths.push(p);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      revalidatedTags,
      revalidatedPaths,
      revalidatedAt: new Date().toISOString(),
    },
  });
}

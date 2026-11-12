import { NextResponse } from "next/server";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_DOC_KEYWORDS = new Set(['exercises', 'questions', 'ask', 'quiz']);

function isAllowedPublicRoute(pathname) {
  // Normalize trailing slash (e.g., /docs/ -> /docs, / -> /)
  let normalized = pathname;
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // 1. Homepage: /
  if (normalized === '' || normalized === '/') {
    return true;
  }

  // 2. Documentation listing: /docs
  if (normalized === '/docs') {
    return true;
  }

  // 3. Documentation course and lesson pages: /docs/:courseSlug and /docs/:courseSlug/:lessonSlug
  if (normalized.startsWith('/docs/')) {
    const subPath = normalized.slice('/docs/'.length);
    // Disallow trailing slashes or empty segments inside subpath (e.g. /docs//)
    if (subPath.startsWith('/') || subPath.endsWith('/') || subPath.includes('//')) {
      return false;
    }

    const segments = subPath.split('/');

    // Route 3: /docs/[courseSlug]
    if (segments.length === 1) {
      const courseSlug = segments[0];
      return (
        courseSlug.length >= 1 &&
        courseSlug.length <= 100 &&
        !RESERVED_DOC_KEYWORDS.has(courseSlug) &&
        SLUG_REGEX.test(courseSlug)
      );
    }

    // Route 4: /docs/[courseSlug]/[lessonSlug]
    if (segments.length === 2) {
      const [courseSlug, lessonSlug] = segments;
      return (
        courseSlug.length >= 1 &&
        courseSlug.length <= 100 &&
        lessonSlug.length >= 1 &&
        lessonSlug.length <= 100 &&
        !RESERVED_DOC_KEYWORDS.has(courseSlug) &&
        !RESERVED_DOC_KEYWORDS.has(lessonSlug) &&
        SLUG_REGEX.test(courseSlug) &&
        SLUG_REGEX.test(lessonSlug)
      );
    }

    // Anything deeper (e.g. /docs/a/b/c) is strictly forbidden in Phase 1
    return false;
  }

  // 4. Dedicated Public Informational Pages
  if (
    normalized === '/about' ||
    normalized === '/contact' ||
    normalized === '/roadmap' ||
    normalized === '/faq'
  ) {
    return true;
  }

  // 5. Phase 4 & Phase 5 Auth pages
  if (
    normalized === '/login' ||
    normalized === '/register' ||
    normalized === '/verify-otp' ||
    normalized === '/forgot-password' ||
    normalized === '/reset-password'
  ) {
    return true;
  }

  return false;
}

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

function isAllowedAdminRoute(pathname) {
  let normalized = pathname;
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  if (
    normalized === '/admin' ||
    normalized === '/admin/login' ||
    normalized === '/admin/courses' ||
    normalized === '/admin/courses/new' ||
    normalized === '/admin/media' ||
    normalized === '/admin/pages' ||
    normalized === '/admin/pages/new' ||
    normalized === '/admin/settings' ||
    normalized === '/admin/users' ||
    normalized === '/admin/revisions' ||
    normalized === '/admin/audit-logs'
  ) {
    return true;
  }

  if (!normalized.startsWith('/admin/')) {
    return false;
  }

  const subPath = normalized.slice('/admin/'.length);
  if (subPath.startsWith('/') || subPath.endsWith('/') || subPath.includes('//')) {
    return false;
  }
  const segments = subPath.split('/');

  // /admin/courses/:courseId or /admin/courses/:courseId/chapters
  if (segments[0] === 'courses') {
    if (segments.length === 2 && OBJECT_ID_REGEX.test(segments[1])) {
      return true;
    }
    if (segments.length === 3 && OBJECT_ID_REGEX.test(segments[1]) && segments[2] === 'chapters') {
      return true;
    }
    return false;
  }

  // /admin/chapters/:chapterId
  if (segments[0] === 'chapters' && segments.length === 2 && OBJECT_ID_REGEX.test(segments[1])) {
    return true;
  }

  // /admin/lessons/:lessonId
  if (segments[0] === 'lessons' && segments.length === 2 && OBJECT_ID_REGEX.test(segments[1])) {
    return true;
  }

  // /admin/pages/:pageId
  if (segments[0] === 'pages' && segments.length === 2 && OBJECT_ID_REGEX.test(segments[1])) {
    return true;
  }

  // /admin/users/:userId
  if (segments[0] === 'users' && segments.length === 2 && OBJECT_ID_REGEX.test(segments[1])) {
    return true;
  }

  return false;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js internal assets, prefetch, chunks, images, fonts, and backend routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/api/v1/public') ||
    pathname.startsWith('/api/v1/auth') ||
    pathname.startsWith('/api/v1/admin') ||
    pathname.startsWith('/api/v1/health') ||
    pathname === '/api/internal/revalidate' ||
    pathname.startsWith('/api-docs') ||
    pathname === '/backend' ||
    pathname.startsWith('/backend/') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Enforce Phase 7 Admin Route Allowlist (marked noindex)
  if (isAllowedAdminRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // 3. Enforce Phase 1 Public Route Allowlist
  if (isAllowedPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 4. For any unapproved route, rewrite to /_not-found which emits HTTP 404
  return NextResponse.rewrite(new URL('/_not-found', request.url));
}

// Export both proxy and middleware for maximum framework compatibility
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

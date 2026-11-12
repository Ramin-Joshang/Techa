import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../../src/proxy';

describe('Phase 1 Public Route Boundary Enforcement Guard', () => {
  function testProxy(path: string) {
    const url = new URL(`http://localhost:3000${path}`);
    const request = new NextRequest(url);
    const response = proxy(request);
    const isRewrittenTo404 =
      response.headers.get('x-middleware-rewrite')?.includes('/_not-found') || false;
    return {
      allowed: !isRewrittenTo404,
      is404: isRewrittenTo404,
    };
  }

  describe('Positive Tests — Approved Phase 1 Public Pages', () => {
    it('allows homepage (/)', () => {
      const res = testProxy('/');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows documentation listing (/docs)', () => {
      const res = testProxy('/docs');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows documentation listing with trailing slash (/docs/)', () => {
      const res = testProxy('/docs/');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows documentation course details with valid slug (/docs/react-foundations)', () => {
      const res = testProxy('/docs/react-foundations');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows documentation lesson detail with valid course and lesson slugs (/docs/react-foundations/intro-to-jsx)', () => {
      const res = testProxy('/docs/react-foundations/intro-to-jsx');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });
  });

  describe('Negative Tests — Legacy & Out-of-Scope Application Routes', () => {
    const legacyPaths = [
      '/blog',
      '/blog/react-optimization-tips',
      '/projects',
      '/projects/1',
      '/questions',
      '/questions/1',
      '/account',
      '/account/profile',
      '/account/dashboard',
      '/account/courses',
      '/account/certificates',
      '/account/roadmap',
      '/account/license',
      '/account/spot-player',
      '/account/tickets',
      '/account/tickets/new',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/courses',
      '/courses/1',
      '/courses/1/questions',
      '/cart',
      '/packages',
      '/packages/frontend',
      '/about-us',
      '/contact-us',
      '/ai',
      '/faqs',
      '/internship',
      '/market-analysis',
      '/term',
      '/front-boot-camp',
      '/inline/react/1',
      '/api/spotx',
    ];

    for (const p of legacyPaths) {
      it(`blocks legacy path ${p} and rewrites to 404`, () => {
        const res = testProxy(p);
        expect(res.is404).toBe(true);
        expect(res.allowed).toBe(false);
      });
    }

    it('blocks hidden legacy sub-routes under /docs (/docs/react/exercises)', () => {
      const res = testProxy('/docs/react/exercises');
      expect(res.is404).toBe(true);
      expect(res.allowed).toBe(false);
    });

    it('blocks hidden question sub-routes under /docs (/docs/react/intro/questions)', () => {
      const res = testProxy('/docs/react/intro/questions');
      expect(res.is404).toBe(true);
      expect(res.allowed).toBe(false);
    });

    it('blocks question ask sub-routes under /docs (/docs/react/intro/questions/ask)', () => {
      const res = testProxy('/docs/react/intro/questions/ask');
      expect(res.is404).toBe(true);
      expect(res.allowed).toBe(false);
    });
  });

  describe('Negative Tests — Path Variations, Attacks & Edge Cases', () => {
    it('blocks trailing slash variations of legacy paths (/blog/)', () => {
      const res = testProxy('/blog/');
      expect(res.is404).toBe(true);
    });

    it('blocks uppercase variations of legacy paths (/BLOG)', () => {
      const res = testProxy('/BLOG');
      expect(res.is404).toBe(true);
    });

    it('blocks uppercase course slug variations (/docs/React-Foundations)', () => {
      const res = testProxy('/docs/React-Foundations');
      expect(res.is404).toBe(true);
    });

    it('blocks query string variations on legacy routes (/account?tab=1)', () => {
      const res = testProxy('/account?tab=1');
      expect(res.is404).toBe(true);
    });

    it('blocks double slashes and malformed paths (/docs//react)', () => {
      const res = testProxy('/docs//react');
      expect(res.is404).toBe(true);
    });

    it('blocks path traversal attempts (/docs/../blog)', () => {
      const res = testProxy('/docs/../blog');
      expect(res.is404).toBe(true);
    });

    it('blocks invalid slug formats with special characters (/docs/react$1)', () => {
      const res = testProxy('/docs/react$1');
      expect(res.is404).toBe(true);
    });

    it('blocks excessively long slugs exceeding 100 characters', () => {
      const longSlug = 'a'.repeat(101);
      const res = testProxy(`/docs/${longSlug}`);
      expect(res.is404).toBe(true);
    });
  });

  describe('Framework & Static Asset Preservation', () => {
    it('allows Next.js static asset requests (/_next/static/chunks/main.js)', () => {
      const res = testProxy('/_next/static/chunks/main.js');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows Next.js image optimization endpoint (/_next/image?url=logo.png&w=64&q=75)', () => {
      const res = testProxy('/_next/image?url=logo.png&w=64&q=75');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows public image assets (/images/logo-light.svg)', () => {
      const res = testProxy('/images/logo-light.svg');
      expect(res.allowed).toBe(true);
      expect(res.is404).toBe(false);
    });

    it('allows favicon.ico and robots.txt', () => {
      expect(testProxy('/favicon.ico').allowed).toBe(true);
      expect(testProxy('/robots.txt').allowed).toBe(true);
      expect(testProxy('/sitemap.xml').allowed).toBe(true);
    });
  });

  describe('Phase 7 Admin Route Boundary Enforcement & NoIndex Headers', () => {
    const validId = '507f1f77bcf86cd799439011';

    function testAdminProxy(path: string) {
      const url = new URL(`http://localhost:3000${path}`);
      const request = new NextRequest(url);
      const response = proxy(request);
      const isRewrittenTo404 =
        response.headers.get('x-middleware-rewrite')?.includes('/_not-found') || false;
      return {
        allowed: !isRewrittenTo404,
        robotsHeader: response.headers.get('X-Robots-Tag'),
      };
    }

    const allowedAdminPaths = [
      '/admin',
      '/admin/login',
      '/admin/courses',
      '/admin/courses/new',
      `/admin/courses/${validId}`,
      `/admin/courses/${validId}/chapters`,
      `/admin/chapters/${validId}`,
      `/admin/lessons/${validId}`,
      '/admin/media',
      '/admin/pages',
      '/admin/pages/new',
      `/admin/pages/${validId}`,
      '/admin/settings',
      '/admin/users',
      `/admin/users/${validId}`,
      '/admin/revisions',
      '/admin/audit-logs',
    ];

    for (const p of allowedAdminPaths) {
      it(`allows admin route ${p} with X-Robots-Tag noindex`, () => {
        const res = testAdminProxy(p);
        expect(res.allowed).toBe(true);
        expect(res.robotsHeader).toBe('noindex, nofollow');
      });
    }

    const blockedAdminPaths = [
      '/admin/unknown-section',
      '/admin/courses/not-an-object-id',
      '/admin/courses/12345/lessons',
      `/admin/courses/${validId}/extra`,
      '/admin/chapters/invalid-id',
      '/admin/lessons/invalid-id',
      '/admin/pages/invalid-id',
      '/admin/users/invalid-id',
      '/admin/settings/advanced',
    ];

    for (const p of blockedAdminPaths) {
      it(`blocks unapproved admin path ${p} with 404 rewrite`, () => {
        const res = testAdminProxy(p);
        expect(res.allowed).toBe(false);
      });
    }
  });
});


import { describe, it, expect } from 'vitest';
import { getSiteUrl, buildPageMetadata, buildAbsoluteUrl } from '../../src/lib/seo';

describe('SEO Metadata & Dynamic Site URL Helpers', () => {
  it('resolves site URL from NEXT_PUBLIC_SITE_URL or APP_URL and falls back to https://techa.ir', () => {
    const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
    const prevApp = process.env.APP_URL;

    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.APP_URL;
    expect(getSiteUrl()).toBe('https://techa.ir');

    process.env.APP_URL = 'https://learn.techa.ir/';
    expect(getSiteUrl()).toBe('https://learn.techa.ir');

    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    expect(getSiteUrl()).toBe('http://localhost:3000');

    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-valid-url';
    process.env.APP_URL = 'invalid';
    expect(getSiteUrl()).toBe('https://techa.ir');

    if (prevSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevSite;
    if (prevApp === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = prevApp;
  });

  it('builds complete OpenGraph, Twitter Card, canonical, and indexable robots metadata', () => {
    const meta = buildPageMetadata({
      title: 'مستندات React 19 | تکا',
      description: 'آموزش جامع و عملی React 19 با مثال‌های تعاملی و اجرای زنده در مرورگر.',
      path: '/docs/react-19',
      type: 'article',
      keywords: ['React 19', 'تکا'],
    });

    expect(meta.title).toBe('مستندات React 19 | تکا');
    expect(meta.alternates?.canonical).toBe('/docs/react-19');
    expect(meta.openGraph).toMatchObject({ type: 'article', locale: 'fa_IR' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(meta.robots).toMatchObject({ index: true, follow: true });
    expect(buildAbsoluteUrl('/docs')).toContain('/docs');
  });

  it('marks auth utility pages noindex and nofollow cleanly', () => {
    const meta = buildPageMetadata({
      title: 'ورود به حساب کاربری | تکا',
      description: 'ورود به پلتفرم تکا',
      path: '/login',
      noIndex: true,
    });

    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});

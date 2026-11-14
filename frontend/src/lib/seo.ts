import type { Metadata } from 'next';

const FALLBACK_SITE_URL = 'https://techa.ir';

export const SEO_BRAND_NAME = 'تکا | TECHA';
export const SEO_DEFAULT_OG_IMAGE = '/images/aster.png';

/**
 * Resolves the canonical public origin for metadata, canonical links, OpenGraph,
 * robots.txt, sitemap.xml, and Schema.org structured data.
 */
export function getSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    FALLBACK_SITE_URL;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin.replace(/\/+$/, '');
    }
  } catch {
    // Fall back safely when an env var holds a malformed value
  }
  return FALLBACK_SITE_URL;
}

export function buildAbsoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${cleanPath}`;
}

export interface BuildSeoMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  type = 'website',
  keywords,
  image = SEO_DEFAULT_OG_IMAGE,
  noIndex = false,
}: BuildSeoMetadataInput): Metadata {
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;
  const absoluteUrl = buildAbsoluteUrl(canonicalPath);
  const absoluteImage = image.startsWith('http') ? image : buildAbsoluteUrl(image);

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: canonicalPath,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: 'TECHA',
      locale: 'fa_IR',
      type,
      images: [
        {
          url: absoluteImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImage],
    },
  };
}

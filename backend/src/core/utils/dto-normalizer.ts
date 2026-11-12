import { CourseIcon, ContentBlock } from '@techa/shared';

const PACKLESS_ICON_REGEX = /^[a-z0-9-]+$/;

/**
 * Normalizes legacy system icon names stored in MongoDB without a pack prefix
 * (e.g. "code-2") into valid CourseIcon DTOs ("lucide:code-2").
 */
export function normalizeCourseIcon(icon: CourseIcon | any): CourseIcon {
  if (!icon || typeof icon !== 'object') {
    return { kind: 'system', name: 'lucide:code-2' };
  }

  if (icon.kind === 'media' && typeof icon.storageKey === 'string') {
    return {
      kind: 'media',
      storageKey: icon.storageKey,
    };
  }

  const rawName = typeof icon.name === 'string' ? icon.name.trim() : '';
  if (!rawName) {
    return { kind: 'system', name: 'lucide:code-2' };
  }

  if (!rawName.includes(':') && PACKLESS_ICON_REGEX.test(rawName)) {
    return {
      kind: 'system',
      name: `lucide:${rawName}`,
    };
  }

  return {
    kind: 'system',
    name: rawName,
  };
}

/**
 * Sanitizes Mongoose subdocument artifacts inside content blocks (such as
 * empty `link: { openInNewTab: false }` objects on richText spans when no URL
 * was set) so every serialized block satisfies ContentBlockSchema strictly.
 */
export function normalizeContentBlocks(blocks: ContentBlock[] | any[] = []): ContentBlock[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    if (!block || block.type !== 'richText' || !Array.isArray(block.data?.spans)) {
      return block;
    }

    const normalizedSpans = block.data.spans.map((span: any) => {
      if (!span || typeof span !== 'object') return span;

      const linkUrl = typeof span.link?.url === 'string' ? span.link.url.trim() : '';
      if (!linkUrl) {
        const { link: _omitted, ...rest } = span;
        return rest;
      }

      return {
        ...span,
        link: {
          url: linkUrl,
          openInNewTab: Boolean(span.link?.openInNewTab),
        },
      };
    });

    return {
      ...block,
      data: {
        ...block.data,
        spans: normalizedSpans,
      },
    };
  });
}

/**
 * Strips incomplete Mongoose ctaButton subdocuments (e.g. `{ enabled: true }` with
 * undefined `label` or `url`) so header objects always satisfy PublicSiteSettingsDtoSchema.
 */
export function normalizeSiteHeader<T extends Record<string, any>>(header: T): T {
  if (!header || typeof header !== 'object') {
    return header;
  }

  const cta = header.ctaButton;
  if (!cta || typeof cta !== 'object') {
    return header;
  }

  const label = typeof cta.label === 'string' ? cta.label.trim() : '';
  const url = typeof cta.url === 'string' ? cta.url.trim() : '';

  if (!label || !url) {
    const { ctaButton: _omitted, ...rest } = header;
    return rest as T;
  }

  return {
    ...header,
    ctaButton: {
      label,
      url,
      enabled: Boolean(cta.enabled),
    },
  };
}


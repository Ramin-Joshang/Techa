import {
  CourseIcon,
  ContentBlock,
  CALLOUT_TYPES,
  CODE_LANGUAGES,
  StorageKeySchema,
  isSafeHttpUrl,
} from '@techa/shared';

const PACKLESS_ICON_REGEX = /^[a-z0-9-]+$/;
const VALID_CALLOUT_SET = new Set<string>(CALLOUT_TYPES);
const VALID_CODE_LANG_SET = new Set<string>(CODE_LANGUAGES);

const CODE_LANG_ALIASES: Record<string, string> = {
  text: 'markdown',
  plaintext: 'markdown',
  txt: 'markdown',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  tsql: 'sql',
  postgres: 'sql',
  mysql: 'sql',
};

function sanitizeRichTextLinkUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (isSafeHttpUrl(trimmed) || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
    return trimmed;
  }
  // Convert legacy relative course links like "../../tsql/162" or "../html/1" to safe root-relative paths
  const relMatch = trimmed.match(/^(?:\.\.\/)+([a-z0-9-]+)(?:\/.*)?$/i);
  if (relMatch && relMatch[1]) {
    return `/docs/${relMatch[1].toLowerCase()}`;
  }
  return null;
}

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
 * Sanitizes Mongoose subdocument artifacts and legacy schema drift inside content blocks
 * so every serialized block satisfies ContentBlockSchema strictly.
 */
export function normalizeContentBlocks(blocks: ContentBlock[] | any[] = []): ContentBlock[] {
  if (!Array.isArray(blocks)) return [];

  const normalized: ContentBlock[] = [];

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;

    if (block.type === 'richText' && Array.isArray(block.data?.spans)) {
      const normalizedSpans = block.data.spans
        .filter((span: any) => span && typeof span === 'object' && typeof span.text === 'string' && span.text.length > 0)
        .map((span: any) => {
          const { link: _rawLink, ...rest } = span;
          const safeUrl = sanitizeRichTextLinkUrl(span.link?.url);
          if (!safeUrl) {
            return rest;
          }
          return {
            ...rest,
            link: {
              url: safeUrl,
              openInNewTab: Boolean(span.link?.openInNewTab),
            },
          };
        });

      if (normalizedSpans.length === 0) continue;
      normalized.push({
        ...block,
        data: {
          ...block.data,
          spans: normalizedSpans,
        },
      });
      continue;
    }

    if (block.type === 'callout' && block.data) {
      const rawType = typeof block.data.type === 'string' ? block.data.type.trim() : 'info';
      const mappedType =
        rawType === 'success'
          ? 'tip'
          : VALID_CALLOUT_SET.has(rawType)
            ? rawType
            : 'info';
      const title = typeof block.data.title === 'string' ? block.data.title.trim() : '';
      const rawText = typeof block.data.text === 'string' ? block.data.text.trim() : '';
      const effectiveText = rawText || title;
      if (!effectiveText) continue;

      const { title: _oldTitle, ...restData } = block.data;
      normalized.push({
        ...block,
        data: {
          ...restData,
          type: mappedType,
          ...(title && rawText ? { title } : {}),
          text: effectiveText,
        },
      });
      continue;
    }

    if (block.type === 'codeBlock' && block.data) {
      const rawLang = typeof block.data.language === 'string' ? block.data.language.trim().toLowerCase() : 'typescript';
      const mappedLang = VALID_CODE_LANG_SET.has(rawLang)
        ? rawLang
        : CODE_LANG_ALIASES[rawLang] || 'markdown';
      const codeStr = typeof block.data.code === 'string' ? block.data.code : '';
      if (!codeStr) continue;

      const { title: _oldTitle, ...restData } = block.data;
      const trimmedTitle = typeof block.data.title === 'string' ? block.data.title.trim() : '';
      normalized.push({
        ...block,
        data: {
          ...restData,
          language: mappedLang,
          code: codeStr,
          ...(trimmedTitle ? { title: trimmedTitle } : {}),
        },
      });
      continue;
    }

    if (block.type === 'list' && block.data) {
      const cleanedItems = Array.isArray(block.data.items)
        ? block.data.items
            .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
            .filter((item: string) => item.length > 0)
        : [];
      if (cleanedItems.length === 0) continue;

      normalized.push({
        ...block,
        data: {
          ...block.data,
          format: block.data.format === 'ordered' ? 'ordered' : 'unordered',
          items: cleanedItems.slice(0, 50),
        },
      });
      continue;
    }

    if (block.type === 'image' && block.data) {
      const key = typeof block.data.storageKey === 'string' ? block.data.storageKey.trim() : '';
      if (!key || !StorageKeySchema.safeParse(key).success) {
        continue;
      }
      const { caption: _oldCaption, width: _oldW, height: _oldH, ...restData } = block.data;
      const caption = typeof block.data.caption === 'string' ? block.data.caption.trim() : '';
      normalized.push({
        ...block,
        data: {
          ...restData,
          storageKey: key,
          altText: (typeof block.data.altText === 'string' && block.data.altText.trim()) || 'تصویر آموزشی',
          ...(caption ? { caption } : {}),
          ...(typeof block.data.width === 'number' && block.data.width > 0 ? { width: block.data.width } : {}),
          ...(typeof block.data.height === 'number' && block.data.height > 0 ? { height: block.data.height } : {}),
        },
      });
      continue;
    }

    normalized.push(block);
  }

  return normalized;
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


import { describe, it, expect } from 'vitest';
import { CourseIconSchema, ContentBlockSchema, PublicSiteSettingsDtoSchema } from '@techa/shared';
import {
  normalizeContentBlocks,
  normalizeCourseIcon,
  normalizeSiteHeader,
} from '../../src/core/utils/dto-normalizer';

describe('DTO normalizers for legacy MongoDB records', () => {
  it('normalizes packless legacy system icon names into lucide:<name> matching CourseIconSchema', () => {
    const normalized = normalizeCourseIcon({ kind: 'system', name: 'code-2' });
    expect(normalized).toEqual({ kind: 'system', name: 'lucide:code-2' });
    expect(CourseIconSchema.safeParse(normalized).success).toBe(true);

    const prefixed = normalizeCourseIcon({ kind: 'system', name: 'lucide:server' });
    expect(prefixed).toEqual({ kind: 'system', name: 'lucide:server' });
    expect(CourseIconSchema.safeParse(prefixed).success).toBe(true);

    const media = normalizeCourseIcon({ kind: 'media', storageKey: 'courses/react/icon.svg' });
    expect(media).toEqual({ kind: 'media', storageKey: 'courses/react/icon.svg' });
    expect(CourseIconSchema.safeParse(media).success).toBe(true);
  });

  it('strips empty Mongoose link subdocuments from richText spans while preserving valid links', () => {
    const rawBlock = {
      id: 'blk_richtext_104',
      version: 1,
      type: 'richText',
      data: {
        spans: [
          {
            text: 'Plain span without URL',
            bold: false,
            link: { openInNewTab: false },
          },
          {
            text: 'Official Docs',
            bold: true,
            link: { url: 'https://react.dev', openInNewTab: true },
          },
        ],
      },
    };

    const [normalized] = normalizeContentBlocks([rawBlock]);
    const parsed = ContentBlockSchema.safeParse(normalized);
    expect(parsed.success).toBe(true);
    if (normalized.type === 'richText') {
      expect(normalized.data.spans[0].link).toBeUndefined();
      expect(normalized.data.spans[1].link).toEqual({
        url: 'https://react.dev',
        openInNewTab: true,
      });
    }
  });

  it('strips incomplete ctaButton objects from header settings', () => {
    const header = normalizeSiteHeader({
      logoText: 'تکا',
      navigationItems: [{ id: 'nav-1', label: 'خانه', path: '/', external: false, order: 1 }],
      ctaButton: { enabled: true },
    });
    expect(header.ctaButton).toBeUndefined();

    const parsed = PublicSiteSettingsDtoSchema.shape.header.safeParse(header);
    expect(parsed.success).toBe(true);
  });
});

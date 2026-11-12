import { describe, it, expect } from 'vitest';
import { ContentBlock } from '@techa/shared';
import {
  diffRevisionSnapshots,
  formatBytes,
  generateBlockId,
  prepareBlocksForPreview,
  resolvePreviewMediaUrl,
  toSafeSlug,
} from '../../src/lib/admin/admin-formatters';

describe('Phase 7 Revisions Diff, Media Preview Helpers & Formatters', () => {
  it('computes added, removed, changed, and unchanged revision snapshot diffs while ignoring metadata keys', () => {
    const older = {
      _id: '507f1f77bcf86cd799439011',
      __v: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      title: 'React Basics',
      level: 'beginner',
      deprecatedField: 'old',
      tags: ['react'],
    };

    const newer = {
      _id: '507f1f77bcf86cd799439011',
      __v: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
      title: 'React Fundamentals',
      level: 'beginner',
      tags: ['react', 'hooks'],
      seo: { metaTitle: 'React' },
    };

    const diffs = diffRevisionSnapshots(older, newer);
    const byKey = Object.fromEntries(diffs.map((d) => [d.key, d]));

    expect(byKey._id).toBeUndefined();
    expect(byKey.__v).toBeUndefined();
    expect(byKey.updatedAt).toBeUndefined();

    expect(byKey.title.status).toBe('changed');
    expect(byKey.title.beforeValue).toBe('React Basics');
    expect(byKey.title.afterValue).toBe('React Fundamentals');

    expect(byKey.level.status).toBe('unchanged');
    expect(byKey.deprecatedField.status).toBe('removed');
    expect(byKey.seo.status).toBe('added');
    expect(byKey.tags.status).toBe('changed');
  });

  it('resolves uploaded media storage keys to public preview URLs safely', () => {
    expect(resolvePreviewMediaUrl('media/lesson_image/hero.png')).toBe(
      '/api/v1/public/media/media/lesson_image/hero.png'
    );
    expect(resolvePreviewMediaUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png'
    );
    expect(resolvePreviewMediaUrl('/images/logo.svg')).toBe('/images/logo.svg');
    expect(resolvePreviewMediaUrl(undefined)).toBeUndefined();

    const blocks: ContentBlock[] = [
      {
        id: 'blk_img_preview_01',
        version: 1,
        type: 'image',
        data: { storageKey: 'media/lesson_image/img.webp', altText: 'img' },
      },
      {
        id: 'blk_vid_preview_01',
        version: 1,
        type: 'video',
        data: { storageKey: 'media/lesson_video/vid.mp4' },
      },
      {
        id: 'blk_div_preview_01',
        version: 1,
        type: 'divider',
        data: {},
      },
    ];

    const prepared = prepareBlocksForPreview(blocks);
    expect(prepared[0].type === 'image' && prepared[0].data.storageKey).toBe(
      '/api/v1/public/media/media/lesson_image/img.webp'
    );
    expect(prepared[1].type === 'video' && prepared[1].data.storageKey).toBe(
      '/api/v1/public/media/media/lesson_video/vid.mp4'
    );
  });

  it('formats byte sizes, generates valid blk_* IDs, and normalizes slugs', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');

    const blockId = generateBlockId();
    expect(blockId).toMatch(/^blk_[a-zA-Z0-9_-]{8,32}$/);

    expect(toSafeSlug('  React 19 & Next.js App Router!  ')).toBe('react-19-next-js-app-router');
  });
});

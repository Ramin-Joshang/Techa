import { describe, it, expect } from 'vitest';
import { CONTENT_BLOCK_TYPES, ContentBlock } from '@techa/shared';
import {
  PRESET_BY_ENVIRONMENT,
  cleanBlockBeforeSubmit,
  createDefaultBlock,
  duplicateBlock,
  getDefaultInteractiveFiles,
  inferInteractiveLanguageFromPath,
  validateBlocksWithSharedSchema,
} from '../../src/components/admin/content-editor/block-factories';

describe('Phase 7 13-Block Content Editor Factories & Shared Schema Validation', () => {
  it('creates valid default blocks for every one of the 13 content block types', () => {
    expect(CONTENT_BLOCK_TYPES).toHaveLength(13);

    const blocks: ContentBlock[] = CONTENT_BLOCK_TYPES.map((type) => {
      const block = createDefaultBlock(type);
      // Supply sample storageKeys for media-dependent block types
      if (block.type === 'image') {
        block.data.storageKey = 'media/lesson_image/sample.png';
        block.data.altText = 'تصویر نمونه';
      } else if (block.type === 'video') {
        block.data.storageKey = 'media/lesson_video/intro.mp4';
      } else if (block.type === 'downloadableFile') {
        block.data.storageKey = 'media/downloadable_asset/pack.zip';
      }
      return block;
    });

    const validation = validateBlocksWithSharedSchema(blocks);
    expect(validation.valid).toBe(true);
    expect(validation.arrayErrors).toEqual([]);
    expect(validation.blockErrors).toEqual({});
    expect(validation.totalBytes).toBeGreaterThan(0);
  });

  it('duplicates blocks with a distinct blk_* identifier without mutating original', () => {
    const original = createDefaultBlock('callout');
    const clone = duplicateBlock(original);

    expect(clone.id).not.toBe(original.id);
    expect(clone.id).toMatch(/^blk_[a-zA-Z0-9_-]{8,32}$/);
    expect(clone.type).toBe('callout');
    if (clone.type === 'callout' && original.type === 'callout') {
      clone.data.text = 'ویرایش شده در کپی';
      expect(original.data.text).not.toBe('ویرایش شده در کپی');
    }
  });

  it('strips empty optional properties during cleanBlockBeforeSubmit', () => {
    const quote = createDefaultBlock('quote');
    if (quote.type === 'quote') {
      quote.data.author = '   ';
      quote.data.citationUrl = '';
    }
    const cleaned = cleanBlockBeforeSubmit(quote);
    if (cleaned.type === 'quote') {
      expect(cleaned.data.author).toBeUndefined();
      expect(cleaned.data.citationUrl).toBeUndefined();
    }

    const rich = createDefaultBlock('richText');
    if (rich.type === 'richText') {
      rich.data.spans = [{ text: 'سلام', bold: true, link: { url: '  ', openInNewTab: true } }];
    }
    const cleanedRich = cleanBlockBeforeSubmit(rich);
    if (cleanedRich.type === 'richText') {
      expect(cleanedRich.data.spans[0].link).toBeUndefined();
    }
  });

  it('detects duplicate block IDs and missing required fields via shared schema', () => {
    const b1 = createDefaultBlock('heading');
    const b2 = createDefaultBlock('paragraph');
    b2.id = b1.id;

    const dupResult = validateBlocksWithSharedSchema([b1, b2]);
    expect(dupResult.valid).toBe(false);
    expect(dupResult.blockErrors[1]?.some((msg) => msg.includes('Duplicate'))).toBe(true);

    const brokenImage = createDefaultBlock('image'); // missing storageKey and altText
    const imgResult = validateBlocksWithSharedSchema([brokenImage]);
    expect(imgResult.valid).toBe(false);
    expect(imgResult.blockErrors[0]?.length).toBeGreaterThan(0);
  });

  it('builds default sandbox files, presets, and infers file languages properly', () => {
    expect(PRESET_BY_ENVIRONMENT['html-css-js']).toBe('preset-vanilla-v1');
    expect(PRESET_BY_ENVIRONMENT.react).toBe('preset-react-19-v1');
    expect(PRESET_BY_ENVIRONMENT['react-tailwind']).toBe('preset-react-tailwind-v1');

    const vanillaFiles = getDefaultInteractiveFiles('html-css-js');
    expect(vanillaFiles.map((f) => f.path)).toEqual(['index.html', 'styles.css', 'app.js']);
    expect(vanillaFiles.filter((f) => f.entryPoint)).toHaveLength(1);

    const reactFiles = getDefaultInteractiveFiles('react-tailwind');
    expect(reactFiles[0].path).toBe('App.jsx');
    expect(reactFiles[0].entryPoint).toBe(true);

    expect(inferInteractiveLanguageFromPath('Component.tsx')).toBe('typescript');
    expect(inferInteractiveLanguageFromPath('index.html')).toBe('html');
    expect(inferInteractiveLanguageFromPath('theme.css')).toBe('css');
    expect(inferInteractiveLanguageFromPath('package.json')).toBe('json');
    expect(inferInteractiveLanguageFromPath('main.js')).toBe('javascript');
  });
});

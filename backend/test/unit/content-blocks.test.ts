import { describe, it, expect } from 'vitest';
import {
  ContentBlockSchema,
  HeadingBlockSchema,
  TableBlockSchema,
  CodeBlockSchema,
  DividerBlockSchema,
} from '@techa/shared';

describe('Content Blocks Engine & Discriminated Union', () => {
  it('validates a valid heading block', () => {
    const valid = {
      id: 'blk_heading_12345678',
      version: 1,
      type: 'heading',
      data: {
        level: 2,
        text: 'بخش اول: معماری وب',
      },
    };
    const result = ContentBlockSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects heading level 1 or 5 (only 2, 3, 4 permitted)', () => {
    const invalid = {
      id: 'blk_heading_12345678',
      version: 1,
      type: 'heading',
      data: {
        level: 5,
        text: 'سطح غیرمجاز',
      },
    };
    const result = HeadingBlockSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects block version other than 1', () => {
    const invalid = {
      id: 'blk_heading_12345678',
      version: 2,
      type: 'heading',
      data: {
        level: 2,
        text: 'عنوان آزمایشی',
      },
    };
    const result = ContentBlockSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid block ID pattern (missing blk_ prefix or invalid length)', () => {
    const invalidIds = ['heading_12345678', 'blk_short', 'blk_!@#$%^&*()', '12345678'];
    for (const id of invalidIds) {
      const res = HeadingBlockSchema.safeParse({
        id,
        version: 1,
        type: 'heading',
        data: { level: 2, text: 'عنوان' },
      });
      expect(res.success).toBe(false);
    }
  });

  it('validates a valid table block with matching rows and headers', () => {
    const valid = {
      id: 'blk_table_12345678',
      version: 1,
      type: 'table',
      data: {
        headers: ['ویژگی', 'ری‌اکت', 'ویو'],
        rows: [
          ['نوع', 'کتابخانه', 'فریم‌ورک'],
          ['سازنده', 'متا', 'جامعه کاربری'],
        ],
      },
    };
    const result = TableBlockSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects table block when row cell count does not match header count', () => {
    const mismatched = {
      id: 'blk_table_12345678',
      version: 1,
      type: 'table',
      data: {
        headers: ['ستون ۱', 'ستون ۲', 'ستون ۳'], // 3 columns
        rows: [
          ['داده ۱', 'داده ۲'], // 2 cells -> mismatch!
        ],
      },
    };
    const result = TableBlockSchema.safeParse(mismatched);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/columns/i);
    }
  });

  it('validates codeBlock and rejects code exceeding 50 KB limit', () => {
    const valid = {
      id: 'blk_code_12345678',
      version: 1,
      type: 'codeBlock',
      data: {
        code: 'console.log("Hello World");',
        language: 'javascript',
        title: 'index.js',
        showLineNumbers: true,
      },
    };
    expect(CodeBlockSchema.safeParse(valid).success).toBe(true);

    // Code exceeding 50 KB
    const oversizedCode = 'a'.repeat(51 * 1024);
    const oversized = {
      ...valid,
      data: { ...valid.data, code: oversizedCode },
    };
    expect(CodeBlockSchema.safeParse(oversized).success).toBe(false);
  });

  it('validates divider block and rejects non-empty data', () => {
    const valid = {
      id: 'blk_divider_12345678',
      version: 1,
      type: 'divider',
      data: {},
    };
    expect(DividerBlockSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      id: 'blk_divider_12345678',
      version: 1,
      type: 'divider',
      data: { color: 'red' }, // Extra fields rejected by .strict()
    };
    expect(DividerBlockSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects unknown content block types', () => {
    const unknownBlock = {
      id: 'blk_unknown_12345678',
      version: 1,
      type: 'flashcard',
      data: { question: 'Q', answer: 'A' },
    };
    expect(ContentBlockSchema.safeParse(unknownBlock).success).toBe(false);
  });
});

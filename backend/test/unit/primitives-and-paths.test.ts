import { describe, it, expect } from 'vitest';
import {
  SlugSchema,
  StorageKeySchema,
  ObjectIdSchema,
  CourseIconSchema,
} from '@techa/shared';

describe('Primitive Schemas & Path Security', () => {
  describe('SlugSchema', () => {
    it('accepts valid slugs', () => {
      const valid = ['react', 'next-js-15', 'full-stack-web-dev', 'python-3-basics'];
      for (const slug of valid) {
        const result = SlugSchema.safeParse(slug);
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid slugs', () => {
      const invalid = [
        'React', // uppercase
        'next js', // spaces
        '-leading-hyphen', // leading hyphen
        'trailing-hyphen-', // trailing hyphen
        'double--hyphen', // double hyphens
        'under_score', // underscore
        'special!char', // special chars
        '', // empty
      ];
      for (const slug of invalid) {
        const result = SlugSchema.safeParse(slug);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('StorageKeySchema', () => {
    it('accepts valid storage keys', () => {
      const valid = [
        'courses/react/icon.svg',
        'courses/python/cover.webp',
        'lessons/intro/schema.png',
        'attachments/file_123.pdf',
      ];
      for (const key of valid) {
        const result = StorageKeySchema.safeParse(key);
        expect(result.success).toBe(true);
      }
    });

    it('rejects path traversal attempts (..)', () => {
      const traversals = [
        '../secrets/passwords.txt',
        'courses/../../etc/passwd',
        'lessons/./file.png',
        'courses/react/../cover.png',
      ];
      for (const key of traversals) {
        const result = StorageKeySchema.safeParse(key);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toMatch(/traversal/i);
        }
      }
    });

    it('rejects leading slash and backslashes', () => {
      const invalid = [
        '/courses/react/icon.svg',
        'courses\\react\\icon.svg',
        'courses//react/icon.svg',
        'courses/react/icon.svg/',
      ];
      for (const key of invalid) {
        const result = StorageKeySchema.safeParse(key);
        expect(result.success).toBe(false);
      }
    });

    it('rejects null bytes', () => {
      const keyWithNull = 'courses/react\0/icon.svg';
      const result = StorageKeySchema.safeParse(keyWithNull);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/null bytes/i);
      }
    });
  });

  describe('ObjectIdSchema', () => {
    it('accepts valid 24-hex string', () => {
      expect(ObjectIdSchema.safeParse('507f1f77bcf86cd799439011').success).toBe(true);
    });

    it('rejects invalid length or non-hex characters', () => {
      expect(ObjectIdSchema.safeParse('invalid-id').success).toBe(false);
      expect(ObjectIdSchema.safeParse('507f1f77bcf86cd79943901z').success).toBe(false);
      expect(ObjectIdSchema.safeParse('507f1f77bcf86cd79943901').success).toBe(false); // 23 chars
    });
  });

  describe('CourseIconSchema', () => {
    it('accepts valid system icon', () => {
      const result = CourseIconSchema.safeParse({
        kind: 'system',
        name: 'lucide:code-2',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid media icon', () => {
      const result = CourseIconSchema.safeParse({
        kind: 'media',
        storageKey: 'courses/react/icon.svg',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid icon kinds or missing keys', () => {
      expect(CourseIconSchema.safeParse({ kind: 'url', url: 'https://cdn.com/icon.svg' }).success).toBe(false);
      expect(CourseIconSchema.safeParse({ kind: 'media', storageKey: '/invalid/path' }).success).toBe(false);
    });
  });
});

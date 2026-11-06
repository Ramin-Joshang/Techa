import { describe, it, expect } from 'vitest';
import { InteractiveExampleDataSchema } from '@techa/shared';

describe('Interactive Example Schema & Path Security', () => {
  const baseValidExample = {
    environment: 'react' as const,
    preset: 'preset-react-19-v1' as const,
    title: 'شمارنده ساده با هوک useState',
    description: 'یک کامپوننت ساده برای یادگیری شمارش در ری‌اکت',
    files: [
      {
        path: 'src/Counter.jsx',
        language: 'javascript' as const,
        content: 'export default function Counter() { return <button>0</button>; }',
        entryPoint: true,
        readOnly: false,
      },
      {
        path: 'src/styles.css',
        language: 'css' as const,
        content: 'button { background: blue; }',
        entryPoint: false,
        readOnly: true,
      },
    ],
  };

  it('accepts valid multi-file interactive example', () => {
    const result = InteractiveExampleDataSchema.safeParse(baseValidExample);
    expect(result.success).toBe(true);
  });

  describe('Path Traversal & Security', () => {
    it('rejects path with ".." traversal', () => {
      const invalid = {
        ...baseValidExample,
        files: [
          {
            path: '../Counter.jsx',
            language: 'javascript' as const,
            content: 'console.log("bad");',
            entryPoint: true,
          },
        ],
      };
      const result = InteractiveExampleDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/traversal/i);
      }
    });

    it('rejects leading slash (absolute paths)', () => {
      const invalid = {
        ...baseValidExample,
        files: [
          {
            path: '/src/Counter.jsx',
            language: 'javascript' as const,
            content: 'console.log("bad");',
            entryPoint: true,
          },
        ],
      };
      expect(InteractiveExampleDataSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects backslashes', () => {
      const invalid = {
        ...baseValidExample,
        files: [
          {
            path: 'src\\Counter.jsx',
            language: 'javascript' as const,
            content: 'console.log("bad");',
            entryPoint: true,
          },
        ],
      };
      expect(InteractiveExampleDataSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects empty path segments (//)', () => {
      const invalid = {
        ...baseValidExample,
        files: [
          {
            path: 'src//Counter.jsx',
            language: 'javascript' as const,
            content: 'console.log("bad");',
            entryPoint: true,
          },
        ],
      };
      expect(InteractiveExampleDataSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects null bytes in path', () => {
      const invalid = {
        ...baseValidExample,
        files: [
          {
            path: 'src/Counter\0.jsx',
            language: 'javascript' as const,
            content: 'console.log("bad");',
            entryPoint: true,
          },
        ],
      };
      expect(InteractiveExampleDataSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Entry Point & Environment Rules', () => {
    it('rejects project with zero entry points', () => {
      const invalid = {
        ...baseValidExample,
        files: baseValidExample.files.map((f) => ({ ...f, entryPoint: false })),
      };
      const result = InteractiveExampleDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/exactly one entryPoint/i);
      }
    });

    it('rejects project with multiple entry points', () => {
      const invalid = {
        ...baseValidExample,
        files: baseValidExample.files.map((f) => ({ ...f, entryPoint: true })),
      };
      const result = InteractiveExampleDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/entry points; exactly 1 is allowed/i);
      }
    });

    it('rejects duplicate file paths case-insensitively', () => {
      const invalid = {
        ...baseValidExample,
        files: [
          {
            path: 'src/App.jsx',
            language: 'javascript' as const,
            content: 'export default function A() {}',
            entryPoint: true,
          },
          {
            path: 'src/app.jsx', // case-insensitive duplicate!
            language: 'javascript' as const,
            content: 'export default function B() {}',
            entryPoint: false,
          },
        ],
      };
      const result = InteractiveExampleDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Duplicate file path/i);
      }
    });

    it('rejects wrong entry point extension for environment', () => {
      // In html-css-js environment, entryPoint MUST be .html
      const invalid = {
        environment: 'html-css-js' as const,
        preset: 'preset-vanilla-v1' as const,
        title: 'وانیلا جاوااسکریپت',
        files: [
          {
            path: 'index.js',
            language: 'javascript' as const,
            content: 'console.log("hello");',
            entryPoint: true, // Should be index.html!
          },
        ],
      };
      const result = InteractiveExampleDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Entry point extension/i);
      }
    });

    it('rejects project exceeding 256,000 UTF-8 bytes limit', () => {
      const largeContent = 'x'.repeat(45 * 1024); // 45 KB per file
      const invalid = {
        ...baseValidExample,
        files: [
          { path: 'f1.js', language: 'javascript' as const, content: largeContent, entryPoint: true },
          { path: 'f2.js', language: 'javascript' as const, content: largeContent, entryPoint: false },
          { path: 'f3.js', language: 'javascript' as const, content: largeContent, entryPoint: false },
          { path: 'f4.js', language: 'javascript' as const, content: largeContent, entryPoint: false },
          { path: 'f5.js', language: 'javascript' as const, content: largeContent, entryPoint: false },
          { path: 'f6.js', language: 'javascript' as const, content: largeContent, entryPoint: false },
        ], // 6 * 45 = 270 KB > 256 KB limit
      };
      const result = InteractiveExampleDataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/256,000 UTF-8 bytes/i);
      }
    });
  });
});

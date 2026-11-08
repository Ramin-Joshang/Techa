import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Frontend Architecture, Security & Anti-Regression Guardrails', () => {
  const frontendSrcDir = path.resolve(__dirname, '../../src');
  const rootDir = path.resolve(__dirname, '../../..');

  it('verifies ZERO direct Mongoose or MongoDB imports exist anywhere in frontend/src', () => {
    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content).not.toMatch(/from\s+['"]mongoose['"]/);
          expect(content).not.toMatch(/from\s+['"]mongodb['"]/);
          expect(content).not.toMatch(/require\(['"]mongoose['"]\)/);
          expect(content).not.toMatch(/require\(['"]mongodb['"]\)/);
        }
      }
    }

    checkDir(frontendSrcDir);
  });

  it('verifies TECHA_API_BASE_URL is server-only and not leaked as NEXT_PUBLIC_', () => {
    const envExamplePath = path.join(rootDir, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      expect(content).toContain('TECHA_API_BASE_URL=');
      expect(content).not.toContain('NEXT_PUBLIC_TECHA_API_BASE_URL');
      expect(content).not.toContain('NEXT_PUBLIC_MONGODB_URI');
    }
    expect(process.env.NEXT_PUBLIC_TECHA_API_BASE_URL).toBeUndefined();
    expect(process.env.NEXT_PUBLIC_MONGODB_URI).toBeUndefined();
  });

  it('verifies all 4 approved public route files exist and are present in App Router', () => {
    const route1 = path.join(frontendSrcDir, 'app/page.js');
    const route2 = path.join(frontendSrcDir, 'app/docs/page.js');
    const route3 = path.join(frontendSrcDir, 'app/docs/[slug]/page.js');
    const route4 = path.join(frontendSrcDir, 'app/docs/[slug]/[lessonId]/page.js');

    expect(fs.existsSync(route1)).toBe(true);
    expect(fs.existsSync(route2)).toBe(true);
    expect(fs.existsSync(route3)).toBe(true);
    expect(fs.existsSync(route4)).toBe(true);
  });

  it('verifies ContentBlocksRenderer does not use eval, Function constructor, or iframe srcdoc', () => {
    const rendererPath = path.join(frontendSrcDir, 'components/docs/content/ContentBlocksRenderer.tsx');
    const content = fs.readFileSync(rendererPath, 'utf8');
    expect(content).not.toContain('eval(');
    expect(content).not.toContain('new Function(');
    expect(content).not.toContain('srcDoc');
    expect(content).not.toContain('srcdoc');
  });
});

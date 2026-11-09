import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Legacy Backend Exclusion and Architecture Cutover Tests', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const frontendSrcDir = path.resolve(__dirname, '../../src');
  const legacyArchiveDir = path.resolve(frontendSrcDir, 'legacy-archive');

  function getFilesRecursively(dir: string, excludeDirs: string[] = []): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(fullPath)) {
          results.push(...getFilesRecursively(fullPath, excludeDirs));
        }
      } else if (/\.(js|jsx|ts|tsx|mjs|cjs|json)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  it('verifies ZERO occurrences of pool.techa.ir in active frontend/src (excluding legacy-archive)', () => {
    const activeFiles = getFilesRecursively(frontendSrcDir, [legacyArchiveDir]);
    expect(activeFiles.length).toBeGreaterThan(0);

    const violations: { file: string; line: number; match: string }[] = [];
    for (const file of activeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('pool.techa.ir')) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('pool.techa.ir')) {
            violations.push({
              file: path.relative(rootDir, file),
              line: index + 1,
              match: line.trim(),
            });
          }
        });
      }
    }

    expect(violations).toEqual([]);
  });

  it('verifies ZERO references to legacy SQL procedures (ExecuteTSql, ExecuteStoredProcedure, SP_fetch) in active frontend/src', () => {
    const activeFiles = getFilesRecursively(frontendSrcDir, [legacyArchiveDir]);
    const forbiddenPatterns = [
      'ExecuteTSql',
      'ExecuteStoredProcedure',
      'SP_fetch',
      'tedious',
      'mssql',
    ];

    const violations: { file: string; pattern: string }[] = [];
    for (const file of activeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (content.includes(pattern)) {
          violations.push({ file: path.relative(rootDir, file), pattern });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('verifies next.config.mjs does NOT configure pool.techa.ir in remotePatterns or rewrites', () => {
    const nextConfigPath = path.resolve(frontendSrcDir, '../next.config.mjs');
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    expect(content).not.toContain('pool.techa.ir');
  });

  it('verifies frontend package.json does not depend on mssql or tedious', () => {
    const pkgPath = path.resolve(frontendSrcDir, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    expect(allDeps.mssql).toBeUndefined();
    expect(allDeps.tedious).toBeUndefined();
  });

  it('verifies root .env.example does not contain pool.techa.ir and specifies port 5000 for backend and 3000 for frontend', () => {
    const envExamplePath = path.resolve(rootDir, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      expect(content).not.toContain('pool.techa.ir');
      expect(content).toContain('5000');
      expect(content).toContain('3000');
    }
  });

  it('verifies frontend public API client points exclusively to Greenfield backend port 5000', () => {
    const apiConfigPath = path.resolve(frontendSrcDir, 'lib/server/api-config.ts');
    const content = fs.readFileSync(apiConfigPath, 'utf8');
    expect(content).toContain('http://127.0.0.1:5000/api/v1/public');
    expect(content).not.toContain('pool.techa.ir');
  });
});

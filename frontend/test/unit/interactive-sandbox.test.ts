import { describe, it, expect } from 'vitest';
import * as Babel from '@babel/standalone';
import {
  buildIsolatedSandboxDocument,
  generateTailwindUtilitiesCss,
  injectLoopGuard,
} from '../../src/components/docs/content/sandbox-compiler';
import { extractLessonHeadings } from '../../src/components/docs/content/heading-utils';
import { parseStructuredProse } from '../../src/components/docs/content/prose-parser';
import { buildSandboxPayloadFromCodeBlock } from '../../src/components/docs/content/sandbox-helpers';
import { ContentBlock } from '@techa/shared';

describe('InteractiveSandbox Compiler, Security & Lesson Heading Utilities', () => {
  it('compiles html-css-js runtime with restrictive CSP and console bridge', () => {
    const result = buildIsolatedSandboxDocument({
      instanceId: 'inst_html_1',
      environment: 'html-css-js',
      files: [
        { path: 'index.html', language: 'html', content: '<h1 id="out">سلام</h1>', entryPoint: true },
        { path: 'style.css', language: 'css', content: '#out { color: green; }', entryPoint: false },
        { path: 'app.js', language: 'javascript', content: 'console.log("ready");', entryPoint: false },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.html).toContain("default-src 'none'");
    expect(result.html).toContain('<h1 id="out">سلام</h1>');
    expect(result.html).toContain('#out { color: green; }');
    expect(result.html).toContain('console.log("ready")');
    expect(result.html).not.toContain('unpkg.com');
    expect(result.html).not.toContain('cdn.tailwindcss.com');
  });

  it('extracts head styles, body content, and inline scripts from full HTML5 documents cleanly', () => {
    const fullDoc = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <style>h1 { color: teal; }</style>
</head>
<body>
  <h1>صفحه نمونه</h1>
  <script>console.log("from-inline-script");</script>
</body>
</html>`;

    const result = buildIsolatedSandboxDocument({
      instanceId: 'inst_full_html',
      environment: 'html-css-js',
      files: [{ path: 'index.html', language: 'html', content: fullDoc, entryPoint: true }],
    });

    expect(result.ok).toBe(true);
    expect(result.html).toContain('lang="fa" dir="rtl"');
    expect(result.html).toContain('h1 { color: teal; }');
    expect(result.html).toContain('<h1>صفحه نمونه</h1>');
    expect(result.html).toContain('console.log("from-inline-script")');
    expect(result.html.match(/<!DOCTYPE html>/gi)?.length).toBe(1);
  });

  it('compiles React 19 + TypeScript example using @babel/standalone and local runtime', () => {
    const result = buildIsolatedSandboxDocument({
      instanceId: 'inst_react_1',
      environment: 'react',
      reactRuntimeBundle: '/* mock-react-runtime */',
      babel: Babel as unknown as { transform: (c: string, o: Record<string, unknown>) => { code?: string | null } },
      files: [
        {
          path: 'App.tsx',
          language: 'typescript',
          entryPoint: true,
          content: `
            import React, { useState } from 'react';
            export default function CounterApp() {
              const [count, setCount] = useState<number>(0);
              return <div className="p-6 bg-slate-900 text-white rounded-2xl">{count}</div>;
            }
          `,
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.html).toContain('/* mock-react-runtime */');
    expect(result.html).toContain('React.createElement');
    expect(result.html).toContain('.p-6 { padding: 1.5rem; }');
    expect(result.html).toContain('.bg-slate-900 { background-color: #0f172a; }');
    expect(result.html).not.toContain('unpkg.com');
  });

  it('compiles react-tailwind utilities including hover and responsive variants', () => {
    const css = generateTailwindUtilitiesCss(
      'className="flex flex-col md:flex-row gap-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"'
    );
    expect(css).toContain('display: flex;');
    expect(css).toContain('flex-direction: column;');
    expect(css).toContain('@media (min-width: 768px)');
    expect(css).toContain('.hover\\:bg-emerald-500:hover { background-color: #10b981; }');
  });

  it('reports compile syntax errors gracefully without crashing', () => {
    const result = buildIsolatedSandboxDocument({
      instanceId: 'inst_err_1',
      environment: 'react-tailwind',
      reactRuntimeBundle: '/* runtime */',
      babel: Babel as unknown as { transform: (c: string, o: Record<string, unknown>) => { code?: string | null } },
      files: [
        {
          path: 'App.tsx',
          language: 'typescript',
          entryPoint: true,
          content: 'export default function Broken() { return <div><span></div>; }',
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errorMessage).toBeTruthy();
    expect(result.html).toContain('خطای کامپایل کد');
  });

  it('rejects non-whitelisted execution environments', () => {
    const result = buildIsolatedSandboxDocument({
      instanceId: 'inst_bad_env',
      environment: 'python' as unknown as 'react',
      files: [{ path: 'main.py', language: 'python', content: 'print(1)', entryPoint: true }],
    });

    expect(result.ok).toBe(false);
    expect(result.errorMessage).toContain('مجاز نیست');
  });

  it('injects loop guard to prevent infinite while loops from hanging', () => {
    const guarded = injectLoopGuard('let x = 0; while (true) { x++; }');
    expect(guarded).toContain('__techaTick()');
    expect(() => {
      // Execute the injected guard function in strict isolated check
      const runner = new Function(`${guarded}; return typeof __techaTick;`);
      runner();
    }).toThrow('حلقه بی‌نهایت');
  });

  it('escapes closing script tags inside user code strings to prevent HTML breakout', () => {
    const result = buildIsolatedSandboxDocument({
      instanceId: 'inst_xss_1',
      environment: 'html-css-js',
      files: [
        { path: 'index.html', language: 'html', content: '<div id="x"></div>', entryPoint: true },
        { path: 'app.js', language: 'javascript', content: 'const s = "</script><script>alert(1)</script>";', entryPoint: false },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.html).not.toContain('"</script><script>');
  });

  it('extracts deterministic non-colliding heading anchors for lesson Table of Contents', () => {
    const blocks: ContentBlock[] = [
      { id: 'h1', version: 1, type: 'heading', data: { level: 2, text: 'مقدمه' } },
      { id: 'h2', version: 1, type: 'heading', data: { level: 3, text: 'نصب ابزار' } },
      { id: 'h3', version: 1, type: 'heading', data: { level: 2, text: 'مقدمه' } },
    ];

    const headings = extractLessonHeadings(blocks);
    expect(headings).toEqual([
      { id: 'مقدمه', text: 'مقدمه', level: 2 },
      { id: 'نصب-ابزار', text: 'نصب ابزار', level: 3 },
      { id: 'مقدمه-2', text: 'مقدمه', level: 2 },
    ]);
  });

  it('splits inline bulleted prose strings into paragraph and stacked list segments', () => {
    const parsed = parseStructuredProse(
      'اهداف یادگیری این جلسه: • درک مفهوم HTML و نقش آن در ساخت وب‌سایت‌ها • آشنایی با تاریخچه و نسخه‌های مختلف HTML • شناخت تفاوت‌های HTML، CSS و JavaScript'
    );

    expect(parsed).toEqual([
      { kind: 'paragraph', text: 'اهداف یادگیری این جلسه:' },
      {
        kind: 'list',
        ordered: false,
        items: [
          'درک مفهوم HTML و نقش آن در ساخت وب‌سایت‌ها',
          'آشنایی با تاریخچه و نسخه‌های مختلف HTML',
          'شناخت تفاوت‌های HTML، CSS و JavaScript',
        ],
      },
    ]);
  });

  it('builds runnable multi-file sandbox payload from JavaScript codeBlock', () => {
    const payload = buildSandboxPayloadFromCodeBlock({
      code: 'console.log("hello techa");',
      language: 'javascript',
      title: 'مثال کنسول',
    });

    expect(payload.environment).toBe('html-css-js');
    expect(payload.files.some((f) => f.path === 'script.js' && f.entryPoint)).toBe(true);
    expect(payload.files.some((f) => f.path === 'index.html')).toBe(true);
  });
});

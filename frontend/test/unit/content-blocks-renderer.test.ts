import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ContentBlocksRenderer from '../../src/components/docs/content/ContentBlocksRenderer';
import { ContentBlock } from '@techa/shared';

describe('ContentBlocksRenderer (All 13 Content Blocks)', () => {
  it('renders heading block with level 2', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_heading_01',
        version: 1,
        type: 'heading',
        data: { level: 2, text: 'سرفصل اصلی' },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('<h2');
    expect(html).toContain('سرفصل اصلی');
  });

  it('renders paragraph block', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_para_01',
        version: 1,
        type: 'paragraph',
        data: { text: 'این یک پاراگراف متنی نمونه است.' },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('<p');
    expect(html).toContain('این یک پاراگراف متنی نمونه است.');
  });

  it('renders richText block with safe link and bold formatting, sanitizing dangerous protocols', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_rich_01',
        version: 1,
        type: 'richText',
        data: {
          spans: [
            { text: 'متن پررنگ', bold: true },
            { text: 'پیوند امن', link: { url: 'https://techa.ir', openInNewTab: true } },
            { text: 'کد ناامن', link: { url: 'javascript:alert(1)' } },
          ],
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('متن پررنگ');
    expect(html).toContain('<strong class="font-bold text-gray-900">');
    expect(html).toContain('href="https://techa.ir"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    // Dangerous javascript: link must NOT be rendered as <a>
    expect(html).not.toContain('href="javascript:alert(1)"');
    expect(html).toContain('کد ناامن');
  });

  it('renders codeBlock statically without running code', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_code_01',
        version: 1,
        type: 'codeBlock',
        data: {
          code: 'const greeting = "سلام جهان";\nconsole.log(greeting);',
          language: 'javascript',
          title: 'app.js',
          showLineNumbers: true,
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    const plainText = html.replace(/<[^>]+>/g, '');
    expect(html).toContain('app.js');
    expect(html).toContain('javascript');
    expect(plainText).toContain('const greeting = &quot;سلام جهان&quot;;');
    // Zero script execution tags
    expect(html).not.toContain('<script');
  });

  it('renders image block with storageKey and altText', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_img_01',
        version: 1,
        type: 'image',
        data: {
          storageKey: 'courses/react/hero.png',
          altText: 'تصویر معماری ری‌اکت',
          caption: 'نمودار جریان داده یک‌طرفه',
          width: 800,
          height: 600,
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('تصویر معماری ری‌اکت');
    expect(html).toContain('نمودار جریان داده یک‌طرفه');
    expect(html).toContain('courses/react/hero.png');
  });

  it('renders video block with storageKey and duration', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_video_01',
        version: 1,
        type: 'video',
        data: {
          storageKey: 'courses/react/intro.mp4',
          durationSeconds: 360,
          caption: 'جلسه معرفی',
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('courses/react/intro.mp4');
    expect(html).toContain('مدت زمان: 6 دقیقه');
  });

  it('renders table block with header and rows', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_tbl_01',
        version: 1,
        type: 'table',
        data: {
          headers: ['مفهوم', 'کاربرد'],
          rows: [
            ['State', 'مدیریت وضعیت داخلی'],
            ['Props', 'ارسال داده به فرزند'],
          ],
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('<table');
    expect(html).toContain('State');
    expect(html).toContain('Props');
    expect(html).toContain('مدیریت وضعیت داخلی');
  });

  it('renders callout blocks with appropriate alert styling', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_callout_01',
        version: 1,
        type: 'callout',
        data: {
          type: 'tip',
          title: 'نکته مهم',
          text: 'همیشه از هوک‌ها در سطح بالای کامپوننت استفاده کنید.',
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('نکته مهم');
    expect(html).toContain('همیشه از هوک‌ها در سطح بالای کامپوننت استفاده کنید.');
  });

  it('renders quote block with citation and author', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_quote_01',
        version: 1,
        type: 'quote',
        data: {
          text: 'سادگی پیش‌نیاز قابلیت اطمینان است.',
          author: 'ادسخر دایکسترا',
          citationUrl: 'https://example.com/quote',
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('«سادگی پیش‌نیاز قابلیت اطمینان است.»');
    expect(html).toContain('ادسخر دایکسترا');
  });

  it('renders divider block', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_div_01',
        version: 1,
        type: 'divider',
        data: {},
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('<hr');
  });

  it('renders downloadableFile block', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_file_01',
        version: 1,
        type: 'downloadableFile',
        data: {
          storageKey: 'exercises/starter-pack.zip',
          title: 'پروژه استارتر',
          sizeBytes: 1048576, // 1 MB
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('پروژه استارتر');
    expect(html).toContain('1.0 MB');
    expect(html).toContain('exercises/starter-pack.zip');
  });

  it('renders list block (ordered and unordered)', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_list_01',
        version: 1,
        type: 'list',
        data: {
          format: 'ordered',
          items: ['نصب Node.js', 'ایجاد پروژه Next.js', 'اجرای سرور'],
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('<ol');
    expect(html).toContain('نصب Node.js');
    expect(html).toContain('ایجاد پروژه Next.js');
  });

  it('renders interactiveExample block cleanly on SSR with zero script injection or unsafe iframe markup', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'blk_interactive_01',
        version: 1,
        type: 'interactiveExample',
        data: {
          title: 'کامپوننت نمونه',
          environment: 'react',
          preset: 'preset-react-19-v1',
          files: [
            {
              path: 'App.jsx',
              language: 'javascript',
              content: 'export default function App() { return <h1>سلام</h1>; }',
              entryPoint: true,
              readOnly: false,
            },
            {
              path: 'index.css',
              language: 'css',
              content: 'body { margin: 0; }',
              entryPoint: false,
              readOnly: true,
            },
          ],
        },
      },
    ];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('کامپوننت نمونه');
    expect(html).toContain('React 19');
    expect(html).toContain('App.jsx');
    expect(html).toContain('index.css');
    expect(html).toContain('export default function App()');
    // Ensure SSR markup waits for client mount before attaching sandbox iframe and never injects script/srcdoc
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('srcdoc');
    expect(html).not.toContain('<script');
  });

  it('renders safe fallback for unsupported block type without crashing', () => {
    const blocks = [
      {
        id: 'blk_unknown_99',
        version: 2,
        type: 'futureAiChatBlock',
        data: {},
      },
    ] as unknown as ContentBlock[];

    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks }));
    expect(html).toContain('این بلوک محتوایی با نوع «futureAiChatBlock» و نسخه 2 در این مرحله پشتیبانی نمی‌شود');
  });

  it('renders graceful empty state when blocks array is empty', () => {
    const html = renderToStaticMarkup(React.createElement(ContentBlocksRenderer, { blocks: [] }));
    expect(html).toContain('محتوای متنی برای این درس ثبت نشده است');
  });
});

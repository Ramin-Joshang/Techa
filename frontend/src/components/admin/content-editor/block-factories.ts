import {
  AdminContentBlocksArraySchema,
  ContentBlock,
  ContentBlockType,
  InteractiveEnvironment,
  InteractiveFile,
  InteractivePreset,
  getUtf8ByteLength,
} from '@techa/shared';
import { generateBlockId } from '../../../lib/admin/admin-formatters';

export const PRESET_BY_ENVIRONMENT: Record<InteractiveEnvironment, InteractivePreset> = {
  'html-css-js': 'preset-vanilla-v1',
  react: 'preset-react-19-v1',
  'react-tailwind': 'preset-react-tailwind-v1',
};

export function getDefaultInteractiveFiles(env: InteractiveEnvironment): InteractiveFile[] {
  if (env === 'html-css-js') {
    return [
      {
        path: 'index.html',
        language: 'html',
        content: '<div class="card">\n  <h2>سلام تکا</h2>\n  <p id="msg">روی دکمه کلیک کنید</p>\n  <button id="btn">اجرا</button>\n</div>',
        entryPoint: true,
        readOnly: false,
      },
      {
        path: 'styles.css',
        language: 'css',
        content: '.card {\n  padding: 16px;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}',
        entryPoint: false,
        readOnly: false,
      },
      {
        path: 'app.js',
        language: 'javascript',
        content: 'document.getElementById("btn")?.addEventListener("click", () => {\n  document.getElementById("msg").textContent = "کد با موفقیت اجرا شد!";\n});',
        entryPoint: false,
        readOnly: false,
      },
    ];
  }

  return [
    {
      path: 'App.jsx',
      language: 'javascript',
      content:
        env === 'react-tailwind'
          ? 'export default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-4 rounded-lg border border-slate-200">\n      <h2 className="font-bold text-lg mb-2">نمونه تعاملی React + Tailwind</h2>\n      <button\n        onClick={() => setCount((c) => c + 1)}\n        className="px-3 py-1.5 bg-emerald-700 text-white rounded"\n      >\n        شمارش: {count}\n      </button>\n    </div>\n  );\n}'
          : 'export default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div style={{ padding: 16 }}>\n      <h2>نمونه تعاملی React</h2>\n      <button onClick={() => setCount((c) => c + 1)}>شمارش: {count}</button>\n    </div>\n  );\n}',
      entryPoint: true,
      readOnly: false,
    },
  ];
}

export function inferInteractiveLanguageFromPath(
  path: string
): 'javascript' | 'typescript' | 'html' | 'css' | 'json' {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  if (ext === 'html') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  if (ext === 'ts' || ext === 'tsx') return 'typescript';
  return 'javascript';
}

export function createDefaultBlock(type: ContentBlockType): ContentBlock {
  const id = generateBlockId();
  switch (type) {
    case 'heading':
      return { id, version: 1, type: 'heading', data: { level: 2, text: 'تیتر بخش جدید' } };
    case 'paragraph':
      return { id, version: 1, type: 'paragraph', data: { text: 'متن پاراگراف جدید...' } };
    case 'richText':
      return {
        id,
        version: 1,
        type: 'richText',
        data: { spans: [{ text: 'متن نمونه غنی' }] },
      };
    case 'codeBlock':
      return {
        id,
        version: 1,
        type: 'codeBlock',
        data: {
          language: 'typescript',
          title: 'example.ts',
          code: 'export function greet(name: string): string {\n  return `سلام ${name}`;\n}',
          showLineNumbers: true,
        },
      };
    case 'image':
      return {
        id,
        version: 1,
        type: 'image',
        data: {
          storageKey: '',
          altText: '',
          caption: '',
        },
      };
    case 'video':
      return {
        id,
        version: 1,
        type: 'video',
        data: {
          storageKey: '',
          caption: '',
        },
      };
    case 'table':
      return {
        id,
        version: 1,
        type: 'table',
        data: {
          headers: ['عنوان ۱', 'عنوان ۲'],
          rows: [['مقدار ۱', 'مقدار ۲']],
        },
      };
    case 'callout':
      return {
        id,
        version: 1,
        type: 'callout',
        data: {
          type: 'info',
          title: 'نکته مهم',
          text: 'توضیح تکمیلی برای این بخش...',
        },
      };
    case 'quote':
      return {
        id,
        version: 1,
        type: 'quote',
        data: {
          text: 'نقل‌قول آموزشی...',
          author: '',
        },
      };
    case 'divider':
      return {
        id,
        version: 1,
        type: 'divider',
        data: {},
      };
    case 'downloadableFile':
      return {
        id,
        version: 1,
        type: 'downloadableFile',
        data: {
          storageKey: '',
          title: 'فایل ضمیمه درس',
          description: '',
          sizeBytes: 1024,
        },
      };
    case 'list':
      return {
        id,
        version: 1,
        type: 'list',
        data: {
          format: 'unordered',
          items: ['مورد اول', 'مورد دوم'],
        },
      };
    case 'interactiveExample':
      return {
        id,
        version: 1,
        type: 'interactiveExample',
        data: {
          environment: 'react',
          preset: 'preset-react-19-v1',
          title: 'مثال تعاملی جدید',
          description: '',
          files: getDefaultInteractiveFiles('react'),
        },
      };
  }
}

export function duplicateBlock(block: ContentBlock): ContentBlock {
  const cloned = JSON.parse(JSON.stringify(block)) as ContentBlock;
  cloned.id = generateBlockId();
  return cloned;
}

const VALID_CALLOUT_TYPES = new Set(['info', 'tip', 'warning', 'danger']);
const VALID_CODE_LANGS = new Set([
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'html',
  'css',
  'scss',
  'json',
  'bash',
  'python',
  'sql',
  'markdown',
  'yaml',
]);
const CODE_LANG_FALLBACKS: Record<string, string> = {
  text: 'markdown',
  plaintext: 'markdown',
  txt: 'markdown',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  tsql: 'sql',
};

export function cleanBlockBeforeSubmit(block: ContentBlock): ContentBlock {
  const copy = JSON.parse(JSON.stringify(block)) as any;
  if (copy.type === 'codeBlock' && copy.data) {
    if (!copy.data.title?.trim()) delete copy.data.title;
    const rawLang = typeof copy.data.language === 'string' ? copy.data.language.trim().toLowerCase() : 'typescript';
    copy.data.language = VALID_CODE_LANGS.has(rawLang)
      ? rawLang
      : CODE_LANG_FALLBACKS[rawLang] || 'markdown';
  }
  if (copy.type === 'image' && copy.data) {
    if (!copy.data.caption?.trim()) delete copy.data.caption;
    if (!copy.data.width) delete copy.data.width;
    if (!copy.data.height) delete copy.data.height;
    if (!copy.data.altText?.trim()) copy.data.altText = 'تصویر آموزشی';
  }
  if (copy.type === 'video' && copy.data) {
    if (!copy.data.posterStorageKey?.trim()) delete copy.data.posterStorageKey;
    if (!copy.data.caption?.trim()) delete copy.data.caption;
    if (!copy.data.durationSeconds) delete copy.data.durationSeconds;
  }
  if (copy.type === 'callout' && copy.data) {
    if (!copy.data.title?.trim()) delete copy.data.title;
    const rawType = typeof copy.data.type === 'string' ? copy.data.type.trim() : 'info';
    copy.data.type =
      rawType === 'success' ? 'tip' : VALID_CALLOUT_TYPES.has(rawType) ? rawType : 'info';
  }
  if (copy.type === 'quote' && copy.data) {
    if (!copy.data.author?.trim()) delete copy.data.author;
    if (!copy.data.citationUrl?.trim()) delete copy.data.citationUrl;
  }
  if (copy.type === 'downloadableFile' && copy.data && !copy.data.description?.trim()) {
    delete copy.data.description;
  }
  if (copy.type === 'interactiveExample' && copy.data && !copy.data.description?.trim()) {
    delete copy.data.description;
  }
  if (copy.type === 'list' && copy.data && Array.isArray(copy.data.items)) {
    const filtered = copy.data.items
      .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item: string) => item.length > 0);
    copy.data.items = filtered.length > 0 ? filtered : ['مورد'];
  }
  if (copy.type === 'richText' && Array.isArray(copy.data?.spans)) {
    copy.data.spans = copy.data.spans
      .filter((sp: any) => sp && typeof sp.text === 'string' && sp.text.length > 0)
      .map((sp: any) => {
        const next = { ...sp };
        const rawUrl = typeof next.link?.url === 'string' ? next.link.url.trim() : '';
        if (!rawUrl) {
          delete next.link;
        } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('/')) {
          const relMatch = rawUrl.match(/^(?:\.\.\/)+([a-z0-9-]+)(?:\/.*)?$/i);
          if (relMatch?.[1]) {
            next.link = { url: `/docs/${relMatch[1].toLowerCase()}`, openInNewTab: Boolean(next.link?.openInNewTab) };
          } else {
            delete next.link;
          }
        }
        return next;
      });
  }
  return copy as ContentBlock;
}

export interface BlocksValidationResult {
  valid: boolean;
  arrayErrors: string[];
  blockErrors: Record<number, string[]>;
  totalBytes: number;
}

export function validateBlocksWithSharedSchema(
  rawBlocks: ContentBlock[]
): BlocksValidationResult {
  const cleaned = rawBlocks.map(cleanBlockBeforeSubmit);
  const totalBytes = getUtf8ByteLength(JSON.stringify(cleaned));
  const parsed = AdminContentBlocksArraySchema.safeParse(cleaned);

  if (parsed.success) {
    return { valid: true, arrayErrors: [], blockErrors: {}, totalBytes };
  }

  const arrayErrors: string[] = [];
  const blockErrors: Record<number, string[]> = {};

  for (const issue of parsed.error.issues) {
    const firstPath = issue.path[0];
    if (typeof firstPath === 'number') {
      if (!blockErrors[firstPath]) blockErrors[firstPath] = [];
      const fieldSuffix = issue.path.slice(1).join('.');
      blockErrors[firstPath].push(fieldSuffix ? `${fieldSuffix}: ${issue.message}` : issue.message);
    } else {
      arrayErrors.push(issue.message);
    }
  }

  return { valid: false, arrayErrors, blockErrors, totalBytes };
}

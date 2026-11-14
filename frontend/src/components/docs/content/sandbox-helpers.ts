import type { SandboxEnvironment, SandboxFileInput } from './sandbox-compiler';

export const RUNNABLE_CODE_LANGUAGES = new Set([
  'html',
  'htm',
  'css',
  'javascript',
  'js',
  'jsx',
  'tsx',
]);

export function isRunnableCodeLanguage(language?: string): boolean {
  if (!language) return false;
  return RUNNABLE_CODE_LANGUAGES.has(language.trim().toLowerCase());
}

export function buildSandboxPayloadFromCodeBlock(params: {
  code: string;
  language?: string;
  title?: string;
}): {
  environment: SandboxEnvironment;
  title: string;
  files: SandboxFileInput[];
} {
  const norm = (params.language || 'html').trim().toLowerCase();
  const title = params.title?.trim() || `تمرین ${norm.toUpperCase()}`;

  if (norm === 'jsx' || norm === 'tsx') {
    const ext = norm === 'tsx' ? 'tsx' : 'jsx';
    const hasExportDefault = /export\s+default\b/.test(params.code);
    const wrappedCode = hasExportDefault
      ? params.code
      : `${params.code}\n\nif (typeof App !== 'undefined') {\n  window.__TECHA_APP__ = App;\n}`;
    return {
      environment: 'react-tailwind',
      title,
      files: [
        {
          path: `App.${ext}`,
          language: ext,
          content: wrappedCode,
          entryPoint: true,
        },
      ],
    };
  }

  if (norm === 'javascript' || norm === 'js') {
    return {
      environment: 'html-css-js',
      title,
      files: [
        {
          path: 'script.js',
          language: 'javascript',
          content: params.code,
          entryPoint: true,
        },
        {
          path: 'index.html',
          language: 'html',
          content: `<div id="app" style="padding:12px;border:1px dashed #cbd5e1;border-radius:10px;font-size:14px;color:#334155;">
  خروجی جاوااسکریپت را در کنسول یا این بخش مشاهده کنید.
</div>`,
          entryPoint: false,
        },
        {
          path: 'style.css',
          language: 'css',
          content: `body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.7; }`,
          entryPoint: false,
        },
      ],
    };
  }

  if (norm === 'css') {
    return {
      environment: 'html-css-js',
      title,
      files: [
        {
          path: 'style.css',
          language: 'css',
          content: params.code,
          entryPoint: true,
        },
        {
          path: 'index.html',
          language: 'html',
          content: `<div class="container card box">
  <h1>پیش‌نمایش استایل CSS</h1>
  <p>متن نمونه برای بررسی تاثیر کدهای CSS روی عناصر صفحه.</p>
  <button type="button" class="btn">دکمه نمونه</button>
</div>`,
          entryPoint: false,
        },
      ],
    };
  }

  // Default: html / htm
  return {
    environment: 'html-css-js',
    title,
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: params.code,
        entryPoint: true,
      },
      {
        path: 'style.css',
        language: 'css',
        content: `/* استایل‌های دلخواه خود را اینجا اضافه کنید */\n`,
        entryPoint: false,
      },
      {
        path: 'script.js',
        language: 'javascript',
        content: `// کدهای جاوااسکریپت خود را اینجا بنویسید\n`,
        entryPoint: false,
      },
    ],
  };
}

export interface StoredSandboxDraft {
  environment: SandboxEnvironment;
  preset?: string;
  title: string;
  description?: string;
  files: SandboxFileInput[];
  courseSlug?: string;
  lessonSlug?: string;
  updatedAt: number;
}

const DRAFT_STORAGE_PREFIX = 'techa_sandbox_draft_';
const MAX_DRAFTS = 8;

export function saveSandboxDraft(draftId: string, draft: StoredSandboxDraft): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const key = `${DRAFT_STORAGE_PREFIX}${draftId}`;
    window.localStorage.setItem(key, JSON.stringify(draft));

    // Prune oldest drafts to avoid quota issues
    const keys: Array<{ key: string; updatedAt: number }> = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(DRAFT_STORAGE_PREFIX)) {
        try {
          const parsed = JSON.parse(window.localStorage.getItem(k) || '{}') as { updatedAt?: number };
          keys.push({ key: k, updatedAt: parsed.updatedAt || 0 });
        } catch {
          keys.push({ key: k, updatedAt: 0 });
        }
      }
    }
    if (keys.length > MAX_DRAFTS) {
      keys.sort((a, b) => a.updatedAt - b.updatedAt);
      for (const old of keys.slice(0, keys.length - MAX_DRAFTS)) {
        window.localStorage.removeItem(old.key);
      }
    }
    return draftId;
  } catch {
    return null;
  }
}

export function loadSandboxDraft(draftId: string): StoredSandboxDraft | null {
  if (typeof window === 'undefined' || !window.localStorage || !draftId) return null;
  try {
    const raw = window.localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${draftId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSandboxDraft;
    if (!parsed || !Array.isArray(parsed.files) || parsed.files.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

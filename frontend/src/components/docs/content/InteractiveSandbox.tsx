'use client';

import React, { useState, useEffect, useRef, useId, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Layers,
  Square,
  Trash2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Maximize2,
  Minimize2,
  Download,
  Zap,
  ArrowRight,
  Sparkles,
  WrapText,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  buildIsolatedSandboxDocument,
  type BabelTransformLike,
  type SandboxEnvironment,
  type SandboxFileInput,
} from './sandbox-compiler';
import { saveSandboxDraft } from './sandbox-helpers';
import { formatSandboxCode } from './sandbox-formatter';

const CodeMirrorPane = dynamic(() => import('./CodeMirrorPane'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0d131a] p-4 font-mono text-xs text-slate-500 flex items-center justify-center">
      در حال بارگذاری ویرایشگر کد...
    </div>
  ),
});

export type InteractiveFile = SandboxFileInput;

export interface InteractiveSandboxProps {
  environment: SandboxEnvironment;
  preset?: string;
  title: string;
  description?: string;
  files: InteractiveFile[];
  courseSlug?: string;
  lessonSlug?: string;
  blockId?: string;
  initialViewMode?: 'split' | 'code' | 'preview';
  standaloneMode?: boolean;
  backHref?: string;
}

interface ConsoleEntry {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
}

type ViewportPreset = 'desktop' | 'tablet' | 'mobile';
type ConsoleFilter = 'all' | 'log' | 'warn' | 'error';

const RUNTIME_LABELS: Record<SandboxEnvironment, string> = {
  'html-css-js': 'HTML · CSS · JS',
  react: 'React 19',
  'react-tailwind': 'React 19 · Tailwind',
};

const REACT_STARTER_FILES: InteractiveFile[] = [
  {
    path: 'App.tsx',
    language: 'typescript',
    entryPoint: true,
    content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
      <h1 className="text-xl font-bold text-slate-900">آزمایشگاه React 19 + Tailwind</h1>
      <p className="text-sm text-slate-600">کد کامپوننت را تغییر دهید و نتیجه را زنده ببینید.</p>
      <div className="text-3xl font-black text-emerald-600">{count}</div>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          افزایش (+1)
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-bold cursor-pointer"
        >
          بازنشانی
        </button>
      </div>
    </div>
  );
}`,
  },
];

let cachedReactRuntime: string | null = null;
let reactRuntimePromise: Promise<string> | null = null;

async function loadLocalReactRuntime(): Promise<string> {
  if (cachedReactRuntime) return cachedReactRuntime;
  if (!reactRuntimePromise) {
    reactRuntimePromise = fetch('/sandbox/react-runtime.js', { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('خطا در بارگذاری هسته اجرای React 19');
        return res.text();
      })
      .then((text) => {
        cachedReactRuntime = text;
        return text;
      });
  }
  return reactRuntimePromise;
}

let cachedBabel: BabelTransformLike | null = null;
async function loadLocalBabel(): Promise<BabelTransformLike> {
  if (cachedBabel) return cachedBabel;
  const mod = await import('@babel/standalone');
  const resolved = (mod.default || mod) as unknown as BabelTransformLike;
  cachedBabel = resolved;
  return resolved;
}

function buildFilesSignature(files: InteractiveFile[], env: SandboxEnvironment): string {
  return `${env}::${files.map((f) => `${f.path}:${f.content.length}`).join('|')}`;
}

export default function InteractiveSandbox({
  environment: initialEnvironment,
  preset,
  title,
  description,
  files: initialFiles,
  courseSlug,
  lessonSlug,
  blockId,
  initialViewMode = 'split',
  standaloneMode = false,
  backHref,
}: InteractiveSandboxProps) {
  const instanceId = useId();
  const [hasMounted, setHasMounted] = useState(false);

  const [activeEnvironment, setActiveEnvironment] =
    useState<SandboxEnvironment>(initialEnvironment);
  const [filesMeta, setFilesMeta] = useState<InteractiveFile[]>(initialFiles);
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of initialFiles) {
      initial[f.path] = f.content;
    }
    return initial;
  });

  const entryFile = filesMeta.find((f) => f.entryPoint) || filesMeta[0];
  const isJsOnlyEntry = Boolean(entryFile && /\.(js|ts)$/i.test(entryFile.path));

  const [activeFilePath, setActiveFilePath] = useState<string>(entryFile?.path || '');
  const [activeTab, setActiveTab] = useState<'split' | 'code' | 'preview'>(initialViewMode);
  const [viewportPreset, setViewportPreset] = useState<ViewportPreset>('desktop');
  const [wordWrap, setWordWrap] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatNotice, setFormatNotice] = useState<string | null>(null);
  const [addingFile, setAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [compiledHtmlText, setCompiledHtmlText] = useState<string>('');
  const [compileError, setCompileError] = useState<string | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [consoleFilter, setConsoleFilter] = useState<ConsoleFilter>('all');
  const [consoleOpen, setConsoleOpen] = useState(isJsOnlyEntry);
  const [draftNonce, setDraftNonce] = useState<string>(() =>
    blockId ? `blk-${blockId}` : `tmp-${Date.now()}`
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeBlobRef = useRef<string | null>(null);
  const initialSigRef = useRef<string>(buildFilesSignature(initialFiles, initialEnvironment));

  const initialFilePathSet = useMemo(
    () => new Set(initialFiles.map((f) => f.path)),
    [initialFiles]
  );

  const activeFile = filesMeta.find((f) => f.path === activeFilePath) || filesMeta[0];
  const currentCode = fileContents[activeFilePath] ?? activeFile?.content ?? '';
  const lineCount = useMemo(() => Math.max(1, currentCode.split('\n').length), [currentCode]);

  const errorCount = useMemo(
    () => consoleEntries.filter((e) => e.level === 'error').length,
    [consoleEntries]
  );

  const filteredConsoleEntries = useMemo(() => {
    if (consoleFilter === 'all') return consoleEntries;
    if (consoleFilter === 'log') {
      return consoleEntries.filter((e) => e.level === 'log' || e.level === 'info');
    }
    return consoleEntries.filter((e) => e.level === consoleFilter);
  }, [consoleEntries, consoleFilter]);

  const revokeCurrentBlob = useCallback(() => {
    if (activeBlobRef.current) {
      URL.revokeObjectURL(activeBlobRef.current);
      activeBlobRef.current = null;
    }
  }, []);

  const compileAndMount = useCallback(
    async (
      contentsMap: Record<string, string>,
      metaList: InteractiveFile[] = filesMeta,
      env: SandboxEnvironment = activeEnvironment
    ) => {
      setIsCompiling(true);
      setIsStopped(false);
      setCompileError(null);
      setConsoleEntries([]);

      try {
        const currentFiles: InteractiveFile[] = metaList.map((f) => ({
          ...f,
          content: contentsMap[f.path] ?? f.content,
        }));

        let babel: BabelTransformLike | undefined;
        let reactRuntimeBundle: string | undefined;

        if (env === 'react' || env === 'react-tailwind') {
          [babel, reactRuntimeBundle] = await Promise.all([
            loadLocalBabel(),
            loadLocalReactRuntime(),
          ]);
        } else {
          babel = await loadLocalBabel().catch(() => undefined);
        }

        const compiled = buildIsolatedSandboxDocument({
          instanceId,
          environment: env,
          files: currentFiles,
          reactRuntimeBundle,
          babel,
        });

        if (!compiled.ok && compiled.errorMessage) {
          setCompileError(compiled.errorMessage);
        }

        setCompiledHtmlText(compiled.html);
        revokeCurrentBlob();
        const blob = new Blob([compiled.html], { type: 'text/html;charset=utf-8' });
        const nextUrl = URL.createObjectURL(blob);
        activeBlobRef.current = nextUrl;
        setBlobUrl(nextUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در آماده‌سازی سندباکس';
        setCompileError(msg);
      } finally {
        setIsCompiling(false);
      }
    },
    [activeEnvironment, filesMeta, instanceId, revokeCurrentBlob]
  );

  // Sync if props change across blocks
  useEffect(() => {
    const nextSig = buildFilesSignature(initialFiles, initialEnvironment);
    if (nextSig !== initialSigRef.current) {
      initialSigRef.current = nextSig;
      const nextContents: Record<string, string> = {};
      for (const f of initialFiles) {
        nextContents[f.path] = f.content;
      }
      const nextEntry = initialFiles.find((f) => f.entryPoint) || initialFiles[0];
      setActiveEnvironment(initialEnvironment);
      setFilesMeta(initialFiles);
      setFileContents(nextContents);
      setActiveFilePath(nextEntry?.path || '');
      void compileAndMount(nextContents, initialFiles, initialEnvironment);
    }
  }, [compileAndMount, initialEnvironment, initialFiles]);

  const initialContentsRef = useRef(fileContents);
  const hasCompiledInitialRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
    if (!hasCompiledInitialRef.current) {
      hasCompiledInitialRef.current = true;
      void compileAndMount(initialContentsRef.current, filesMeta, activeEnvironment);
    }
    return () => {
      revokeCurrentBlob();
    };
  }, [activeEnvironment, compileAndMount, filesMeta, revokeCurrentBlob]);

  // Debounced auto-run on code edit when autoRun is enabled
  const skipNextAutoRunRef = useRef(true);
  useEffect(() => {
    if (skipNextAutoRunRef.current) {
      skipNextAutoRunRef.current = false;
      return;
    }
    if (!autoRun || isStopped) return;
    const timer = setTimeout(() => {
      void compileAndMount(fileContents, filesMeta, activeEnvironment);
    }, 450);
    return () => clearTimeout(timer);
  }, [fileContents, filesMeta, activeEnvironment, autoRun, isStopped, compileAndMount]);

  // Escape closes fullscreen overlay
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const persistDraftForPreview = useCallback(() => {
    const updatedFiles: InteractiveFile[] = filesMeta.map((f) => ({
      ...f,
      content: fileContents[f.path] ?? f.content,
    }));
    return saveSandboxDraft(draftNonce, {
      environment: activeEnvironment,
      preset,
      title,
      description,
      files: updatedFiles,
      courseSlug,
      lessonSlug,
      updatedAt: Date.now(),
    });
  }, [
    activeEnvironment,
    courseSlug,
    description,
    draftNonce,
    fileContents,
    filesMeta,
    lessonSlug,
    preset,
    title,
  ]);

  const previewHref = useMemo(() => {
    const params = new URLSearchParams();
    if (courseSlug) params.set('course', courseSlug);
    if (lessonSlug) params.set('lesson', lessonSlug);
    if (blockId) params.set('block', blockId);
    if (draftNonce) params.set('draft', draftNonce);
    return `/sandbox/preview?${params.toString()}`;
  }, [blockId, courseSlug, draftNonce, lessonSlug]);

  // Strict message validation scoped to this sandbox instance
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      const data = event.data as
        | {
            channel?: string;
            instanceId?: string;
            type?: string;
            payload?: {
              level?: 'log' | 'info' | 'warn' | 'error';
              message?: string;
              line?: number;
              col?: number;
            };
          }
        | undefined;

      if (!data || data.channel !== 'techa-sandbox' || data.instanceId !== instanceId) {
        return;
      }

      if (data.type === 'clear') {
        setConsoleEntries([]);
        return;
      }

      if (data.type === 'console' && data.payload?.message !== undefined) {
        const level = data.payload.level || 'log';
        setConsoleEntries((prev) => [
          ...prev.slice(-99),
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            level,
            message: String(data.payload?.message ?? ''),
          },
        ]);
        if (level === 'error' || isJsOnlyEntry) {
          setConsoleOpen(true);
        }
      }

      if (data.type === 'runtime-error' && data.payload?.message) {
        const loc =
          typeof data.payload.line === 'number' && data.payload.line > 0
            ? ` (خط ${data.payload.line})`
            : '';
        const msg = `${String(data.payload.message)}${loc}`;
        setCompileError(msg);
        setConsoleEntries((prev) => [
          ...prev.slice(-99),
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            level: 'error',
            message: msg,
          },
        ]);
        setConsoleOpen(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [instanceId, isJsOnlyEntry]);

  const handleRun = useCallback(() => {
    void compileAndMount(fileContents, filesMeta, activeEnvironment);
  }, [activeEnvironment, compileAndMount, fileContents, filesMeta]);

  const handleStop = () => {
    revokeCurrentBlob();
    setBlobUrl(null);
    setIsStopped(true);
    setCompileError(null);
  };

  const handleReset = () => {
    const resetObj: Record<string, string> = {};
    for (const f of initialFiles) {
      resetObj[f.path] = f.content;
    }
    const nextEntry = initialFiles.find((f) => f.entryPoint) || initialFiles[0];
    setActiveEnvironment(initialEnvironment);
    setFilesMeta(initialFiles);
    setFileContents(resetObj);
    setActiveFilePath(nextEntry?.path || '');
    setFileError(null);
    void compileAndMount(resetObj, initialFiles, initialEnvironment);
  };

  const handleCopy = () => {
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleFormatCode = useCallback(async () => {
    if (activeFile?.readOnly || isFormatting) return;
    setIsFormatting(true);
    setFormatNotice(null);
    const res = await formatSandboxCode(currentCode, activeFilePath);
    setIsFormatting(false);

    if (res.ok) {
      setFileContents((prev) => ({
        ...prev,
        [activeFilePath]: res.formatted,
      }));
      setFormatNotice('کد مرتب شد');
      setTimeout(() => setFormatNotice(null), 1800);
    } else {
      setFormatNotice(res.errorMessage || 'خطا در فرمت کد');
      setTimeout(() => setFormatNotice(null), 3200);
    }
  }, [activeFile?.readOnly, activeFilePath, currentCode, isFormatting]);

  const handleDownloadHtml = () => {
    if (!compiledHtmlText) return;
    const blob = new Blob([compiledHtmlText], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseSlug || 'techa'}-${lessonSlug || 'example'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCreateCustomFile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFileName.trim().replace(/^\/+/, '');
    if (!/^[A-Za-z0-9_.-]+\.(html|css|js|jsx|ts|tsx)$/i.test(cleaned)) {
      setFileError('نام فایل باید با پسوند html, css, js, jsx, ts یا tsx باشد.');
      return;
    }
    if (filesMeta.some((f) => f.path.toLowerCase() === cleaned.toLowerCase())) {
      setFileError('فایلی با این نام وجود دارد.');
      return;
    }

    const ext = cleaned.split('.').pop()?.toLowerCase() || 'js';
    const language =
      ext === 'html'
        ? 'html'
        : ext === 'css'
          ? 'css'
          : ext === 'ts' || ext === 'tsx'
            ? 'typescript'
            : 'javascript';

    const starterContent =
      ext === 'css'
        ? '/* استایل اختصاصی */\n'
        : ext === 'html'
          ? '<div>بخش جدید</div>\n'
          : '// کد جدید خود را اینجا بنویسید\n';

    const newFile: InteractiveFile = {
      path: cleaned,
      language,
      content: starterContent,
      entryPoint: false,
      readOnly: false,
    };

    setFilesMeta((prev) => [...prev, newFile]);
    setFileContents((prev) => ({ ...prev, [cleaned]: starterContent }));
    setActiveFilePath(cleaned);
    setNewFileName('');
    setAddingFile(false);
    setFileError(null);
  };

  const handleRemoveCustomFile = (targetPath: string) => {
    if (initialFilePathSet.has(targetPath)) return;
    const remaining = filesMeta.filter((f) => f.path !== targetPath);
    if (remaining.length === 0) return;

    setFilesMeta(remaining);
    setFileContents((prev) => {
      const next = { ...prev };
      delete next[targetPath];
      return next;
    });
    if (activeFilePath === targetPath) {
      setActiveFilePath(remaining[0].path);
    }
  };

  const handleSwitchStandaloneEnvironment = (nextEnv: SandboxEnvironment) => {
    if (nextEnv === activeEnvironment) return;
    const nextFiles =
      nextEnv === 'html-css-js'
        ? initialEnvironment === 'html-css-js'
          ? initialFiles
          : [
              {
                path: 'index.html',
                language: 'html',
                entryPoint: true,
                content: `<div class="box">\n  <h1>سلام تکا!</h1>\n  <p>ویرایش زنده HTML، CSS و JavaScript</p>\n</div>`,
              },
              {
                path: 'style.css',
                language: 'css',
                entryPoint: false,
                content: `.box { padding: 24px; border-radius: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; text-align: center; }`,
              },
              {
                path: 'script.js',
                language: 'javascript',
                entryPoint: false,
                content: `console.log('محیط HTML/CSS/JS آماده است');`,
              },
            ]
        : REACT_STARTER_FILES;

    const nextContents: Record<string, string> = {};
    for (const f of nextFiles) nextContents[f.path] = f.content;

    setActiveEnvironment(nextEnv);
    setFilesMeta(nextFiles);
    setFileContents(nextContents);
    setActiveFilePath(nextFiles[0].path);
    void compileAndMount(nextContents, nextFiles, nextEnv);
  };

  const isExpanded = isFullscreen || standaloneMode;

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[80] h-dvh bg-[#0d131a] flex flex-col overflow-hidden text-right'
    : standaloneMode
      ? 'w-full h-[calc(100dvh-4rem)] flex flex-col bg-[#0d131a] overflow-hidden text-right'
      : 'my-6 sm:my-7 rounded-2xl border border-slate-800 bg-[#0d131a] shadow-xl overflow-hidden text-right';

  const workspaceClass = useMemo(() => {
    if (isExpanded) {
      if (activeTab === 'split') {
        return 'grid grid-cols-1 grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 flex-1 min-h-0 overflow-hidden';
      }
      return 'grid grid-cols-1 flex-1 min-h-0 overflow-hidden';
    }

    if (activeTab === 'split') {
      return 'grid grid-cols-1 lg:grid-cols-2 h-[580px] lg:h-[460px] min-h-0 overflow-hidden';
    }
    return 'grid grid-cols-1 h-[460px] min-h-0 overflow-hidden';
  }, [activeTab, isExpanded]);

  const codePaneHeightClass = isExpanded
    ? 'h-full min-h-0 overflow-hidden'
    : activeTab === 'split'
      ? 'h-[290px] lg:h-full min-h-0 overflow-hidden'
      : 'h-full min-h-0 overflow-hidden';

  const previewPaneHeightClass = isExpanded
    ? 'h-full min-h-0 overflow-hidden'
    : activeTab === 'split'
      ? 'h-[290px] lg:h-full min-h-0 overflow-hidden'
      : 'h-full min-h-0 overflow-hidden';

  const previewFrameWidthClass =
    viewportPreset === 'mobile'
      ? 'w-[375px] max-w-full rounded-xl border border-slate-300 shadow-lg'
      : viewportPreset === 'tablet'
        ? 'w-[768px] max-w-full rounded-xl border border-slate-300 shadow-lg'
        : 'w-full h-full';

  return (
    <section
      aria-label={`آزمایشگاه کد تعاملی: ${title}`}
      className={wrapperClass}
    >
      {/* Top Bar */}
      <div className="px-3 sm:px-5 py-2.5 bg-[#131b24] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {standaloneMode && backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-[11px] font-semibold shrink-0 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>بازگشت به درس</span>
            </Link>
          )}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
              {title || 'پیش‌نمایش کد تعاملی'}
            </h4>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono" dir="ltr">
              <span>{RUNTIME_LABELS[activeEnvironment] || activeEnvironment}</span>
              {preset && (
                <>
                  <span>·</span>
                  <span>{preset}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
          {standaloneMode && (
            <div className="hidden md:flex items-center bg-[#090d12] p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => handleSwitchStandaloneEnvironment('html-css-js')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeEnvironment === 'html-css-js'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                HTML/JS
              </button>
              <button
                type="button"
                onClick={() => handleSwitchStandaloneEnvironment('react-tailwind')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeEnvironment !== 'html-css-js'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                React 19
              </button>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#090d12] p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'split'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              دوستونه
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'code'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              کد
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              خروجی
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoRun((v) => !v)}
            title="اجرای خودکار هنگام ویرایش"
            className={`px-2 py-1.5 rounded-lg border transition-colors inline-flex items-center gap-1 text-[11px] ${
              autoRun
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span className="hidden md:inline">خودکار</span>
          </button>

          <button
            type="button"
            onClick={() => void handleFormatCode()}
            disabled={activeFile?.readOnly || isFormatting}
            title="مرتب‌سازی و زیباسازی کد (Ctrl+S)"
            className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 disabled:opacity-45 text-slate-300 hover:text-emerald-300 transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-[11px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isFormatting ? '...' : 'مرتب‌سازی'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="بازنشانی کد به حالت اولیه"
            className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">بازنشانی</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="کپی فایل فعال"
            className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{copied ? 'کپی شد' : 'کپی'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            disabled={!compiledHtmlText}
            title="دانلود خروجی کامل HTML"
            className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {!standaloneMode && (
            <>
              <button
                type="button"
                onClick={() => setIsFullscreen((v) => !v)}
                title={isFullscreen ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه'}
                className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-xs"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <Link
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const freshNonce = blockId
                    ? `blk-${blockId}`
                    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                  if (!blockId && freshNonce !== draftNonce) {
                    setDraftNonce(freshNonce);
                  }
                  persistDraftForPreview();
                }}
                title="باز کردن مثال و خروجی در صفحه جدید"
                className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-white transition-colors border border-sky-500/35 inline-flex items-center gap-1.5 text-[11px] font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">صفحه جدید</span>
              </Link>
            </>
          )}

          {!isStopped && blobUrl && (
            <button
              type="button"
              onClick={handleStop}
              title="توقف اجرا"
              className="px-2 py-1.5 rounded-lg bg-slate-800/70 hover:bg-red-950/60 text-slate-300 hover:text-red-300 transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-xs"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={isCompiling}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isCompiling ? 'کامپایل...' : 'اجرا'}</span>
          </button>
        </div>
      </div>

      {description && (
        <div className="px-4 sm:px-5 py-2 bg-[#0f161f] border-b border-slate-800/80 text-xs text-slate-300 leading-relaxed shrink-0">
          {description}
        </div>
      )}

      {/* File Navigation & Editor Sub-Toolbar */}
      <div className="bg-[#090d12] px-3 sm:px-4 py-1.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto font-mono no-scrollbar min-w-0 flex-1" dir="ltr">
          <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {filesMeta.map((file) => {
            const isActive = file.path === activeFilePath;
            const isCustom = !initialFilePathSet.has(file.path);
            return (
              <div key={file.path} className="inline-flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFilePath(file.path)}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{file.path}</span>
                  {file.entryPoint && (
                    <span className="text-[10px] text-emerald-400 font-sans">ورود</span>
                  )}
                  {file.readOnly && <Lock className="w-3 h-3 text-slate-500" aria-label="فقط خواندنی" />}
                </button>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomFile(file.path)}
                    title={`حذف ${file.path}`}
                    className="-ml-1 mr-1 p-0.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {addingFile ? (
            <form onSubmit={handleCreateCustomFile} className="inline-flex items-center gap-1 ml-1">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => {
                  setNewFileName(e.target.value);
                  setFileError(null);
                }}
                placeholder="utils.js"
                autoFocus
                className="w-28 bg-slate-900 border border-emerald-500/50 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-sans font-bold"
              >
                ثبت
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingFile(false);
                  setFileError(null);
                }}
                className="p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingFile(true)}
              title="افزودن فایل جدید"
              className="px-2 py-1 rounded-md text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50 transition-colors inline-flex items-center gap-1 text-[11px] font-sans shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">فایل جدید</span>
            </button>
          )}
        </div>

        {/* Editor Preference Controls (Wrap, Font Size, Format notice) */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0" dir="ltr">
          {formatNotice && (
            <span className="text-emerald-300 font-sans px-1.5">{formatNotice}</span>
          )}
          <button
            type="button"
            onClick={() => setWordWrap((v) => !v)}
            title="شکستن خودکار خطوط طولانی (Word Wrap)"
            className={`px-1.5 py-1 rounded border transition-colors ${
              wordWrap
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <div className="hidden sm:inline-flex items-center border border-slate-800 rounded bg-[#0d131a]">
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(11, s - 1))}
              title="کوچک‌تر کردن فونت"
              className="px-1.5 py-0.5 hover:text-white"
            >
              A-
            </button>
            <span className="px-1 text-[10px] font-mono text-slate-500 tabular-nums">
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(18, s + 1))}
              title="بزرگ‌تر کردن فونت"
              className="px-1.5 py-0.5 hover:text-white"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {fileError && (
        <div className="px-4 py-1.5 bg-red-950/60 border-b border-red-900/60 text-[11px] text-red-200 shrink-0">
          {fileError}
        </div>
      )}

      {/* Main Split Workspace — Code strictly on LEFT, Preview strictly on RIGHT */}
      <div className={workspaceClass} dir="ltr">
        {(activeTab === 'split' || activeTab === 'code') && (
          <div
            className={`relative flex flex-col bg-[#0d131a] border-b lg:border-b-0 lg:border-r border-slate-800 text-left ${codePaneHeightClass}`}
            dir="ltr"
          >
            <div className="flex-1 min-h-0 overflow-hidden relative text-left" dir="ltr">
              {hasMounted ? (
                <CodeMirrorPane
                  value={currentCode}
                  filePath={activeFilePath}
                  readOnly={activeFile?.readOnly}
                  wordWrap={wordWrap}
                  fontSize={fontSize}
                  onRun={handleRun}
                  onFormat={() => void handleFormatCode()}
                  onChange={(nextVal) => {
                    setFileContents((prev) => ({
                      ...prev,
                      [activeFilePath]: nextVal,
                    }));
                  }}
                />
              ) : (
                <pre
                  className="h-full w-full overflow-auto p-4 font-mono text-[13px] leading-6 text-slate-100 bg-[#0d131a] m-0 text-left"
                  dir="ltr"
                >
                  <code>{currentCode}</code>
                </pre>
              )}

              {activeFile?.readOnly && (
                <div className="absolute bottom-2.5 right-3 text-[11px] bg-slate-900/95 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700 pointer-events-none font-sans">
                  فایل فقط خواندنی
                </div>
              )}
            </div>

            {/* Editor Micro Status Bar */}
            <div className="px-3 py-1 bg-[#090d12] border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
              <span>{activeFilePath}</span>
              <span className="tabular-nums">
                {lineCount} lines · {currentCode.length} chars
              </span>
            </div>
          </div>
        )}

        {(activeTab === 'split' || activeTab === 'preview') && (
          <div
            className={`flex flex-col bg-slate-100 relative text-right ${previewPaneHeightClass}`}
            dir="rtl"
          >
            {/* Preview Responsive Toolbar */}
            <div
              className="px-3 py-1.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 text-[11px] shrink-0"
              dir="ltr"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewportPreset('desktop')}
                  title="نمای دسکتاپ (۱۰۰٪)"
                  className={`p-1 rounded transition-colors ${
                    viewportPreset === 'desktop'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportPreset('tablet')}
                  title="نمای تبلت (768px)"
                  className={`p-1 rounded transition-colors ${
                    viewportPreset === 'tablet'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportPreset('mobile')}
                  title="نمای موبایل (375px)"
                  className={`p-1 rounded transition-colors ${
                    viewportPreset === 'mobile'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 ml-1.5 hidden sm:inline">
                  {viewportPreset === 'mobile'
                    ? '375px'
                    : viewportPreset === 'tablet'
                      ? '768px'
                      : '100%'}
                </span>
              </div>

              <div className="flex items-center gap-2 font-sans" dir="rtl">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    compileError
                      ? 'bg-red-50 text-red-700'
                      : isCompiling
                        ? 'bg-amber-50 text-amber-700'
                        : isStopped
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      compileError
                        ? 'bg-red-500'
                        : isCompiling
                          ? 'bg-amber-500 animate-pulse'
                          : isStopped
                            ? 'bg-slate-400'
                            : 'bg-emerald-500'
                    }`}
                  />
                  <span>
                    {compileError
                      ? 'خطا'
                      : isCompiling
                        ? 'در حال کامپایل'
                        : isStopped
                          ? 'متوقف'
                          : 'آماده'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleRun}
                  title="بازاجرای خروجی"
                  className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 min-h-0 overflow-auto flex justify-center bg-slate-100">
              {!hasMounted ? (
                <div className="w-full h-full flex items-center justify-center p-6 text-xs text-slate-500 bg-white">
                  در حال آماده‌سازی پیش‌نمایش سندباکس ایزوله...
                </div>
              ) : isStopped || !blobUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50">
                  <p className="text-xs font-medium text-slate-600">
                    {isCompiling ? 'در حال کامپایل و راه‌اندازی سندباکس...' : 'اجرای مثال متوقف شده است.'}
                  </p>
                  {!isCompiling && (
                    <button
                      type="button"
                      onClick={handleRun}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>اجرای مجدد</span>
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`h-full flex justify-center ${
                    viewportPreset === 'desktop' ? 'w-full' : 'py-3 px-2'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    src={blobUrl}
                    title={`Sandbox Preview: ${title}`}
                    sandbox="allow-scripts"
                    className={`h-full border-0 bg-white ${previewFrameWidthClass}`}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Console Bar */}
      <div className="bg-[#090d12] border-t border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setConsoleOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>خروجی کنسول</span>
            {consoleEntries.length > 0 && (
              <span className="font-mono text-[11px] bg-slate-800 text-emerald-300 px-1.5 py-0.2 rounded tabular-nums">
                {consoleEntries.length}
              </span>
            )}
            {errorCount > 0 && (
              <span className="font-mono text-[11px] bg-red-950 text-red-300 border border-red-800/70 px-1.5 rounded tabular-nums">
                {errorCount} خطا
              </span>
            )}
          </button>

          {compileError && (
            <span className="inline-flex items-center gap-1 text-red-400 text-[11px] min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-md">{compileError}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          {consoleOpen && consoleEntries.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-900 rounded-md p-0.5 border border-slate-800">
              {(['all', 'log', 'warn', 'error'] as ConsoleFilter[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConsoleFilter(lvl)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                    consoleFilter === lvl
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl === 'all'
                    ? 'همه'
                    : lvl === 'log'
                      ? 'خروجی'
                      : lvl === 'warn'
                        ? 'هشدار'
                        : 'خطا'}
                </button>
              ))}
            </div>
          )}

          {consoleEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setConsoleEntries([])}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>پاک‌سازی</span>
            </button>
          )}
          <span className="hidden sm:inline">Ctrl+Enter اجرا · Ctrl+S مرتب‌سازی</span>
        </div>
      </div>

      {consoleOpen && (
        <div
          className="bg-[#06090c] border-t border-slate-800/90 h-36 overflow-y-auto px-4 py-2.5 space-y-1 font-mono text-xs text-left shrink-0"
          dir="ltr"
        >
          {filteredConsoleEntries.length === 0 ? (
            <p className="text-slate-500 text-[11px] font-sans text-right" dir="rtl">
              {consoleEntries.length === 0
                ? 'هنوز پیامی در کنسول ثبت نشده است.'
                : 'پیامی مطابق فیلتر انتخاب‌شده وجود ندارد.'}
            </p>
          ) : (
            filteredConsoleEntries.map((entry) => (
              <div
                key={entry.id}
                className={`px-2 py-1 rounded whitespace-pre-wrap break-words ${
                  entry.level === 'error'
                    ? 'bg-red-950/50 text-red-300 border border-red-900/50'
                    : entry.level === 'warn'
                      ? 'bg-amber-950/40 text-amber-200 border border-amber-900/40'
                      : 'text-slate-200'
                }`}
              >
                <span className="text-slate-500 mr-2">[{entry.level}]</span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

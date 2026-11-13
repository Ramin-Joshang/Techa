'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
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
} from 'lucide-react';
import {
  buildIsolatedSandboxDocument,
  type BabelTransformLike,
  type SandboxEnvironment,
  type SandboxFileInput,
} from './sandbox-compiler';

export type InteractiveFile = SandboxFileInput;

export interface InteractiveSandboxProps {
  environment: SandboxEnvironment;
  preset?: string;
  title: string;
  description?: string;
  files: InteractiveFile[];
}

interface ConsoleEntry {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
}

const RUNTIME_LABELS: Record<SandboxEnvironment, string> = {
  'html-css-js': 'HTML · CSS · JS',
  react: 'React 19',
  'react-tailwind': 'React 19 · Tailwind',
};

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

export default function InteractiveSandbox({
  environment,
  preset,
  title,
  description,
  files: initialFiles,
}: InteractiveSandboxProps) {
  const instanceId = useId();
  const [hasMounted, setHasMounted] = useState(false);

  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of initialFiles) {
      initial[f.path] = f.content;
    }
    return initial;
  });

  const entryFile = initialFiles.find((f) => f.entryPoint) || initialFiles[0];
  const [activeFilePath, setActiveFilePath] = useState<string>(entryFile?.path || '');
  const [activeTab, setActiveTab] = useState<'split' | 'code' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeBlobRef = useRef<string | null>(null);

  const activeFile = initialFiles.find((f) => f.path === activeFilePath) || initialFiles[0];
  const currentCode = fileContents[activeFilePath] ?? activeFile?.content ?? '';

  const revokeCurrentBlob = useCallback(() => {
    if (activeBlobRef.current) {
      URL.revokeObjectURL(activeBlobRef.current);
      activeBlobRef.current = null;
    }
  }, []);

  const compileAndMount = useCallback(
    async (contentsMap: Record<string, string>) => {
      setIsCompiling(true);
      setIsStopped(false);
      setCompileError(null);
      setConsoleEntries([]);

      try {
        const currentFiles: InteractiveFile[] = initialFiles.map((f) => ({
          ...f,
          content: contentsMap[f.path] ?? f.content,
        }));

        let babel: BabelTransformLike | undefined;
        let reactRuntimeBundle: string | undefined;

        if (environment === 'react' || environment === 'react-tailwind') {
          [babel, reactRuntimeBundle] = await Promise.all([
            loadLocalBabel(),
            loadLocalReactRuntime(),
          ]);
        } else {
          // Load babel cleanly for modern JS syntax in html-css-js if needed
          babel = await loadLocalBabel().catch(() => undefined);
        }

        const compiled = buildIsolatedSandboxDocument({
          instanceId,
          environment,
          files: currentFiles,
          reactRuntimeBundle,
          babel,
        });

        if (!compiled.ok && compiled.errorMessage) {
          setCompileError(compiled.errorMessage);
        }

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
    [environment, initialFiles, instanceId, revokeCurrentBlob]
  );

  useEffect(() => {
    setHasMounted(true);
    void compileAndMount(fileContents);
    return () => {
      revokeCurrentBlob();
    };
    // Initial mount execution only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            payload?: { level?: 'log' | 'info' | 'warn' | 'error'; message?: string };
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
          ...prev.slice(-49),
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            level,
            message: String(data.payload?.message ?? ''),
          },
        ]);
        if (level === 'error') {
          setConsoleOpen(true);
        }
      }

      if (data.type === 'runtime-error' && data.payload?.message) {
        const msg = String(data.payload.message);
        setCompileError(msg);
        setConsoleEntries((prev) => [
          ...prev.slice(-49),
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
  }, [instanceId]);

  const handleRun = () => {
    void compileAndMount(fileContents);
  };

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
    setFileContents(resetObj);
    void compileAndMount(resetObj);
  };

  const handleCopy = () => {
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <section
      aria-label={`آزمایشگاه کد تعاملی: ${title}`}
      className="my-8 rounded-2xl border border-slate-800 bg-[#0d131a] shadow-xl overflow-hidden text-right"
    >
      {/* Top Bar */}
      <div className="px-4 sm:px-5 py-3 bg-[#131b24] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{title || 'پیش‌نمایش کد تعاملی'}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono" dir="ltr">
              <span>{RUNTIME_LABELS[environment] || environment}</span>
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
        <div className="flex flex-wrap items-center gap-2" dir="ltr">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#090d12] p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
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
              className={`px-2.5 py-1 rounded-md transition-colors ${
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
              className={`px-2.5 py-1 rounded-md transition-colors ${
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
            onClick={handleReset}
            title="بازنشانی کد به حالت اولیه"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/80 inline-flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بازنشانی</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="کپی فایل فعال"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/80 inline-flex items-center gap-1.5 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'کپی شد' : 'کپی'}</span>
          </button>

          {!isStopped && blobUrl && (
            <button
              type="button"
              onClick={handleStop}
              title="توقف اجرا"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-red-950/60 text-slate-300 hover:text-red-300 transition-colors border border-slate-700/80 inline-flex items-center gap-1 text-xs"
            >
              <Square className="w-3 h-3 fill-current" />
              <span className="hidden md:inline">توقف</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={isCompiling}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isCompiling ? 'در حال کامپایل...' : 'اجرا'}</span>
          </button>
        </div>
      </div>

      {description && (
        <div className="px-4 sm:px-5 py-2.5 bg-[#0f161f] border-b border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          {description}
        </div>
      )}

      {/* File Navigation Tabs */}
      <div className="bg-[#090d12] px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono" dir="ltr">
        <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        {initialFiles.map((file) => {
          const isActive = file.path === activeFilePath;
          return (
            <button
              key={file.path}
              type="button"
              onClick={() => setActiveFilePath(file.path)}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>{file.path}</span>
              {file.entryPoint && (
                <span className="text-[10px] text-emerald-400 font-sans">نقطه ورود</span>
              )}
              {file.readOnly && <Lock className="w-3 h-3 text-slate-500" aria-label="فقط خواندنی" />}
            </button>
          );
        })}
      </div>

      {/* Main Split Workspace */}
      <div
        className={`grid ${
          activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        } min-h-[340px]`}
      >
        {(activeTab === 'split' || activeTab === 'code') && (
          <div
            className="relative flex flex-col bg-[#0d131a] border-b lg:border-b-0 lg:border-l border-slate-800"
            dir="ltr"
          >
            <textarea
              value={currentCode}
              onChange={(e) => {
                if (!activeFile?.readOnly) {
                  setFileContents((prev) => ({
                    ...prev,
                    [activeFilePath]: e.target.value,
                  }));
                }
              }}
              readOnly={activeFile?.readOnly}
              aria-label={`ویرایشگر کد ${activeFilePath}`}
              className="code-editor w-full h-full min-h-[340px] p-4 font-mono text-[13.5px] leading-relaxed text-slate-100 bg-[#0d131a] resize-y focus:outline-none selection:bg-emerald-500/30"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
            {activeFile?.readOnly && (
              <div className="absolute bottom-2.5 right-3 text-[11px] bg-slate-900/90 text-slate-400 px-2.5 py-0.5 rounded border border-slate-700 pointer-events-none font-sans">
                فایل فقط خواندنی
              </div>
            )}
          </div>
        )}

        {(activeTab === 'split' || activeTab === 'preview') && (
          <div className="flex flex-col bg-white min-h-[340px] relative">
            {!hasMounted ? (
              <div className="flex-1 flex items-center justify-center p-6 text-xs text-slate-500">
                در حال آماده‌سازی پیش‌نمایش سندباکس ایزوله...
              </div>
            ) : isStopped || !blobUrl ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50">
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
              <iframe
                ref={iframeRef}
                src={blobUrl}
                title={`Sandbox Preview: ${title}`}
                sandbox="allow-scripts"
                className="w-full flex-1 min-h-[340px] border-0 bg-white"
              />
            )}
          </div>
        )}
      </div>

      {/* Runtime Error / Console Output Drawer */}
      <div className="bg-[#090d12] border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setConsoleOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>خروجی کنسول</span>
            {consoleEntries.length > 0 && (
              <span className="font-mono text-[11px] bg-slate-800 text-emerald-300 px-1.5 py-0.2 rounded tabular-nums">
                {consoleEntries.length}
              </span>
            )}
          </button>

          {compileError && (
            <span className="inline-flex items-center gap-1 text-red-400 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-xs sm:max-w-md">{compileError}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {consoleEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setConsoleEntries([])}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>پاک‌سازی کنسول</span>
            </button>
          )}
          <span>اجرا در سندباکس ایزوله مرورگر</span>
        </div>
      </div>

      {consoleOpen && (
        <div
          className="bg-[#06090c] border-t border-slate-800/90 max-h-44 overflow-y-auto px-4 py-2.5 space-y-1 font-mono text-xs text-left"
          dir="ltr"
        >
          {consoleEntries.length === 0 ? (
            <p className="text-slate-500 text-[11px] font-sans text-right" dir="rtl">
              هنوز پیامی در کنسول ثبت نشده است.
            </p>
          ) : (
            consoleEntries.map((entry) => (
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

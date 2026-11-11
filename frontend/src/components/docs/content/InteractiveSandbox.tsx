'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, RotateCcw, Copy, Check, Code2, Eye, Layers } from 'lucide-react';

export interface InteractiveFile {
  path: string;
  language: string;
  content: string;
  entryPoint: boolean;
  readOnly?: boolean;
}

export interface InteractiveSandboxProps {
  environment: 'html-css-js' | 'react' | 'react-tailwind';
  preset?: string;
  title: string;
  description?: string;
  files: InteractiveFile[];
}

export default function InteractiveSandbox({
  environment,
  preset,
  title,
  description,
  files: initialFiles,
}: InteractiveSandboxProps) {
  // Local state for active file and edited file contents
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
  const [isRunning, setIsRunning] = useState(false);
  const [compiledSrcDoc, setCompiledSrcDoc] = useState<string>('');

  const activeFile = initialFiles.find((f) => f.path === activeFilePath) || initialFiles[0];
  const currentCode = fileContents[activeFilePath] ?? activeFile?.content ?? '';

  // Generate safe sandbox srcDoc based on environment
  const buildSrcDoc = (contents: Record<string, string>) => {
    try {
      if (environment === 'html-css-js') {
        let html = '';
        let css = '';
        let js = '';

        for (const [path, code] of Object.entries(contents)) {
          if (path.endsWith('.html')) html += code;
          else if (path.endsWith('.css')) css += code + '\n';
          else if (path.endsWith('.js')) js += code + '\n';
        }

        if (!html) {
          html = '<div id="app"></div>';
        }

        return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 16px; color: #1e293b; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    window.onerror = function(msg, url, line) {
      var errBox = document.createElement('div');
      errBox.style = 'background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; border: 1px solid #f87171; font-family: monospace; font-size: 13px; margin-top: 12px;';
      errBox.textContent = 'خطای اجرا: ' + msg + ' (خط ' + line + ')';
      document.body.appendChild(errBox);
      return false;
    };
    try {
      ${js}
    } catch(err) {
      window.onerror(err.message, '', 0);
    }
  </script>
</body>
</html>`;
      }

      if (environment === 'react' || environment === 'react-tailwind') {
        const isTailwind = environment === 'react-tailwind';
        let customCss = '';
        let mainCode = '';

        for (const [path, code] of Object.entries(contents)) {
          if (path.endsWith('.css')) customCss += code + '\n';
          else if (path.endsWith('.jsx') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.ts')) {
            mainCode += code + '\n';
          }
        }

        // Clean up common export default for inline Babel runner
        let cleanedCode = mainCode
          .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1; window.App = $1')
          .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 'window.App = $1;')
          .replace(/import\s+.*?;/g, ''); // strip ESM imports in standalone bundle

        return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${isTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 16px; color: #1e293b; }
    ${customCss}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    window.onerror = function(msg) {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:8px;border:1px solid:#f87171;font-family:monospace;font-size:13px;">خطای اجرا در ری‌اکت: ' + msg + '</div>';
      }
    };

    try {
      ${cleanedCode}

      const TargetComponent = window.App || (typeof App !== 'undefined' ? App : null);
      if (TargetComponent) {
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(TargetComponent));
      } else {
        document.getElementById('root').innerHTML = '<div style="color:#64748b;font-size:13px;padding:8px;">کامپوننت اصلی برای رندر پیدا نشد (لطفاً از App یا export default استفاده کنید).</div>';
      }
    } catch(err) {
      window.onerror(err.message);
    }
  </script>
</body>
</html>`;
      }

      return '<!DOCTYPE html><html><body>محیط اجرایی ناشناخته است</body></html>';
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'خطای کامپایل';
      return `<!DOCTYPE html><html><body><div style="color:red;">${msg}</div></body></html>`;
    }
  };

  // Compile initially on mount
  useEffect(() => {
    setCompiledSrcDoc(buildSrcDoc(fileContents));
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setCompiledSrcDoc(buildSrcDoc(fileContents));
    setTimeout(() => setIsRunning(false), 300);
  };

  const handleReset = () => {
    const resetObj: Record<string, string> = {};
    for (const f of initialFiles) {
      resetObj[f.path] = f.content;
    }
    setFileContents(resetObj);
    setCompiledSrcDoc(buildSrcDoc(resetObj));
  };

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-8 rounded-2xl border border-gray-800 bg-[#18181b] shadow-2xl overflow-hidden text-right">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-[#202023] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="font-bold text-white text-sm sm:text-base">{title}</h4>
          </div>
          {preset && (
            <span className="text-gray-400 font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {preset}
            </span>
          )}
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2" dir="ltr">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-[#121214] p-0.5 rounded-lg border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'split' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              کد و اجرا
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'code' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              کد
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'preview' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              خروجی
            </button>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            title="بازنشانی به کد اولیه"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10 flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">بازنشانی</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="کپی کردن کد"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10 flex items-center gap-1 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'کپی شد' : 'کپی'}</span>
          </button>

          {/* Run Button */}
          <button
            type="button"
            onClick={handleRun}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-md shadow-emerald-900/40 active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>اجرا</span>
          </button>
        </div>
      </div>

      {description && (
        <div className="px-5 py-2 bg-[#1b1b1e] border-b border-gray-800 text-xs text-gray-400 leading-relaxed">
          {description}
        </div>
      )}

      {/* File Navigation Tabs */}
      <div className="bg-[#121214] px-4 py-2 border-b border-gray-800 flex items-center gap-2 overflow-x-auto text-xs font-mono" dir="ltr">
        <Layers className="w-4 h-4 text-gray-500 mr-1 shrink-0" />
        {initialFiles.map((file) => {
          const isActive = file.path === activeFilePath;
          return (
            <button
              key={file.path}
              type="button"
              onClick={() => setActiveFilePath(file.path)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#27272a] text-emerald-400 border border-emerald-500/40 shadow-xs font-semibold'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span>{file.path}</span>
              {file.entryPoint && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-sans">
                  ورود
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Workspace (Code Editor + Iframe Sandbox) */}
      <div className={`grid ${activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} min-h-[360px]`}>
        {/* Code Editor Column */}
        {(activeTab === 'split' || activeTab === 'code') && (
          <div className="relative flex flex-col bg-[#141416] border-b lg:border-b-0 lg:border-l border-gray-800" dir="ltr">
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
              className="w-full h-full min-h-[360px] p-4 font-mono text-[13px] leading-relaxed text-gray-100 bg-[#141416] resize-none focus:outline-none focus:ring-0 selection:bg-emerald-500/30"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
            {activeFile?.readOnly && (
              <div className="absolute bottom-2 right-3 text-[10px] bg-gray-800/80 text-gray-400 px-2 py-0.5 rounded border border-gray-700 pointer-events-none">
                فقط خواندنی
              </div>
            )}
          </div>
        )}

        {/* Live Isolated Sandbox Preview Column */}
        {(activeTab === 'split' || activeTab === 'preview') && (
          <div className="flex flex-col bg-white min-h-[360px]">
            <iframe
              srcDoc={compiledSrcDoc}
              title={`Sandbox Preview: ${title}`}
              sandbox="allow-scripts"
              className="w-full h-full min-h-[360px] border-none bg-white rounded-b-2xl lg:rounded-bl-2xl lg:rounded-br-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

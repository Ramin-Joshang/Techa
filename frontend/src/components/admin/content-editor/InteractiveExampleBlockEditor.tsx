'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Eye, EyeOff, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  INTERACTIVE_ENVIRONMENTS,
  INTERACTIVE_PRESETS,
  InteractiveEnvironment,
  InteractiveExampleBlock,
  InteractivePreset,
  getUtf8ByteLength,
} from '@techa/shared';
import { formatBytes } from '../../../lib/admin/admin-formatters';
import { AdminButton } from '../ui/AdminPrimitives';
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from '../ui/AdminFormFields';
import {
  PRESET_BY_ENVIRONMENT,
  getDefaultInteractiveFiles,
  inferInteractiveLanguageFromPath,
} from './block-factories';

const InteractiveSandbox = dynamic(
  () => import('../../docs/content/InteractiveSandbox'),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-center text-xs text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
        در حال بارگذاری سندباکس تعاملی...
      </div>
    ),
  }
);

export function InteractiveExampleBlockEditor({
  data,
  onChange,
}: {
  data: InteractiveExampleBlock['data'];
  onChange: (next: InteractiveExampleBlock['data']) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showSandboxPreview, setShowSandboxPreview] = useState(false);

  const safeIdx = Math.min(activeIdx, Math.max(0, data.files.length - 1));
  const currentFile = data.files[safeIdx];
  const totalBytes = data.files.reduce((acc, f) => acc + getUtf8ByteLength(f.content || ''), 0);

  const handleEnvironmentChange = (env: InteractiveEnvironment) => {
    const preset = PRESET_BY_ENVIRONMENT[env];
    onChange({
      ...data,
      environment: env,
      preset,
      files: getDefaultInteractiveFiles(env),
    });
    setActiveIdx(0);
  };

  const updateFile = (idx: number, patch: Partial<(typeof data.files)[number]>) => {
    const nextFiles = data.files.map((f, i) => {
      if (i !== idx) {
        return patch.entryPoint ? { ...f, entryPoint: false } : f;
      }
      const updated = { ...f, ...patch };
      if (patch.path !== undefined) {
        updated.language = inferInteractiveLanguageFromPath(patch.path);
      }
      return updated;
    });
    onChange({ ...data, files: nextFiles });
  };

  const addFile = () => {
    if (data.files.length >= 10) return;
    const isVanilla = data.environment === 'html-css-js';
    const baseName = isVanilla ? `helper-${data.files.length + 1}.js` : `Component${data.files.length + 1}.jsx`;
    onChange({
      ...data,
      files: [
        ...data.files,
        {
          path: baseName,
          language: 'javascript',
          content: '// کد فایل جدید\n',
          entryPoint: false,
          readOnly: false,
        },
      ],
    });
    setActiveIdx(data.files.length);
  };

  const removeFile = (idx: number) => {
    if (data.files.length <= 1) return;
    const removed = data.files[idx];
    const remaining = data.files.filter((_, i) => i !== idx);
    if (removed.entryPoint && remaining.length > 0) {
      remaining[0] = { ...remaining[0], entryPoint: true };
    }
    onChange({ ...data, files: remaining });
    setActiveIdx(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AdminField label="عنوان مثال تعاملی" required>
          <AdminInput
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            maxLength={150}
            placeholder="مثال: شمارنده با useState"
          />
        </AdminField>

        <AdminField label="محیط اجرا (Environment)" required>
          <AdminSelect
            value={data.environment}
            onChange={(e) => handleEnvironmentChange(e.target.value as InteractiveEnvironment)}
          >
            {INTERACTIVE_ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </AdminSelect>
        </AdminField>

        <AdminField label="پیش‌تنظیم (Preset)" required>
          <AdminSelect
            value={data.preset}
            onChange={(e) => onChange({ ...data, preset: e.target.value as InteractivePreset })}
          >
            {INTERACTIVE_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
      </div>

      <AdminField label="توضیح اختیاری">
        <AdminInput
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          maxLength={500}
          placeholder="توضیح کوتاه درباره نحوه عملکرد این کد تعاملی..."
        />
      </AdminField>

      {/* Multi-file bar */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
            {data.files.map((file, idx) => (
              <button
                key={`${file.path}_${idx}`}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 border transition-colors ${
                  idx === safeIdx
                    ? 'bg-[#042A1B] text-white border-[#042A1B]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{file.path}</span>
                {file.entryPoint && <CheckCircle2 className="w-3 h-3 text-[#7AE36A]" />}
              </button>
            ))}
            {data.files.length < 10 && (
              <button
                type="button"
                onClick={addFile}
                className="px-2.5 py-1 rounded text-xs font-medium bg-white border border-dashed border-slate-300 text-slate-700 hover:border-emerald-600 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>فایل جدید</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 tabular-nums">
            <span>
              حجم کل: <strong dir="ltr">{formatBytes(totalBytes)}</strong> / 256 KB
            </span>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => setShowSandboxPreview((v) => !v)}
              icon={showSandboxPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            >
              {showSandboxPreview ? 'بستن پیش‌نمایش' : 'تست اجرا در سندباکس'}
            </AdminButton>
          </div>
        </div>

        {currentFile && (
          <div className="p-3.5 space-y-3 bg-white">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[180px]">
                <AdminField label="مسیر فایل (LTR)" required>
                  <AdminInput
                    dir="ltr"
                    className="font-mono text-xs"
                    value={currentFile.path}
                    onChange={(e) => updateFile(safeIdx, { path: e.target.value })}
                    placeholder="App.jsx یا index.html"
                  />
                </AdminField>
              </div>
              <div className="w-36">
                <AdminField label="زبان فایل">
                  <AdminSelect
                    value={currentFile.language}
                    onChange={(e) =>
                      updateFile(safeIdx, {
                        language: e.target.value as (typeof currentFile)['language'],
                      })
                    }
                  >
                    <option value="javascript">javascript</option>
                    <option value="typescript">typescript</option>
                    <option value="html">html</option>
                    <option value="css">css</option>
                    <option value="json">json</option>
                  </AdminSelect>
                </AdminField>
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 min-h-[40px] cursor-pointer">
                <input
                  type="radio"
                  name={`entry_${data.title}`}
                  checked={currentFile.entryPoint}
                  onChange={() => updateFile(safeIdx, { entryPoint: true })}
                  className="accent-emerald-700"
                />
                <span>فایل ورودی (Entry)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 min-h-[40px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(currentFile.readOnly)}
                  onChange={(e) => updateFile(safeIdx, { readOnly: e.target.checked })}
                  className="accent-emerald-700"
                />
                <span>فقط‌خواندنی</span>
              </label>
              {data.files.length > 1 && (
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(safeIdx)}
                  icon={<Trash2 className="w-4 h-4 text-red-600" />}
                >
                  حذف فایل
                </AdminButton>
              )}
            </div>

            <AdminTextarea
              dir="ltr"
              rows={8}
              className="font-mono text-xs bg-slate-950 text-slate-100 border-slate-800"
              value={currentFile.content}
              onChange={(e) => updateFile(safeIdx, { content: e.target.value })}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {showSandboxPreview && (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <InteractiveSandbox
            environment={data.environment}
            preset={data.preset}
            title={data.title || 'پیش‌نمایش تعاملی'}
            description={data.description}
            files={data.files}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export function AdminField({
  label,
  htmlFor,
  required,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
        {counter && <span className="text-[11px] text-slate-400 tabular-nums">{counter}</span>}
      </div>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500 leading-relaxed">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export const INPUT_BASE_CLASS =
  'w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100 disabled:text-slate-500';

export function AdminInput({
  className = '',
  hasError,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      className={`${INPUT_BASE_CLASS} ${
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
      } ${className}`}
      {...props}
    />
  );
}

export function AdminTextarea({
  className = '',
  hasError,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100 disabled:text-slate-500 ${
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
      } ${className}`}
      {...props}
    />
  );
}

export function AdminSelect({
  className = '',
  hasError,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return (
    <select
      className={`${INPUT_BASE_CLASS} ${
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminStringListInput({
  label,
  values,
  onChange,
  placeholder = 'مورد جدید را وارد کنید...',
  maxItems = 10,
  hint,
  error,
  normalizeItem,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  hint?: string;
  error?: string;
  normalizeItem?: (value: string) => string;
}) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const rawTrimmed = draft.trim();
    const trimmed = normalizeItem ? normalizeItem(rawTrimmed) : rawTrimmed;
    if (!trimmed) return;
    if (values.length >= maxItems) return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  };

  return (
    <AdminField label={label} hint={hint} error={error} counter={`${values.length}/${maxItems}`}>
      <div className="flex gap-2">
        <AdminInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          disabled={values.length >= maxItems}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim() || values.length >= maxItems}
          className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن</span>
        </button>
      </div>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1.5">
          {values.map((item, idx) => (
            <li
              key={`${item}_${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-800"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-red-600 transition-colors"
                aria-label={`حذف ${item}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminField>
  );
}

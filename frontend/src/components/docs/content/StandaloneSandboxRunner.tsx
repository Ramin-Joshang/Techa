'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, Code2, ArrowRight } from 'lucide-react';
import type { ContentBlock } from '@techa/shared';
import InteractiveSandbox, { type InteractiveFile } from './InteractiveSandbox';
import type { SandboxEnvironment } from './sandbox-compiler';
import { buildSandboxPayloadFromCodeBlock, loadSandboxDraft } from './sandbox-helpers';

interface LoadedExampleState {
  environment: SandboxEnvironment;
  preset?: string;
  title: string;
  description?: string;
  files: InteractiveFile[];
  courseSlug?: string;
  lessonSlug?: string;
}

const DEFAULT_PLAYGROUND_FILES: InteractiveFile[] = [
  {
    path: 'index.html',
    language: 'html',
    entryPoint: true,
    content: `<div class="card">
  <h1>آزمایشگاه زنده کد تکا</h1>
  <p>کدهای HTML، CSS و JavaScript خود را ویرایش کنید و خروجی را بلافاصله ببینید.</p>
  <button id="btn">کلیک کنید</button>
  <p id="status"></p>
</div>`,
  },
  {
    path: 'style.css',
    language: 'css',
    entryPoint: false,
    content: `.card {
  max-width: 480px;
  margin: 24px auto;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  text-align: center;
}
button {
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: #059669;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}`,
  },
  {
    path: 'script.js',
    language: 'javascript',
    entryPoint: false,
    content: `let count = 0;
const btn = document.getElementById('btn');
const statusEl = document.getElementById('status');
btn?.addEventListener('click', () => {
  count++;
  if (statusEl) statusEl.textContent = 'تعداد کلیک: ' + count;
  console.log('Clicked:', count);
});`,
  },
];

export default function StandaloneSandboxRunner({
  courseSlug,
  lessonSlug,
  blockId,
  draftId,
  initialMode,
}: {
  courseSlug?: string;
  lessonSlug?: string;
  blockId?: string;
  draftId?: string;
  initialMode?: 'split' | 'code' | 'preview';
}) {
  const [state, setState] = useState<LoadedExampleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function resolveSandboxSource() {
      setLoading(true);
      setErrorMsg(null);

      // 1. Check localStorage draft first (preserves unsaved user edits opened in a new tab)
      if (draftId) {
        const draft = loadSandboxDraft(draftId);
        if (draft) {
          if (active) {
            setState({
              environment: draft.environment,
              preset: draft.preset,
              title: draft.title,
              description: draft.description,
              files: draft.files,
              courseSlug: draft.courseSlug || courseSlug,
              lessonSlug: draft.lessonSlug || lessonSlug,
            });
            setLoading(false);
          }
          return;
        }
      }

      // 2. Fallback to live published lesson API if course & lesson slugs are provided
      if (courseSlug && lessonSlug) {
        try {
          const res = await fetch(
            `/api/v1/public/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
            { cache: 'no-store' }
          );
          const json = (await res.json().catch(() => null)) as {
            success?: boolean;
            data?: { lesson?: { title?: string; contentBlocks?: ContentBlock[] } };
          } | null;

          const blocks = json?.data?.lesson?.contentBlocks || [];
          const matchedBlock = blockId
            ? blocks.find((b) => b.id === blockId)
            : blocks.find((b) => b.type === 'interactiveExample' || b.type === 'codeBlock');

          if (matchedBlock?.type === 'interactiveExample') {
            if (active) {
              setState({
                environment: matchedBlock.data.environment,
                preset: matchedBlock.data.preset,
                title: matchedBlock.data.title,
                description: matchedBlock.data.description,
                files: matchedBlock.data.files,
                courseSlug,
                lessonSlug,
              });
              setLoading(false);
            }
            return;
          }

          if (matchedBlock?.type === 'codeBlock') {
            const payload = buildSandboxPayloadFromCodeBlock({
              code: matchedBlock.data.code,
              language: matchedBlock.data.language,
              title: matchedBlock.data.title || json?.data?.lesson?.title,
            });
            if (active) {
              setState({
                environment: payload.environment,
                title: payload.title,
                files: payload.files,
                courseSlug,
                lessonSlug,
              });
              setLoading(false);
            }
            return;
          }

          if (active) {
            setErrorMsg('مثال کد مورد نظر در این درس یافت نشد.');
            setLoading(false);
          }
          return;
        } catch {
          if (active) {
            setErrorMsg('خطا در دریافت اطلاعات مثال از سرور.');
            setLoading(false);
          }
          return;
        }
      }

      // 3. Default interactive playground if opened directly
      if (active) {
        setState({
          environment: 'html-css-js',
          title: 'محیط تمرین آزاد کدنویسی تکا',
          files: DEFAULT_PLAYGROUND_FILES,
        });
        setLoading(false);
      }
    }

    void resolveSandboxSource();
    return () => {
      active = false;
    };
  }, [blockId, courseSlug, draftId, lessonSlug]);

  const backHref =
    state?.courseSlug && state?.lessonSlug
      ? `/docs/${state.courseSlug}/${state.lessonSlug}`
      : courseSlug && lessonSlug
        ? `/docs/${courseSlug}/${lessonSlug}`
        : '/docs';

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-[#0d131a] text-white flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#7AE36A]" />
        <p className="text-sm text-slate-300">در حال بارگذاری محیط اجرای کد...</p>
      </div>
    );
  }

  if (errorMsg || !state) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-[#0d131a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#131b24] border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white">خطا در بارگذاری مثال</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {errorMsg || 'اطلاعات مثال در دسترس نیست.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7AE36A] text-[#042A1B] font-bold text-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت</span>
            </Link>
            <Link
              href="/sandbox/preview"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs border border-white/15"
            >
              <Code2 className="w-4 h-4 text-[#7AE36A]" />
              <span>محیط تمرین آزاد</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#0d131a] flex flex-col">
      <InteractiveSandbox
        environment={state.environment}
        preset={state.preset}
        title={state.title}
        description={state.description}
        files={state.files}
        courseSlug={state.courseSlug}
        lessonSlug={state.lessonSlug}
        blockId={blockId}
        initialViewMode={initialMode || 'split'}
        standaloneMode
        backHref={backHref}
      />
    </div>
  );
}

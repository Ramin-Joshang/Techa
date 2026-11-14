'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  RichTextBlock,
  CodeBlock,
  ImageBlock,
  VideoBlock,
  TableBlock,
  CalloutBlock,
  QuoteBlock,
  DownloadableFileBlock,
  ListBlock,
  InteractiveExampleBlock,
} from '@techa/shared';
import {
  Info,
  AlertTriangle,
  Lightbulb,
  AlertOctagon,
  Quote,
  FileDown,
  Image as ImageIcon,
  Video as VideoIcon,
  PlayCircle,
  Terminal,
  Copy,
  Check,
  Hash,
  Maximize2,
  X,
  Play,
  Code2,
  ExternalLink,
} from 'lucide-react';
import CodeSyntaxHighlighter from './CodeSyntaxHighlighter';
import InteractiveSandbox from './InteractiveSandbox';
import { extractLessonHeadings } from './heading-utils';
import { parseStructuredProse } from './prose-parser';
import {
  buildSandboxPayloadFromCodeBlock,
  isRunnableCodeLanguage,
  saveSandboxDraft,
} from './sandbox-helpers';

interface ContentBlocksRendererProps {
  blocks: ContentBlock[];
  schemaVersion?: number;
  courseSlug?: string;
  lessonSlug?: string;
}

const READONLY_CODE_LANGUAGES = new Set([
  'sql',
  'postgres',
  'mysql',
  'bash',
  'sh',
  'shell',
  'yaml',
  'json',
  'markdown',
  'md',
]);

/**
 * Sanitizes URLs to prevent XSS (blocks javascript:, data:, vbscript: protocols).
 */
function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false;
  }
  return true;
}

/**
 * Formats byte size into human readable string.
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveMediaSrc(storageKey: string): string {
  if (
    storageKey.startsWith('http://') ||
    storageKey.startsWith('https://') ||
    storageKey.startsWith('/')
  ) {
    return storageKey;
  }
  return `/api/v1/public/media/${storageKey}`;
}

/**
 * Renders structured prose paragraphs & cleanly stacked vertical bullet/numbered lists.
 */
function StructuredProseText({
  text,
  paragraphClassName,
  listClassName,
  bulletColorClass = 'bg-emerald-600',
}: {
  text: string;
  paragraphClassName: string;
  listClassName?: string;
  bulletColorClass?: string;
}) {
  const segments = useMemo(() => parseStructuredProse(text), [text]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {segments.map((seg, idx) => {
        if (seg.kind === 'paragraph') {
          return (
            <p key={idx} className={`${paragraphClassName} whitespace-pre-line m-0`}>
              {seg.text}
            </p>
          );
        }

        if (seg.ordered) {
          return (
            <ol
              key={idx}
              className={`list-none !p-0 !m-0 space-y-2.5 ${listClassName || paragraphClassName}`}
            >
              {seg.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 !pr-0">
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-800 text-[11px] font-bold shrink-0 tabular-nums"
                  >
                    {itemIdx + 1}
                  </span>
                  <span className="flex-1 min-w-0 leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <ul
            key={idx}
            className={`list-none !p-0 !m-0 space-y-2.5 ${listClassName || paragraphClassName}`}
          >
            {seg.items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5 !pr-0">
                <span
                  aria-hidden="true"
                  className={`mt-2.5 h-1.5 w-1.5 rounded-full shrink-0 ${bulletColorClass}`}
                />
                <span className="flex-1 min-w-0 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

// 1. Heading Renderer with Deterministic Unique Anchor Support
function RenderHeading({ block, anchorId }: { block: HeadingBlock; anchorId: string }) {
  const { level, text } = block.data;

  if (level === 2) {
    return (
      <h2
        id={anchorId}
        className="group text-xl sm:text-2xl md:text-[26px] font-extrabold text-slate-950 pt-6 mb-2 pb-2.5 border-b border-slate-200/80 flex items-center justify-between gap-3 scroll-mt-24 tracking-tight"
      >
        <span>{text}</span>
        <a
          href={`#${anchorId}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-emerald-700 transition-opacity p-1 rounded-md shrink-0"
          aria-label={`پیوند به ${text}`}
        >
          <Hash className="w-4 h-4" />
        </a>
      </h2>
    );
  }
  if (level === 3) {
    return (
      <h3
        id={anchorId}
        className="group text-lg sm:text-xl font-bold text-slate-900 pt-4 mb-1 flex items-center justify-between gap-3 scroll-mt-24"
      >
        <span>{text}</span>
        <a
          href={`#${anchorId}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-emerald-700 transition-opacity p-1 rounded-md shrink-0"
          aria-label={`پیوند به ${text}`}
        >
          <Hash className="w-3.5 h-3.5" />
        </a>
      </h3>
    );
  }
  return (
    <h4 id={anchorId} className="text-base sm:text-lg font-bold text-slate-800 pt-2 mb-1 scroll-mt-24">
      {text}
    </h4>
  );
}

// 2. Paragraph Renderer
function RenderParagraph({ block }: { block: ParagraphBlock }) {
  return (
    <StructuredProseText
      text={block.data.text}
      paragraphClassName="text-[16px] sm:text-[17px] leading-[1.95] text-slate-700 text-right font-normal"
    />
  );
}

// 3. Rich Text Renderer
function RenderRichText({ block }: { block: RichTextBlock }) {
  return (
    <div className="text-[16px] sm:text-[17px] leading-[1.95] text-slate-700 text-right whitespace-pre-line">
      {block.data.spans.map((span, idx) => {
        let content: React.ReactNode = span.text;

        if (span.code) {
          content = (
            <code
              className="text-emerald-800 bg-emerald-50/90 border border-emerald-200/70 px-1.5 py-0.5 rounded-md font-mono text-[14px] mx-1 inline-block"
              dir="ltr"
            >
              {content}
            </code>
          );
        }
        if (span.bold) {
          content = <strong className="font-bold text-gray-900">{content}</strong>;
        }
        if (span.italic) {
          content = <em className="italic">{content}</em>;
        }
        if (span.underline) {
          content = (
            <span className="underline decoration-emerald-500 underline-offset-4">{content}</span>
          );
        }
        if (span.strikethrough) {
          content = <del className="line-through text-slate-400">{content}</del>;
        }

        if (span.link && isSafeUrl(span.link.url)) {
          return (
            <a
              key={idx}
              href={span.link.url}
              target={span.link.openInNewTab ? '_blank' : undefined}
              rel={span.link.openInNewTab ? 'noopener noreferrer' : undefined}
              className="text-emerald-700 hover:text-emerald-800 underline decoration-emerald-300 hover:decoration-emerald-600 underline-offset-4 font-medium transition-colors"
            >
              {content}
            </a>
          );
        }

        return <React.Fragment key={idx}>{content}</React.Fragment>;
      })}
    </div>
  );
}

// 4. Code Block Renderer with Syntax Highlighting, Live Inline Sandbox, and New-Tab Runner
function RenderCodeBlock({
  block,
  courseSlug,
  lessonSlug,
}: {
  block: CodeBlock;
  courseSlug?: string;
  lessonSlug?: string;
}) {
  const { code, language, title, showLineNumbers } = block.data;
  const [copied, setCopied] = useState(false);
  const [interactiveOpen, setInteractiveOpen] = useState(false);

  const normalizedLang = (language || '').trim().toLowerCase();
  const isExplicitStatic = READONLY_CODE_LANGUAGES.has(normalizedLang);
  const isRunnable = !isExplicitStatic && isRunnableCodeLanguage(normalizedLang);

  const sandboxPayload = useMemo(() => {
    if (!isRunnable) return null;
    return buildSandboxPayloadFromCodeBlock({ code, language: normalizedLang, title });
  }, [isRunnable, code, normalizedLang, title]);

  const previewHref = useMemo(() => {
    const params = new URLSearchParams();
    if (courseSlug) params.set('course', courseSlug);
    if (lessonSlug) params.set('lesson', lessonSlug);
    if (block.id) params.set('block', block.id);
    if (block.id) params.set('draft', `blk-${block.id}`);
    return `/sandbox/preview?${params.toString()}`;
  }, [block.id, courseSlug, lessonSlug]);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handlePrepareExternalPreview = () => {
    if (!sandboxPayload) return;
    const draftKey = block.id ? `blk-${block.id}` : `code-${Date.now()}`;
    saveSandboxDraft(draftKey, {
      environment: sandboxPayload.environment,
      title: sandboxPayload.title,
      files: sandboxPayload.files,
      courseSlug,
      lessonSlug,
      updatedAt: Date.now(),
    });
  };

  if (interactiveOpen && sandboxPayload) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
            <span>حالت ویرایش و اجرای زنده</span>
          </span>
          <button
            type="button"
            onClick={() => setInteractiveOpen(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>بازگشت به نمایش کد</span>
          </button>
        </div>

        <InteractiveSandbox
          environment={sandboxPayload.environment}
          title={sandboxPayload.title}
          files={sandboxPayload.files}
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          blockId={block.id}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0d131a] shadow-lg text-left"
      dir="ltr"
    >
      {/* Code Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#131b24] border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-slate-200 font-semibold truncate max-w-[160px] sm:max-w-xs">
            {title || language}
          </span>
          {isExplicitStatic && (
            <span className="text-[10px] font-sans text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 shrink-0">
              فقط نمایشی
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {isRunnable && (
            <>
              <button
                type="button"
                onClick={() => setInteractiveOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-[11px] font-sans font-bold"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>اجرای زنده</span>
              </button>
              <Link
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePrepareExternalPreview}
                title="باز کردن و اجرای این مثال در صفحه جدید"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-white border border-sky-500/30 transition-colors text-[11px] font-sans font-semibold"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">باز کردن در صفحه جدید</span>
                <span className="sm:hidden">خروجی</span>
              </Link>
            </>
          )}

          <span className="uppercase tracking-wider text-[11px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-300 border border-white/10">
            {language}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] font-sans"
            aria-label="کپی کردن کد"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Syntax-Highlighted Code */}
      <CodeSyntaxHighlighter
        code={code}
        language={language}
        showLineNumbers={showLineNumbers !== false}
      />
    </div>
  );
}

// 5. Image Block Renderer with Error Fallback & Lightbox
function RenderImage({ block }: { block: ImageBlock }) {
  const { storageKey, altText, caption, width, height } = block.data;
  const mediaSrc = resolveMediaSrc(storageKey);
  const [hasError, setHasError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <figure className="my-2">
      <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[160px]">
        {hasError ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-medium">امکان بارگذاری این تصویر در حال حاضر وجود ندارد.</p>
            {altText && <p className="text-[11px] text-slate-400">{altText}</p>}
          </div>
        ) : (
          <>
            <img
              src={mediaSrc}
              alt={altText || 'تصویر آموزشی'}
              width={width}
              height={height}
              loading="lazy"
              decoding="async"
              onError={() => setHasError(true)}
              className="w-full h-auto object-contain max-h-[520px] bg-slate-50"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="بزرگ‌نمایی تصویر"
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute bottom-3 left-3 p-2 rounded-lg bg-slate-900/75 text-white hover:bg-slate-900"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {caption && (
        <figcaption className="text-center text-xs sm:text-sm text-slate-500 mt-2.5 font-medium">
          {caption}
        </figcaption>
      )}

      {lightboxOpen && !hasError && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={altText || 'پیش‌نمایش تصویر'}
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="بستن پیش‌نمایش"
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={mediaSrc}
            alt={altText || 'تصویر آموزشی'}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </figure>
  );
}

// 6. Video Block Renderer with Fallback State
function RenderVideo({ block }: { block: VideoBlock }) {
  const { storageKey, caption, durationSeconds } = block.data;
  const mediaSrc = resolveMediaSrc(storageKey);
  const durationMinutes = durationSeconds ? Math.ceil(durationSeconds / 60) : null;
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="my-2">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
        {videoError ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <VideoIcon className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-xs font-medium">فایل ویدیویی این بخش در دسترس نیست.</p>
          </div>
        ) : (
          <video
            controls
            preload="metadata"
            onError={() => setVideoError(true)}
            className="w-full max-h-[480px] bg-black"
          >
            <source src={mediaSrc} />
            مرورگر شما از پخش مستقیم ویدیو پشتیبانی نمی‌کند.
          </video>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs text-slate-500">
        {caption ? <p className="text-sm text-slate-600 font-medium">{caption}</p> : <span />}
        {durationMinutes && (
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 tabular-nums">
            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
            مدت زمان: {durationMinutes} دقیقه
          </span>
        )}
      </div>
    </div>
  );
}

// 7. Table Block Renderer
function RenderTable({ block }: { block: TableBlock }) {
  const { headers, rows } = block.data;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className="px-4 sm:px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/70 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 sm:px-5 py-3 text-slate-700 leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 8. Callout Block Renderer with Structured Stacked Lists
function RenderCallout({ block }: { block: CalloutBlock }) {
  const { type, title, text } = block.data;

  const config = {
    info: {
      bg: 'bg-blue-50/70 border-blue-200/90 text-blue-950',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
      titleColor: 'text-blue-950',
      bulletColor: 'bg-blue-600',
    },
    warning: {
      bg: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-950',
      bulletColor: 'bg-amber-600',
    },
    tip: {
      bg: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
      icon: <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-950',
      bulletColor: 'bg-emerald-600',
    },
    danger: {
      bg: 'bg-red-50/70 border-red-200/90 text-red-950',
      icon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
      titleColor: 'text-red-950',
      bulletColor: 'bg-red-600',
    },
  }[type] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-900',
    icon: <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
    titleColor: 'text-slate-900',
    bulletColor: 'bg-slate-600',
  };

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 flex items-start gap-3.5 ${config.bg}`}>
      {config.icon}
      <div className="flex-1 min-w-0 space-y-2">
        {title && (
          <h4 className={`font-bold text-sm sm:text-base m-0 ${config.titleColor}`}>
            {title}
          </h4>
        )}
        <StructuredProseText
          text={text}
          paragraphClassName="text-[14.5px] sm:text-[15.5px] leading-7 text-right"
          bulletColorClass={config.bulletColor}
        />
      </div>
    </div>
  );
}

// 9. Quote Block Renderer (Clean Surface & Hairline Border)
function RenderQuote({ block }: { block: QuoteBlock }) {
  const { text, author, citationUrl } = block.data;

  return (
    <blockquote className="relative border border-slate-200 bg-slate-50/80 rounded-2xl p-5 sm:p-6 m-0">
      <Quote className="w-6 h-6 text-emerald-600/35 mb-2" />
      <p className="text-[16px] sm:text-[17px] text-slate-800 leading-8 mb-3 font-medium whitespace-pre-line">
        «{text}»
      </p>
      {(author || citationUrl) && (
        <footer className="text-xs sm:text-sm font-semibold text-slate-600 flex flex-wrap items-center gap-2">
          <span>— {author || 'منبع'}</span>
          {citationUrl && isSafeUrl(citationUrl) && (
            <a
              href={citationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:underline"
            >
              (پیوند ارجاع)
            </a>
          )}
        </footer>
      )}
    </blockquote>
  );
}

// 10. Divider Block Renderer
function RenderDivider() {
  return <hr className="my-4 border-t border-slate-200/80" />;
}

// 11. Downloadable File Block Renderer
function RenderDownloadableFile({ block }: { block: DownloadableFileBlock }) {
  const { storageKey, title, description, sizeBytes } = block.data;
  const mediaSrc = resolveMediaSrc(storageKey);
  const safeHref = isSafeUrl(mediaSrc) ? mediaSrc : '#';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 flex items-center justify-center shrink-0">
          <FileDown className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{title}</h4>
          {description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-mono" dir="ltr">
            <span className="tabular-nums">{formatFileSize(sizeBytes)}</span>
            <span>·</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{storageKey}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <a
          href={safeHref}
          download
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span>دریافت فایل</span>
        </a>
      </div>
    </div>
  );
}

// 12. List Block Renderer (Vertically Stacked, Clean Markers)
function RenderList({ block }: { block: ListBlock }) {
  const { format, items } = block.data;

  if (format === 'ordered') {
    return (
      <ol className="list-none !p-0 !m-0 space-y-3 text-[15.5px] sm:text-[16.5px] text-slate-700 leading-relaxed font-normal">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 !pr-0">
            <span
              aria-hidden="true"
              className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-800 text-xs font-bold shrink-0 tabular-nums"
            >
              {idx + 1}
            </span>
            <span className="flex-1 min-w-0">{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="list-none !p-0 !m-0 space-y-3 text-[15.5px] sm:text-[16.5px] text-slate-700 leading-relaxed font-normal">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5 !pr-0">
          <span
            aria-hidden="true"
            className="mt-2.5 h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0"
          />
          <span className="flex-1 min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// 13. Interactive Example Block Renderer (Mounted Strictly Isolated Sandbox)
function RenderInteractiveExample({
  block,
  courseSlug,
  lessonSlug,
}: {
  block: InteractiveExampleBlock;
  courseSlug?: string;
  lessonSlug?: string;
}) {
  const { environment, preset, title, description, files } = block.data;

  return (
    <InteractiveSandbox
      environment={environment}
      preset={preset}
      title={title}
      description={description}
      files={files}
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
      blockId={block.id}
    />
  );
}

// Fallback for Unsupported / Unknown Block Types
function RenderUnsupportedBlock({
  block,
}: {
  block: { id?: string; type?: string; version?: number };
}) {
  return (
    <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-600 text-sm flex items-center gap-3">
      <Info className="w-5 h-5 text-slate-400 shrink-0" />
      <span>
        این بلوک محتوایی با نوع «{block.type || 'نامشخص'}» و نسخه {block.version || 1} در این مرحله پشتیبانی نمی‌شود.
      </span>
    </div>
  );
}

/**
 * Main Content Blocks Renderer
 * Exhaustively matches all 13 content block types using stable block IDs as React keys.
 */
export default function ContentBlocksRenderer({
  blocks,
  schemaVersion = 1,
  courseSlug,
  lessonSlug,
}: ContentBlocksRendererProps) {
  const headingAnchorsByBlockId = useMemo(() => {
    const map = new Map<string, string>();
    const extracted = extractLessonHeadings(blocks);
    let headingIdx = 0;
    for (const b of blocks || []) {
      if (b.type === 'heading' && b.data?.text && extracted[headingIdx]) {
        map.set(b.id, extracted[headingIdx].id);
        headingIdx++;
      }
    }
    return map;
  }, [blocks]);

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        محتوای متنی برای این درس ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="lesson-content w-full space-y-5 sm:space-y-6" data-schema-version={schemaVersion}>
      {blocks.map((block) => {
        const key = block.id;

        switch (block.type) {
          case 'heading':
            return (
              <RenderHeading
                key={key}
                block={block}
                anchorId={headingAnchorsByBlockId.get(block.id) || 'section'}
              />
            );
          case 'paragraph':
            return <RenderParagraph key={key} block={block} />;
          case 'richText':
            return <RenderRichText key={key} block={block} />;
          case 'codeBlock':
            return (
              <RenderCodeBlock
                key={key}
                block={block}
                courseSlug={courseSlug}
                lessonSlug={lessonSlug}
              />
            );
          case 'image':
            return <RenderImage key={key} block={block} />;
          case 'video':
            return <RenderVideo key={key} block={block} />;
          case 'table':
            return <RenderTable key={key} block={block} />;
          case 'callout':
            return <RenderCallout key={key} block={block} />;
          case 'quote':
            return <RenderQuote key={key} block={block} />;
          case 'divider':
            return <RenderDivider key={key} />;
          case 'downloadableFile':
            return <RenderDownloadableFile key={key} block={block} />;
          case 'list':
            return <RenderList key={key} block={block} />;
          case 'interactiveExample':
            return (
              <RenderInteractiveExample
                key={key}
                block={block}
                courseSlug={courseSlug}
                lessonSlug={lessonSlug}
              />
            );
          default:
            return (
              <RenderUnsupportedBlock key={key || Math.random().toString()} block={block} />
            );
        }
      })}
    </div>
  );
}

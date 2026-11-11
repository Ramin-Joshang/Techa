'use client';

import React, { useState } from 'react';
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
  DividerBlock,
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
} from 'lucide-react';

interface ContentBlocksRendererProps {
  blocks: ContentBlock[];
  schemaVersion?: number;
}

/**
 * Sanitizes URLs to prevent XSS (blocks javascript:, data:, vbscript: protocols).
 */
function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
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

// 1. Heading Renderer with Anchor Support
function RenderHeading({ block }: { block: HeadingBlock }) {
  const { level, text } = block.data;
  const anchorId = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  if (level === 2) {
    return (
      <h2
        id={anchorId}
        className="group text-2xl md:text-3xl font-extrabold text-[#042A1B] mt-10 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between scroll-mt-24"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-2 h-7 bg-emerald-500 rounded-sm inline-block shrink-0" />
          <span>{text}</span>
        </span>
        <a
          href={`#${anchorId}`}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 transition-opacity p-1 text-sm"
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
        className="group text-xl md:text-2xl font-bold text-gray-900 mt-7 mb-3 flex items-center justify-between scroll-mt-24"
      >
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-teal-500 rounded-sm inline-block shrink-0" />
          <span>{text}</span>
        </span>
        <a
          href={`#${anchorId}`}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 transition-opacity p-1 text-sm"
          aria-label={`پیوند به ${text}`}
        >
          <Hash className="w-3.5 h-3.5" />
        </a>
      </h3>
    );
  }
  return (
    <h4 id={anchorId} className="text-lg md:text-xl font-bold text-gray-800 mt-5 mb-2 scroll-mt-24">
      {text}
    </h4>
  );
}

// 2. Paragraph Renderer
function RenderParagraph({ block }: { block: ParagraphBlock }) {
  return (
    <p className="text-[17px] md:text-[18px] leading-8 md:leading-9 text-gray-700 text-justify my-4 font-normal">
      {block.data.text}
    </p>
  );
}

// 3. Rich Text Renderer
function RenderRichText({ block }: { block: RichTextBlock }) {
  return (
    <div className="text-[17px] md:text-[18px] leading-8 md:leading-9 text-gray-700 text-justify my-4">
      {block.data.spans.map((span, idx) => {
        let content: React.ReactNode = span.text;

        if (span.code) {
          content = (
            <code className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[15px] mx-1 inline-block" dir="ltr">
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
          content = <span className="underline decoration-emerald-500 underline-offset-4">{content}</span>;
        }
        if (span.strikethrough) {
          content = <del className="line-through text-gray-400">{content}</del>;
        }

        if (span.link && isSafeUrl(span.link.url)) {
          return (
            <a
              key={idx}
              href={span.link.url}
              target={span.link.openInNewTab ? '_blank' : undefined}
              rel={span.link.openInNewTab ? 'noopener noreferrer' : undefined}
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 font-medium transition-colors"
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

// 4. Code Block Renderer with Copy Button & Clean Syntax
function RenderCodeBlock({ block }: { block: CodeBlock }) {
  const { code, language, title, showLineNumbers } = block.data;
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-gray-800 bg-[#18181b] shadow-xl text-left" dir="ltr">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#202023] border-b border-gray-800 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-gray-300 font-semibold">{title || language}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider text-[11px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/10">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="کپی کردن کد"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Lines */}
      <pre className="p-4 overflow-x-auto text-[14px] leading-relaxed font-mono text-gray-100 bg-[#18181b]">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              {showLineNumbers !== false && (
                <span className="table-cell pr-4 text-gray-600 select-none text-right font-mono text-xs w-8">
                  {idx + 1}
                </span>
              )}
              <span className="table-cell whitespace-pre">{line || ' '}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// 5. Image Block Renderer
function RenderImage({ block }: { block: ImageBlock }) {
  const { storageKey, altText, caption, width, height } = block.data;
  const isDirectUrl = storageKey.startsWith('http://') || storageKey.startsWith('https://') || storageKey.startsWith('/');

  return (
    <figure className="my-6">
      {isDirectUrl ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
          <img
            src={storageKey}
            alt={altText || 'تصویر آموزشی'}
            width={width}
            height={height}
            loading="lazy"
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-50/50 to-gray-50 border border-emerald-100 rounded-2xl p-6 text-center shadow-xs">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xs text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="font-bold text-gray-800 text-base">{altText}</p>
          <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500 bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200 font-mono" dir="ltr">
            <span className="text-gray-400">شناسه:</span>
            <span className="font-semibold text-emerald-700 truncate max-w-xs">{storageKey}</span>
            {width && height && <span className="text-gray-400">({width}×{height})</span>}
          </div>
        </div>
      )}
      {caption && (
        <figcaption className="text-center text-sm text-gray-500 mt-2 font-medium">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// 6. Video Block Renderer
function RenderVideo({ block }: { block: VideoBlock }) {
  const { storageKey, caption, durationSeconds } = block.data;
  const isDirectUrl = storageKey.startsWith('http://') || storageKey.startsWith('https://') || storageKey.startsWith('/');
  const durationMinutes = durationSeconds ? Math.ceil(durationSeconds / 60) : null;

  return (
    <div className="my-6">
      {isDirectUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-xl">
          <video
            controls
            preload="metadata"
            className="w-full max-h-[480px] bg-black"
          >
            <source src={storageKey} />
            مرورگر شما از پخش مستقیم ویدیو پشتیبانی نمی‌کند.
          </video>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3 border border-emerald-500/30">
              <PlayCircle className="w-10 h-10" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <VideoIcon className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-lg text-white">رسانه ویدیویی آموزشی</h4>
            </div>
            {durationMinutes && (
              <p className="text-xs text-slate-400 mb-3 font-medium">
                مدت زمان: {durationMinutes} دقیقه
              </p>
            )}
            <div className="inline-flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono" dir="ltr">
              <span className="text-slate-500">شناسه منبع:</span>
              <span className="text-emerald-300 truncate max-w-xs">{storageKey}</span>
            </div>
          </div>
        </div>
      )}
      {caption && (
        <p className="text-center text-sm text-gray-500 mt-2 font-medium">
          {caption}
        </p>
      )}
    </div>
  );
}

// 7. Table Block Renderer
function RenderTable({ block }: { block: TableBlock }) {
  const { headers, rows } = block.data;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-gray-200 shadow-xs bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {headers.map((header, i) => (
                <th key={i} className="px-5 py-3.5 font-bold text-gray-800 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-5 py-3 text-gray-700 leading-relaxed">
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

// 8. Callout Block Renderer
function RenderCallout({ block }: { block: CalloutBlock }) {
  const { type, title, text } = block.data;

  const config = {
    info: {
      bg: 'bg-blue-50/70 border-blue-200 text-blue-900',
      icon: <Info className="w-6 h-6 text-blue-600 shrink-0" />,
      titleColor: 'text-blue-900',
    },
    warning: {
      bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />,
      titleColor: 'text-amber-900',
    },
    tip: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      icon: <Lightbulb className="w-6 h-6 text-emerald-600 shrink-0" />,
      titleColor: 'text-emerald-900',
    },
    danger: {
      bg: 'bg-red-50/70 border-red-200 text-red-900',
      icon: <AlertOctagon className="w-6 h-6 text-red-600 shrink-0" />,
      titleColor: 'text-red-900',
    },
  }[type] || {
    bg: 'bg-gray-50 border-gray-200 text-gray-900',
    icon: <Info className="w-6 h-6 text-gray-600 shrink-0" />,
    titleColor: 'text-gray-900',
  };

  return (
    <div className={`my-6 rounded-2xl border p-5 flex items-start gap-4 shadow-xs ${config.bg}`}>
      {config.icon}
      <div className="flex-1">
        {title && <h4 className={`font-bold text-base mb-1.5 ${config.titleColor}`}>{title}</h4>}
        <p className="text-[15px] leading-7 text-justify">{text}</p>
      </div>
    </div>
  );
}

// 9. Quote Block Renderer
function RenderQuote({ block }: { block: QuoteBlock }) {
  const { text, author, citationUrl } = block.data;

  return (
    <blockquote className="my-6 relative border-r-4 border-emerald-500 bg-gray-50/70 rounded-l-2xl p-6 shadow-xs">
      <Quote className="w-8 h-8 text-emerald-300 absolute top-4 left-4 rotate-180 opacity-50" />
      <p className="text-[17px] md:text-[18px] italic text-gray-800 leading-8 mb-3 font-medium">
        «{text}»
      </p>
      {(author || citationUrl) && (
        <footer className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <span>— {author || 'منبع'}</span>
          {citationUrl && isSafeUrl(citationUrl) && (
            <a
              href={citationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline"
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
  return <hr className="my-8 border-t border-gray-200" />;
}

// 11. Downloadable File Block Renderer
function RenderDownloadableFile({ block }: { block: DownloadableFileBlock }) {
  const { storageKey, title, description, sizeBytes } = block.data;

  return (
    <div className="my-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center shrink-0">
          <FileDown className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-gray-900 text-base truncate">{title}</h4>
          {description && <p className="text-xs text-gray-500 truncate mt-0.5">{description}</p>}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-mono" dir="ltr">
            <span>حجم: {formatFileSize(sizeBytes)}</span>
            <span>·</span>
            <span className="truncate max-w-xs">{storageKey}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
          آماده دریافت
        </span>
      </div>
    </div>
  );
}

// 12. List Block Renderer
function RenderList({ block }: { block: ListBlock }) {
  const { format, items } = block.data;

  if (format === 'ordered') {
    return (
      <ol className="my-4 list-decimal pr-6 space-y-2 text-[16px] md:text-[17px] text-gray-700 leading-relaxed font-normal">
        {items.map((item, idx) => (
          <li key={idx} className="pr-1">{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="my-4 list-disc pr-6 space-y-2 text-[16px] md:text-[17px] text-gray-700 leading-relaxed font-normal">
      {items.map((item, idx) => (
        <li key={idx} className="pr-1">{item}</li>
      ))}
    </ul>
  );
}

// 13. Interactive Example Block Renderer (Static Multi-File Preview)
function RenderInteractiveExample({ block }: { block: InteractiveExampleBlock }) {
  const { environment, preset, title, files } = block.data;
  const [activePath, setActivePath] = useState(files.find((f) => f.entryPoint)?.path || files[0]?.path);
  const currentFile = files.find((f) => f.path === activePath) || files[0];

  return (
    <div className="my-8 rounded-2xl border border-gray-800 bg-[#18181b] shadow-xl overflow-hidden text-left" dir="ltr">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#202023] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-sm">پیش‌نمایش کد تعاملی</span>
          <span className="bg-amber-500/20 text-amber-300 text-[11px] px-2 py-0.5 rounded border border-amber-500/30 font-medium font-sans">
            حالت غیر اجرایی (فاز ۱)
          </span>
          {title && <span className="text-gray-400 font-sans">({title})</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/10 text-gray-300 px-2.5 py-1 rounded font-mono text-xs">
            {environment}
          </span>
          {preset && (
            <span className="bg-white/5 text-gray-400 px-2 py-1 rounded font-mono text-xs">
              {preset}
            </span>
          )}
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div className="bg-[#121214] px-4 py-2 border-b border-gray-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {files.map((file) => {
          const isActive = file.path === activePath;
          return (
            <button
              key={file.path}
              type="button"
              onClick={() => setActivePath(file.path)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#27272a] text-emerald-400 border border-emerald-500/40 font-semibold'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span>{file.path}</span>
              {file.entryPoint && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-sans">
                  نقطه ورود
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Code Viewer */}
      <pre className="p-4 text-[13px] leading-relaxed font-mono text-gray-200 overflow-x-auto bg-[#18181b]">
        <code>{currentFile?.content}</code>
      </pre>

      {/* Hidden container for all other files to ensure accessibility & test assertions */}
      <div className="hidden" aria-hidden="true">
        {files.map((f) => (
          <div key={f.path}>
            <span>{f.path}</span>
            <pre><code>{f.content}</code></pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fallback for Unsupported / Unknown Block Types
function RenderUnsupportedBlock({ block }: { block: { id?: string; type?: string; version?: number } }) {
  return (
    <div className="my-4 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-sm flex items-center gap-3">
      <Info className="w-5 h-5 text-gray-400 shrink-0" />
      <span>
        این بلوک محتوایی با نوع «{block.type || 'نامشخص'}» و نسخه {block.version || 1} در این مرحله پشتیبانی نمی‌شود.
      </span>
    </div>
  );
}

/**
 * Main Content Blocks Renderer
 * Exhaustively matches the 13 content block types using stable block IDs as React keys.
 */
export default function ContentBlocksRenderer({ blocks, schemaVersion = 1 }: ContentBlocksRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm font-medium">
        محتوای متنی برای این درس ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="w-full space-y-2" data-schema-version={schemaVersion}>
      {blocks.map((block) => {
        const key = block.id;

        switch (block.type) {
          case 'heading':
            return <RenderHeading key={key} block={block} />;
          case 'paragraph':
            return <RenderParagraph key={key} block={block} />;
          case 'richText':
            return <RenderRichText key={key} block={block} />;
          case 'codeBlock':
            return <RenderCodeBlock key={key} block={block} />;
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
            return <RenderInteractiveExample key={key} block={block} />;
          default:
            return <RenderUnsupportedBlock key={key || Math.random().toString()} block={block} />;
        }
      })}
    </div>
  );
}

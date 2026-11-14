'use client';

import React, { useState } from 'react';
import { CoursePublicDto } from '@techa/shared';
import {
  BookOpen,
  Code2,
  Cpu,
  FileCode2,
  Terminal,
  Database,
  Layers,
  Globe,
} from 'lucide-react';
import { resolvePublicMediaUrl } from '../../lib/format-duration';

interface CourseCoverMediaProps {
  title: string;
  slug?: string;
  coverStorageKey?: string | null;
  icon?: CoursePublicDto['icon'];
  className?: string;
}

const SLUG_THEMES: Array<{ match: string; gradient: string; accent: string }> = [
  { match: 'react', gradient: 'from-[#042A1B] via-[#063A27] to-[#0B4F38]', accent: 'text-[#7AE36A]' },
  { match: 'next', gradient: 'from-[#091815] via-[#0B2B22] to-[#124536]', accent: 'text-emerald-300' },
  { match: 'typescript', gradient: 'from-[#0B1E36] via-[#0E2F56] to-[#164275]', accent: 'text-sky-300' },
  { match: 'js', gradient: 'from-[#2A2006] via-[#3F3108] to-[#56430C]', accent: 'text-amber-300' },
  { match: 'css', gradient: 'from-[#0E223A] via-[#133357] to-[#1D4877]', accent: 'text-cyan-300' },
  { match: 'html', gradient: 'from-[#33140A] via-[#4A1E0F] to-[#632915]', accent: 'text-orange-300' },
  { match: 'sql', gradient: 'from-[#161B33] via-[#1F2749] to-[#2B3664]', accent: 'text-indigo-300' },
];

function getVisualTheme(slug?: string) {
  const lower = (slug || '').toLowerCase();
  return (
    SLUG_THEMES.find((item) => lower.includes(item.match)) || {
      gradient: 'from-[#042A1B] via-[#063925] to-[#0B4D32]',
      accent: 'text-[#7AE36A]',
    }
  );
}

export function CourseFallbackIcon({
  icon,
  slug,
  className = 'w-8 h-8',
}: {
  icon?: CoursePublicDto['icon'];
  slug?: string;
  className?: string;
}) {
  const key = `${icon?.kind === 'system' ? icon.name : ''} ${slug || ''}`.toLowerCase();
  if (key.includes('node') || key.includes('express') || key.includes('server') || key.includes('terminal')) {
    return <Terminal className={className} />;
  }
  if (key.includes('database') || key.includes('sql') || key.includes('mongo')) {
    return <Database className={className} />;
  }
  if (key.includes('typescript') || key.includes('ts')) {
    return <FileCode2 className={className} />;
  }
  if (key.includes('react') || key.includes('next') || key.includes('js') || key.includes('code')) {
    return <Code2 className={className} />;
  }
  if (key.includes('layers') || key.includes('css') || key.includes('tailwind')) {
    return <Layers className={className} />;
  }
  if (key.includes('globe') || key.includes('html') || key.includes('web')) {
    return <Globe className={className} />;
  }
  if (key.includes('cpu') || key.includes('arch')) {
    return <Cpu className={className} />;
  }
  return <BookOpen className={className} />;
}

export default function CourseCoverMedia({
  title,
  slug,
  coverStorageKey,
  icon,
  className = 'h-44',
}: CourseCoverMediaProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const coverUrl = resolvePublicMediaUrl(coverStorageKey);
  const iconMediaUrl =
    icon?.kind === 'media' ? resolvePublicMediaUrl(icon.storageKey) : null;
  const theme = getVisualTheme(slug);

  if (coverUrl && !imgFailed) {
    return (
      <div className={`relative w-full overflow-hidden bg-[#042A1B] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`تصویر دوره ${title}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${theme.gradient} flex items-center justify-center ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shadow-lg ${theme.accent}`}>
          {iconMediaUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={iconMediaUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain rounded"
            />
          ) : (
            <CourseFallbackIcon icon={icon} slug={slug} className="w-7 h-7" />
          )}
        </div>
        {slug && (
          <span
            dir="ltr"
            className="text-[11px] font-mono tracking-wider uppercase text-white/60"
          >
            {slug}
          </span>
        )}
      </div>
    </div>
  );
}

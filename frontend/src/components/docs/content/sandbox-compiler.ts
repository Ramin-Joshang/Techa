export type SandboxEnvironment = 'html-css-js' | 'react' | 'react-tailwind';

export interface SandboxFileInput {
  path: string;
  language: string;
  content: string;
  entryPoint: boolean;
  readOnly?: boolean;
}

export interface BabelTransformLike {
  transform: (
    code: string,
    options: Record<string, unknown>
  ) => { code?: string | null };
}

export interface BuildSandboxResult {
  ok: boolean;
  html: string;
  errorMessage?: string;
}

const ALLOWED_ENVIRONMENTS = new Set<string>(['html-css-js', 'react', 'react-tailwind']);

const SANDBOX_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https: data: blob:; font-src https: data:;";

const COLOR_PALETTE: Record<string, Record<string, string>> = {
  slate: { '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0', '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b', '600': '#475569', '700': '#334155', '800': '#1e293b', '900': '#0f172a', '950': '#020617' },
  gray: { '50': '#f9fafb', '100': '#f3f4f6', '200': '#e5e7eb', '300': '#d1d5db', '400': '#9ca3af', '500': '#6b7280', '600': '#4b5563', '700': '#374151', '800': '#1f2937', '900': '#111827', '950': '#030712' },
  zinc: { '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8', '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46', '800': '#27272a', '900': '#18181b', '950': '#09090b' },
  emerald: { '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' },
  green: { '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d', '800': '#166534', '900': '#14532d' },
  teal: { '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a' },
  cyan: { '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9', '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63' },
  sky: { '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e' },
  blue: { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a' },
  indigo: { '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81' },
  violet: { '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95' },
  purple: { '50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe', '400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce' },
  pink: { '50': '#fdf2f8', '100': '#fce7f3', '200': '#fbcfe8', '300': '#f9a8d4', '400': '#f472b6', '500': '#ec4899', '600': '#db2777', '700': '#be185d' },
  orange: { '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c' },
  amber: { '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f' },
  yellow: { '50': '#fefce8', '100': '#fef9c3', '200': '#fef08a', '300': '#fde047', '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207' },
  red: { '50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5', '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c', '800': '#991b1b', '900': '#7f1d1d' },
  rose: { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c' },
};

const SPACING_SCALE: Record<string, string> = {
  '0': '0px', '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem', '2': '0.5rem',
  '2.5': '0.625rem', '3': '0.75rem', '3.5': '0.875rem', '4': '1rem', '5': '1.25rem',
  '6': '1.5rem', '7': '1.75rem', '8': '2rem', '9': '2.25rem', '10': '2.5rem',
  '12': '3rem', '14': '3.5rem', '16': '4rem', '20': '5rem', '24': '6rem',
  'px': '1px', 'auto': 'auto', 'full': '100%',
};

const WIDTH_SCALE: Record<string, string> = {
  ...SPACING_SCALE,
  xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', '2xl': '42rem',
  '3xl': '48rem', '4xl': '56rem', '5xl': '64rem',
  '1/2': '50%', '1/3': '33.333333%', '2/3': '66.666667%', '1/4': '25%', '3/4': '75%',
  fit: 'fit-content', screen: '100vw',
};

const RADIUS_SCALE: Record<string, string> = {
  none: '0px', sm: '0.125rem', DEFAULT: '0.25rem', md: '0.375rem', lg: '0.5rem',
  xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
};

function hexToRgba(hex: string, alphaPercent: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${(alphaPercent / 100).toFixed(2)})`;
}

function resolveColorToken(token: string): string | null {
  const [colorPart, alphaPart] = token.split('/');
  let hex: string | null = null;

  if (colorPart === 'white') hex = '#ffffff';
  else if (colorPart === 'black') hex = '#000000';
  else if (colorPart === 'transparent') return 'transparent';
  else if (colorPart.startsWith('[') && colorPart.endsWith(']')) {
    return colorPart.slice(1, -1);
  } else {
    const dashIdx = colorPart.lastIndexOf('-');
    if (dashIdx > 0) {
      const family = colorPart.slice(0, dashIdx);
      const shade = colorPart.slice(dashIdx + 1);
      hex = COLOR_PALETTE[family]?.[shade] ?? null;
    }
  }

  if (!hex) return null;
  if (alphaPart && /^\d+$/.test(alphaPart)) {
    return hexToRgba(hex, Number(alphaPart));
  }
  return hex;
}

function resolveScaleVal(val: string, map: Record<string, string>): string | null {
  if (val.startsWith('[') && val.endsWith(']')) return val.slice(1, -1);
  return map[val] ?? null;
}

function cssDeclForUtility(util: string): { decl: string; childSelector?: string } | null {
  // Display & Layout
  const exactMap: Record<string, string> = {
    block: 'display: block;',
    'inline-block': 'display: inline-block;',
    inline: 'display: inline;',
    flex: 'display: flex;',
    'inline-flex': 'display: inline-flex;',
    grid: 'display: grid;',
    hidden: 'display: none;',
    'flex-col': 'flex-direction: column;',
    'flex-row': 'flex-direction: row;',
    'flex-wrap': 'flex-wrap: wrap;',
    'flex-1': 'flex: 1 1 0%;',
    'shrink-0': 'flex-shrink: 0;',
    'items-center': 'align-items: center;',
    'items-start': 'align-items: flex-start;',
    'items-end': 'align-items: flex-end;',
    'justify-center': 'justify-content: center;',
    'justify-between': 'justify-content: space-between;',
    'justify-start': 'justify-content: flex-start;',
    'justify-end': 'justify-content: flex-end;',
    relative: 'position: relative;',
    absolute: 'position: absolute;',
    'text-center': 'text-align: center;',
    'text-right': 'text-align: right;',
    'text-left': 'text-align: left;',
    'font-sans': 'font-family: system-ui, -apple-system, sans-serif;',
    'font-mono': 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;',
    'font-normal': 'font-weight: 400;',
    'font-medium': 'font-weight: 500;',
    'font-semibold': 'font-weight: 600;',
    'font-bold': 'font-weight: 700;',
    'font-extrabold': 'font-weight: 800;',
    'font-black': 'font-weight: 900;',
    italic: 'font-style: italic;',
    underline: 'text-decoration-line: underline;',
    'line-through': 'text-decoration-line: line-through;',
    'cursor-pointer': 'cursor: pointer;',
    'select-none': 'user-select: none;',
    'overflow-hidden': 'overflow: hidden;',
    'overflow-x-auto': 'overflow-x: auto;',
    'transition-all': 'transition: all 150ms cubic-bezier(0.4,0,0.2,1);',
    'transition-colors': 'transition: color, background-color, border-color 150ms cubic-bezier(0.4,0,0.2,1);',
    border: 'border-width: 1px; border-style: solid; border-color: #e2e8f0;',
    'border-b': 'border-bottom-width: 1px; border-bottom-style: solid; border-color: #e2e8f0;',
    'border-t': 'border-top-width: 1px; border-top-style: solid; border-color: #e2e8f0;',
    'shadow-xs': 'box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);',
    'shadow-sm': 'box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);',
    shadow: 'box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);',
    'shadow-md': 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);',
    'shadow-lg': 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);',
    'shadow-xl': 'box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);',
    'text-xs': 'font-size: 0.75rem; line-height: 1rem;',
    'text-sm': 'font-size: 0.875rem; line-height: 1.25rem;',
    'text-base': 'font-size: 1rem; line-height: 1.5rem;',
    'text-lg': 'font-size: 1.125rem; line-height: 1.75rem;',
    'text-xl': 'font-size: 1.25rem; line-height: 1.75rem;',
    'text-2xl': 'font-size: 1.5rem; line-height: 2rem;',
    'text-3xl': 'font-size: 1.875rem; line-height: 2.25rem;',
    'text-4xl': 'font-size: 2.25rem; line-height: 2.5rem;',
    'leading-relaxed': 'line-height: 1.625;',
    'leading-tight': 'line-height: 1.25;',
    'w-full': 'width: 100%;',
    'h-full': 'height: 100%;',
    'min-h-screen': 'min-height: 100vh;',
    'mx-auto': 'margin-left: auto; margin-right: auto;',
    'space-y-2': '',
  };
  if (exactMap[util]) return { decl: exactMap[util] };

  // Spacing: p, px, py, pt, pb, pl, pr, m, mx, my, mt, mb, ml, mr, gap, gap-x, gap-y
  const spaceMatch = /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap-x|gap-y|gap)-(.+)$/.exec(util);
  if (spaceMatch) {
    const [, prop, rawVal] = spaceMatch;
    const val = resolveScaleVal(rawVal, SPACING_SCALE);
    if (val) {
      const propMap: Record<string, string> = {
        p: `padding: ${val};`,
        px: `padding-left: ${val}; padding-right: ${val};`,
        py: `padding-top: ${val}; padding-bottom: ${val};`,
        pt: `padding-top: ${val};`,
        pb: `padding-bottom: ${val};`,
        pl: `padding-left: ${val};`,
        pr: `padding-right: ${val};`,
        m: `margin: ${val};`,
        mx: `margin-left: ${val}; margin-right: ${val};`,
        my: `margin-top: ${val}; margin-bottom: ${val};`,
        mt: `margin-top: ${val};`,
        mb: `margin-bottom: ${val};`,
        ml: `margin-left: ${val};`,
        mr: `margin-right: ${val};`,
        gap: `gap: ${val};`,
        'gap-x': `column-gap: ${val};`,
        'gap-y': `row-gap: ${val};`,
      };
      return { decl: propMap[prop] };
    }
  }

  // Space-y / space-x
  const stackMatch = /^space-(y|x)-(.+)$/.exec(util);
  if (stackMatch) {
    const val = resolveScaleVal(stackMatch[2], SPACING_SCALE);
    if (val) {
      return {
        decl: stackMatch[1] === 'y' ? `margin-top: ${val};` : `margin-inline-start: ${val};`,
        childSelector: ' > :not([hidden]) ~ :not([hidden])',
      };
    }
  }

  // Width & Height
  const sizeMatch = /^(w|h|min-w|max-w|min-h)-(.+)$/.exec(util);
  if (sizeMatch) {
    const val = resolveScaleVal(sizeMatch[2], WIDTH_SCALE);
    if (val) {
      const map: Record<string, string> = {
        w: `width: ${val};`,
        h: `height: ${val};`,
        'min-w': `min-width: ${val};`,
        'max-w': `max-width: ${val};`,
        'min-h': `min-height: ${val};`,
      };
      return { decl: map[sizeMatch[1]] };
    }
  }

  // Grid cols
  const gridMatch = /^grid-cols-(\d+)$/.exec(util);
  if (gridMatch) {
    return { decl: `grid-template-columns: repeat(${gridMatch[1]}, minmax(0, 1fr));` };
  }

  // Border radius
  if (util === 'rounded') return { decl: `border-radius: ${RADIUS_SCALE.DEFAULT};` };
  if (util.startsWith('rounded-')) {
    const r = RADIUS_SCALE[util.slice('rounded-'.length)];
    if (r) return { decl: `border-radius: ${r};` };
  }

  // Colors: bg-*, text-*, border-*
  if (util.startsWith('bg-')) {
    const c = resolveColorToken(util.slice(3));
    if (c) return { decl: `background-color: ${c};` };
  }
  if (util.startsWith('text-')) {
    const c = resolveColorToken(util.slice(5));
    if (c) return { decl: `color: ${c};` };
  }
  if (util.startsWith('border-')) {
    const c = resolveColorToken(util.slice(7));
    if (c) return { decl: `border-color: ${c};` };
  }

  return null;
}

function escapeCssSelector(cls: string): string {
  return cls.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

export function generateTailwindUtilitiesCss(sourceText: string): string {
  const tokenRegex = /[A-Za-z0-9_:\-[\]/.#]+/g;
  const seen = new Set<string>();
  const baseRules: string[] = [
    '*, *::before, *::after { box-sizing: border-box; }',
    'button { font: inherit; color: inherit; background: transparent; border: 0; }',
  ];
  const responsiveRules: Record<string, string[]> = { sm: [], md: [], lg: [] };

  const matches = sourceText.match(tokenRegex) || [];
  for (const raw of matches) {
    if (seen.has(raw)) continue;
    seen.add(raw);

    const parts = raw.split(':');
    const utilName = parts[parts.length - 1];
    const resolved = cssDeclForUtility(utilName);
    if (!resolved) continue;

    let pseudo = '';
    let bp: string | null = null;
    for (let i = 0; i < parts.length - 1; i++) {
      const mod = parts[i];
      if (mod === 'hover') pseudo = ':hover';
      else if (mod === 'focus') pseudo = ':focus';
      else if (mod === 'active') pseudo = ':active';
      else if (mod === 'sm' || mod === 'md' || mod === 'lg') bp = mod;
    }

    const selector = `.${escapeCssSelector(raw)}${pseudo}${resolved.childSelector || ''}`;
    const rule = `${selector} { ${resolved.decl} }`;
    if (bp) {
      responsiveRules[bp].push(rule);
    } else {
      baseRules.push(rule);
    }
  }

  if (responsiveRules.sm.length) baseRules.push(`@media (min-width: 640px) { ${responsiveRules.sm.join(' ')} }`);
  if (responsiveRules.md.length) baseRules.push(`@media (min-width: 768px) { ${responsiveRules.md.join(' ')} }`);
  if (responsiveRules.lg.length) baseRules.push(`@media (min-width: 1024px) { ${responsiveRules.lg.join(' ')} }`);

  return baseRules.join('\n');
}

/**
 * Injects lightweight loop guard checks into while / for / do loops so infinite loops abort
 * gracefully without freezing the browser tab.
 */
export function injectLoopGuard(code: string): string {
  let guardIdx = 0;
  const header = `var __techaTicks = 0; function __techaTick() { if (++__techaTicks > 50000) { throw new Error('خطای حلقه بی‌نهایت: اجرای حلقه بیش از حد مجاز (۵۰۰۰۰ تکرار) طول کشید.'); } }\n`;

  const guarded = code.replace(
    /\b(while|for)\s*\(([^)]*)\)\s*\{/g,
    (_m, kw, cond) => {
      guardIdx++;
      return `${kw} (${cond}) { if (__techaTicks >= 0) __techaTick(); /* guard_${guardIdx} */`;
    }
  );

  return header + guarded;
}

function escapeInlineScript(code: string): string {
  return code.replace(/<\/script/gi, '<\\/script');
}

function prepareReactSourceBundle(files: SandboxFileInput[]): string {
  const ordered = [
    ...files.filter((f) => !f.entryPoint),
    ...files.filter((f) => f.entryPoint),
  ];

  const jsFiles = ordered.filter((f) =>
    /\.(jsx|tsx|js|ts)$/i.test(f.path)
  );

  const chunks: string[] = [];
  for (const file of jsFiles) {
    let src = file.content || '';
    // Strip external & local ES imports since React hooks & multi-file scope are shared in sandbox
    src = src
      .replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
      .replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');

    if (file.entryPoint) {
      // Rewrite default export cleanly to capture App component
      if (/export\s+default\s+function\s+([A-Za-z0-9_]+)/.test(src)) {
        src = src.replace(
          /export\s+default\s+function\s+([A-Za-z0-9_]+)/,
          'function $1'
        );
        const matchName = /function\s+([A-Za-z0-9_]+)/.exec(src)?.[1];
        if (matchName) {
          src += `\nwindow.__TECHA_APP__ = ${matchName};`;
        }
      } else if (/export\s+default\s+function\s*\(/.test(src)) {
        src = src.replace(/export\s+default\s+function\s*\(/, 'window.__TECHA_APP__ = function(');
      } else if (/export\s+default\s+([A-Za-z0-9_]+)\s*;?/.test(src)) {
        src = src.replace(
          /export\s+default\s+([A-Za-z0-9_]+)\s*;?/,
          'window.__TECHA_APP__ = $1;'
        );
      } else {
        src = src.replace(/export\s+default\s+/g, 'window.__TECHA_APP__ = ');
      }
      src = src.replace(/^\s*export\s+(?=(?:const|let|var|function|class)\b)/gm, '');
    } else {
      src = src
        .replace(/^\s*export\s+default\s+/gm, '')
        .replace(/^\s*export\s+(?=(?:const|let|var|function|class)\b)/gm, '');
    }

    chunks.push(`// --- ${file.path} ---\n${src}`);
  }

  return chunks.join('\n\n');
}

function buildBridgeScript(instanceId: string): string {
  return `
    (function() {
      var INSTANCE_ID = ${JSON.stringify(instanceId)};
      function emit(type, payload) {
        try {
          window.parent.postMessage({
            channel: 'techa-sandbox',
            instanceId: INSTANCE_ID,
            type: type,
            payload: payload
          }, '*');
        } catch (_) {}
      }
      function formatArg(val) {
        if (val instanceof Error) return val.name + ': ' + val.message;
        if (typeof val === 'string') return val;
        if (typeof val === 'number' || typeof val === 'boolean' || val === null || val === undefined) return String(val);
        try { return JSON.stringify(val, null, 2); } catch (_) { return String(val); }
      }
      ['log', 'info', 'warn', 'error'].forEach(function(level) {
        var orig = console[level];
        console[level] = function() {
          var args = Array.prototype.slice.call(arguments).map(formatArg);
          emit('console', { level: level, message: args.join(' ') });
          if (orig) orig.apply(console, arguments);
        };
      });
      console.clear = function() { emit('clear', {}); };
      window.addEventListener('error', function(e) {
        var msg = (e && e.message) ? e.message : 'خطای اجرای ناشناخته';
        emit('runtime-error', { message: msg, line: e && e.lineno ? e.lineno : undefined });
      });
      window.addEventListener('unhandledrejection', function(e) {
        var reason = e && e.reason ? formatArg(e.reason) : 'Promise rejection';
        emit('runtime-error', { message: reason });
      });
      window.__techaReportError = function(msg) {
        emit('runtime-error', { message: String(msg || 'خطای اجرای ناشناخته') });
      };
      emit('ready', {});
    })();
  `;
}

export function buildIsolatedSandboxDocument(params: {
  instanceId: string;
  environment: SandboxEnvironment;
  files: SandboxFileInput[];
  reactRuntimeBundle?: string;
  babel?: BabelTransformLike;
}): BuildSandboxResult {
  const { instanceId, environment, files, reactRuntimeBundle, babel } = params;

  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    return {
      ok: false,
      html: '<!DOCTYPE html><html lang="fa" dir="rtl"><body><p>محیط اجرایی پشتیبانی نمی‌شود.</p></body></html>',
      errorMessage: `محیط اجرایی «${environment}» در این سندباکس مجاز نیست.`,
    };
  }

  const bridgeScript = buildBridgeScript(instanceId);

  // 1. HTML + CSS + JS Runtime
  if (environment === 'html-css-js') {
    let rawHtml = '';
    let css = '';
    let js = '';

    for (const file of files) {
      if (/\.html?$/i.test(file.path)) rawHtml += file.content + '\n';
      else if (/\.css$/i.test(file.path)) css += file.content + '\n';
      else if (/\.jsx?$/i.test(file.path)) js += file.content + '\n';
    }

    let docDir: 'rtl' | 'ltr' = 'rtl';
    let docLang = 'fa';
    let extractedCss = '';
    let extractedJs = '';
    let bodyHtml = rawHtml;

    if (rawHtml.trim()) {
      const htmlTagMatch = /<html\b([^>]*)>/i.exec(rawHtml);
      if (htmlTagMatch) {
        const attrs = htmlTagMatch[1];
        const dirMatch = /\bdir\s*=\s*["']?(ltr|rtl)["']?/i.exec(attrs);
        if (dirMatch) docDir = dirMatch[1].toLowerCase() === 'ltr' ? 'ltr' : 'rtl';
        const langMatch = /\blang\s*=\s*["']?([a-zA-Z-]+)["']?/i.exec(attrs);
        if (langMatch) docLang = langMatch[1];
      }

      // Extract inline <style> tags inside HTML
      bodyHtml = bodyHtml.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_m, styleContent) => {
        extractedCss += '\n' + styleContent;
        return '';
      });

      // Extract inline <script> blocks without src attribute
      bodyHtml = bodyHtml.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_m, attrs, scriptContent) => {
        if (/\bsrc\s*=/i.test(attrs)) {
          return '';
        }
        if (scriptContent && scriptContent.trim()) {
          extractedJs += '\n' + scriptContent;
        }
        return '';
      });

      // If full document with <body>, take inner <body> content
      const bodyMatch = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(bodyHtml);
      if (bodyMatch) {
        bodyHtml = bodyMatch[1];
      } else {
        bodyHtml = bodyHtml
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<\/?(?:html|head|body)\b[^>]*>/gi, '')
          .replace(/<meta\b[^>]*>/gi, '')
          .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
          .replace(/<link\b[^>]*>/gi, '');
      }
    }

    const html = bodyHtml.trim() ? bodyHtml : '<div id="app"></div>';
    const combinedCss = [extractedCss, css].filter((s) => s.trim()).join('\n');
    const combinedJs = [extractedJs, js].filter((s) => s.trim()).join('\n');

    let transpiledJs = combinedJs;
    if (babel && combinedJs.trim()) {
      try {
        const res = babel.transform(combinedJs, {
          filename: 'script.js',
          presets: ['env'],
        });
        transpiledJs = res.code || combinedJs;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطای سینتکس جاوااسکریپت';
        return {
          ok: false,
          html: buildCompileErrorHtml(instanceId, msg),
          errorMessage: msg,
        };
      }
    }

    const guardedJs = transpiledJs.trim()
      ? escapeInlineScript(injectLoopGuard(transpiledJs))
      : '';

    return {
      ok: true,
      html: `<!DOCTYPE html>
<html lang="${docLang}" dir="${docDir}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 16px; color: #0f172a; background: #ffffff; }
    ${combinedCss}
  </style>
</head>
<body>
  ${html}
  <script>${bridgeScript}</script>
  ${
    guardedJs
      ? `<script>
    try {
      ${guardedJs}
    } catch (err) {
      window.__techaReportError(err && err.message ? err.message : err);
    }
  </script>`
      : ''
  }
</body>
</html>`,
    };
  }

  // 2. React 19 / React 19 + Tailwind Runtime
  if (!babel) {
    return {
      ok: false,
      html: buildCompileErrorHtml(instanceId, 'موتور کامپایل کد در حال بارگذاری است...'),
      errorMessage: 'موتور کامپایل هنوز آماده نشده است.',
    };
  }

  if (!reactRuntimeBundle) {
    return {
      ok: false,
      html: buildCompileErrorHtml(instanceId, 'محیط اجرای ری‌اکت در حال بارگذاری است...'),
      errorMessage: 'هسته اجرای محلی React 19 هنوز آماده نشده است.',
    };
  }

  const customCss = files
    .filter((f) => /\.css$/i.test(f.path))
    .map((f) => f.content)
    .join('\n');

  const combinedSource = prepareReactSourceBundle(files);
  const generatedUtilitiesCss = generateTailwindUtilitiesCss(
    combinedSource + '\n' + customCss
  );

  let compiledJs = '';
  try {
    const transformed = babel.transform(combinedSource, {
      filename: 'App.tsx',
      presets: ['react', 'typescript'],
    });
    compiledJs = transformed.code || '';
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطای سینتکس در کامپوننت ری‌اکت';
    return {
      ok: false,
      html: buildCompileErrorHtml(instanceId, msg),
      errorMessage: msg,
    };
  }

  const guardedJs = escapeInlineScript(injectLoopGuard(compiledJs));

  return {
    ok: true,
    html: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 16px; color: #0f172a; background: #ffffff; }
    ${generatedUtilitiesCss}
    ${customCss}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>${bridgeScript}</script>
  <script>${escapeInlineScript(reactRuntimeBundle)}</script>
  <script>
    (function() {
      var React = window.React;
      var ReactDOM = window.ReactDOM;
      if (!React || !ReactDOM || !ReactDOM.createRoot) {
        window.__techaReportError('هسته React 19 بارگذاری نشد.');
        return;
      }

      var useState = React.useState;
      var useEffect = React.useEffect;
      var useRef = React.useRef;
      var useMemo = React.useMemo;
      var useCallback = React.useCallback;
      var useReducer = React.useReducer;
      var useContext = React.useContext;
      var useId = React.useId;
      var createContext = React.createContext;
      var Fragment = React.Fragment;

      function SandboxErrorBoundary(props) {
        return React.Component.call(this, props) || this;
      }
      SandboxErrorBoundary.prototype = Object.create(React.Component.prototype);
      SandboxErrorBoundary.prototype.constructor = SandboxErrorBoundary;
      SandboxErrorBoundary.getDerivedStateFromError = function(error) {
        return { hasError: true, errorMessage: error && error.message ? error.message : String(error) };
      };
      SandboxErrorBoundary.prototype.componentDidCatch = function(error) {
        window.__techaReportError(error && error.message ? error.message : String(error));
      };
      SandboxErrorBoundary.prototype.render = function() {
        if (this.state && this.state.hasError) {
          return React.createElement('div', {
            dir: 'rtl',
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '13px',
              fontFamily: 'system-ui, sans-serif'
            }
          }, 'خطای رندر کامپوننت: ' + this.state.errorMessage);
        }
        return this.props.children;
      };

      try {
        ${guardedJs}

        var TargetComponent = window.__TECHA_APP__ || (typeof App !== 'undefined' ? App : null);
        var rootEl = document.getElementById('root');
        if (TargetComponent && rootEl) {
          ReactDOM.createRoot(rootEl).render(
            React.createElement(SandboxErrorBoundary, null, React.createElement(TargetComponent))
          );
        } else if (rootEl) {
          rootEl.innerHTML = '<div style="color:#475569;font-size:13px;padding:12px;border:1px dashed #cbd5e1;border-radius:10px;">کامپوننت اصلی پیدا نشد. لطفاً با export default یا نام App تعریف کنید.</div>';
        }
      } catch (err) {
        window.__techaReportError(err && err.message ? err.message : err);
      }
    })();
  </script>
</body>
</html>`,
  };
}

function buildCompileErrorHtml(instanceId: string, message: string): string {
  const safeMsg = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}" />
  <style>body{font-family:system-ui,sans-serif;margin:16px;background:#fff;}</style>
</head>
<body>
  <script>${buildBridgeScript(instanceId)}</script>
  <div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:12px;padding:14px;font-size:13px;line-height:1.7;">
    <strong>خطای کامپایل کد:</strong>
    <pre style="margin-top:8px;white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:12px;direction:ltr;text-align:left;">${safeMsg}</pre>
  </div>
</body>
</html>`;
}

import React from 'react';

type TokenType =
  | 'plain'
  | 'comment'
  | 'string'
  | 'keyword'
  | 'number'
  | 'tag'
  | 'attr'
  | 'function'
  | 'operator';

interface Token {
  type: TokenType;
  value: string;
}

const TOKEN_CLASSES: Record<TokenType, string> = {
  plain: 'text-slate-100',
  comment: 'text-slate-500 italic',
  string: 'text-emerald-300',
  keyword: 'text-sky-300 font-medium',
  number: 'text-amber-300',
  tag: 'text-rose-300',
  attr: 'text-amber-200',
  function: 'text-teal-200',
  operator: 'text-slate-400',
};

const JS_KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'function', 'const', 'let', 'var', 'return',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try',
  'catch', 'finally', 'throw', 'async', 'await', 'new', 'class', 'extends', 'interface',
  'type', 'enum', 'implements', 'public', 'private', 'protected', 'readonly', 'as',
  'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'void',
  'React', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
]);

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'ALTER', 'DROP', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON',
  'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'AS', 'AND', 'OR', 'NOT', 'NULL',
  'PRIMARY', 'KEY', 'INDEX', 'UNIQUE', 'COUNT', 'SUM', 'AVG',
]);

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for',
  'while', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue', 'lambda',
  'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'async', 'await', 'print',
]);

function tokenizeLine(line: string, lang: string): Token[] {
  const normLang = (lang || '').toLowerCase();
  const tokens: Token[] = [];
  let i = 0;

  const isHtmlOrCss = ['html', 'xml', 'svg', 'css', 'scss'].includes(normLang);
  const isSql = normLang === 'sql';
  const isPython = ['py', 'python'].includes(normLang);
  const isBash = ['bash', 'sh', 'shell', 'zsh'].includes(normLang);

  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      tokens.push({ type, value });
    }
  };

  while (i < line.length) {
    const ch = line[i];

    // Comments
    if (!isHtmlOrCss && !isSql && !isPython && !isBash && line.startsWith('//', i)) {
      push('comment', line.slice(i));
      break;
    }
    if ((isPython || isBash) && ch === '#') {
      push('comment', line.slice(i));
      break;
    }
    if (isSql && line.startsWith('--', i)) {
      push('comment', line.slice(i));
      break;
    }
    if (line.startsWith('/*', i)) {
      const end = line.indexOf('*/', i + 2);
      if (end !== -1) {
        push('comment', line.slice(i, end + 2));
        i = end + 2;
        continue;
      }
      push('comment', line.slice(i));
      break;
    }
    if (line.startsWith('<!--', i)) {
      const end = line.indexOf('-->', i + 4);
      if (end !== -1) {
        push('comment', line.slice(i, end + 3));
        i = end + 3;
        continue;
      }
      push('comment', line.slice(i));
      break;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === ch) {
          j += 1;
          break;
        }
        j += 1;
      }
      push('string', line.slice(i, j));
      i = j;
      continue;
    }

    // HTML/JSX opening or closing tag names
    if (ch === '<') {
      const match = /^<\/?([A-Za-z][A-Za-z0-9.-]*)/.exec(line.slice(i));
      if (match) {
        const prefix = line[i + 1] === '/' ? '</' : '<';
        push('operator', prefix);
        push('tag', match[1]);
        i += match[0].length;
        continue;
      }
    }

    // Numbers
    if (/[0-9]/.test(ch) && (i === 0 || !/[A-Za-z_$]/.test(line[i - 1]))) {
      const match = /^[0-9]+(?:\.[0-9]+)?/.exec(line.slice(i));
      if (match) {
        push('number', match[0]);
        i += match[0].length;
        continue;
      }
    }

    // Words / Identifiers / Keywords
    if (/[A-Za-z_$]/.test(ch)) {
      const match = /^[A-Za-z0-9_$-]+/.exec(line.slice(i));
      if (match) {
        const word = match[0];
        const nextChar = line[i + word.length];
        if (isSql && SQL_KEYWORDS.has(word.toUpperCase())) {
          push('keyword', word);
        } else if (isPython && PYTHON_KEYWORDS.has(word)) {
          push('keyword', word);
        } else if (!isSql && !isPython && JS_KEYWORDS.has(word)) {
          push('keyword', word);
        } else if (normLang === 'json' && nextChar === ':') {
          push('attr', word);
        } else if (isHtmlOrCss && (nextChar === '=' || nextChar === ':')) {
          push('attr', word);
        } else if (nextChar === '(') {
          push('function', word);
        } else {
          push('plain', word);
        }
        i += word.length;
        continue;
      }
    }

    // Operators / Punctuation
    if (/[{}()[\]=><+\-*/!&|?:;.,]/.test(ch)) {
      push('operator', ch);
      i += 1;
      continue;
    }

    push('plain', ch);
    i += 1;
  }

  return tokens;
}

interface CodeSyntaxHighlighterProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export default function CodeSyntaxHighlighter({
  code,
  language = 'typescript',
  showLineNumbers = true,
}: CodeSyntaxHighlighterProps) {
  const lines = code.split('\n');

  return (
    <pre className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono bg-[#0d131a] text-slate-100 m-0" dir="ltr">
      <code className="block w-max min-w-full">
        {lines.map((line, lineIdx) => {
          const tokens = tokenizeLine(line, language);
          return (
            <div key={lineIdx} className="flex items-start hover:bg-white/[0.03] px-1 rounded">
              {showLineNumbers && (
                <span
                  aria-hidden="true"
                  className="select-none shrink-0 w-9 pr-3 text-right text-xs text-slate-500 font-mono leading-relaxed tabular-nums"
                >
                  {lineIdx + 1}
                </span>
              )}
              <span className="whitespace-pre flex-1">
                {tokens.length > 0
                  ? tokens.map((tok, tIdx) => (
                      <span key={tIdx} className={TOKEN_CLASSES[tok.type]}>
                        {tok.value}
                      </span>
                    ))
                  : ' '}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}

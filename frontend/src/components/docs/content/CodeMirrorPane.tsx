'use client';

import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';

interface CodeMirrorPaneProps {
  value: string;
  filePath: string;
  readOnly?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  onChange: (nextValue: string) => void;
  onRun?: () => void;
  onFormat?: () => void;
}

export default function CodeMirrorPane({
  value,
  filePath,
  readOnly = false,
  wordWrap = false,
  fontSize = 13,
  onChange,
  onRun,
  onFormat,
}: CodeMirrorPaneProps) {
  const extensions = useMemo(() => {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const langExt =
      ext === 'html' || ext === 'htm'
        ? html({ autoCloseTags: true, matchClosingTags: true })
        : ext === 'css'
          ? css()
          : javascript({
              jsx: true,
              typescript: ext === 'ts' || ext === 'tsx',
            });

    const fixedHeightTheme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: `${fontSize}px`,
        backgroundColor: '#0d131a',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
        lineHeight: '1.6',
      },
      '.cm-gutters': {
        backgroundColor: '#0a0f15',
        borderRight: '1px solid rgba(30, 41, 59, 0.85)',
        color: '#64748b',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#6ee7b7',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
      },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(16, 185, 129, 0.25) !important',
      },
    });

    const shortcutKeymap = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          onRun?.();
          return true;
        },
      },
      {
        key: 'Mod-s',
        preventDefault: true,
        run: () => {
          onFormat?.();
          return true;
        },
      },
    ]);

    const list = [langExt, fixedHeightTheme, shortcutKeymap];
    if (wordWrap) {
      list.push(EditorView.lineWrapping);
    }
    return list;
  }, [filePath, fontSize, onFormat, onRun, wordWrap]);

  return (
    <div className="h-full w-full min-h-0 overflow-hidden" dir="ltr">
      <CodeMirror
        value={value}
        height="100%"
        className="h-full"
        theme={oneDark}
        extensions={extensions}
        editable={!readOnly}
        readOnly={readOnly}
        onChange={(val) => {
          if (!readOnly) {
            onChange(val);
          }
        }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          highlightSelectionMatches: true,
          autocompletion: true,
          closeBrackets: true,
          bracketMatching: true,
          indentOnInput: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}

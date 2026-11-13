import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const outDir = path.resolve(process.cwd(), 'public/sandbox');
fs.mkdirSync(outDir, { recursive: true });

esbuild.buildSync({
  stdin: {
    contents: `
      import * as React from 'react';
      import * as ReactDOM from 'react-dom';
      import * as ReactDOMClient from 'react-dom/client';
      window.React = React;
      window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient);
    `,
    resolveDir: path.resolve(process.cwd(), '..'),
    loader: 'js',
  },
  bundle: true,
  minify: true,
  format: 'iife',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: path.join(outDir, 'react-runtime.js'),
});

console.log('Generated public/sandbox/react-runtime.js');

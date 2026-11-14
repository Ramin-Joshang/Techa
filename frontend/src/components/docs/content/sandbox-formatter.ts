export interface FormatCodeResult {
  ok: boolean;
  formatted: string;
  errorMessage?: string;
}

export async function formatSandboxCode(
  code: string,
  filePath: string
): Promise<FormatCodeResult> {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  let parser: 'html' | 'css' | 'babel' | 'typescript' = 'babel';
  if (ext === 'html' || ext === 'htm') parser = 'html';
  else if (ext === 'css') parser = 'css';
  else if (ext === 'ts' || ext === 'tsx') parser = 'typescript';
  else parser = 'babel';

  try {
    const prettier = await import('prettier/standalone');
    const plugins: unknown[] = [];

    if (parser === 'html') {
      const htmlPlugin = await import('prettier/plugins/html');
      plugins.push(htmlPlugin.default || htmlPlugin);
    } else if (parser === 'css') {
      const cssPlugin = await import('prettier/plugins/postcss');
      plugins.push(cssPlugin.default || cssPlugin);
    } else {
      const estreePlugin = await import('prettier/plugins/estree');
      plugins.push(estreePlugin.default || estreePlugin);
      if (parser === 'typescript') {
        const tsPlugin = await import('prettier/plugins/typescript');
        plugins.push(tsPlugin.default || tsPlugin);
      } else {
        const babelPlugin = await import('prettier/plugins/babel');
        plugins.push(babelPlugin.default || babelPlugin);
      }
    }

    const formatted = await prettier.format(code, {
      parser,
      plugins: plugins as never[],
      tabWidth: 2,
      singleQuote: true,
      semi: true,
      printWidth: 85,
    });

    return { ok: true, formatted };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message.split('\n')[0]
        : 'مرتب‌سازی کد به دلیل خطای نحوی انجام نشد.';
    return { ok: false, formatted: code, errorMessage: msg };
  }
}

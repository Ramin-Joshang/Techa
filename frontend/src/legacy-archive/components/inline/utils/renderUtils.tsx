import { createRoot } from "react-dom/client";
import CodeEditor from "../../common/CodeEditor";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

// ---------- تشخیص نوع کد ----------
function detectCodeType(code, className) {
  const trimmed = code.trim();

  // اگر کلاس زبان صریح باشد، اولویت با آن است
  if (className.includes("language-jsx"))
    return { lang: "jsx", executable: true };
  if (className.includes("language-javascript"))
    return { lang: "javascript", executable: true };
  if (className.includes("language-sql"))
    return { lang: "sql", executable: false };
  if (className.includes("language-css"))
    return { lang: "css", executable: false };

  // کلاس markup (HTML)
  if (className.includes("language-markup")) {
    const isFullHTML = /<!DOCTYPE html>|<html[\s>]/i.test(trimmed);
    const hasHTMLTags = /<[a-z][\s\S]*>/i.test(trimmed);
    const hasScript = /<script[\s>]/i.test(trimmed);

    if (isFullHTML || hasHTMLTags) {
      return { lang: "html", executable: true };
    }
    return { lang: "text", executable: false };
  }

  // اگر کلاس مشخص نبود، از روی محتوا حدس بزن
  if (
    /<!DOCTYPE html>|<html[\s>]|<body[\s>]|<div[\s>]|<p[\s>]|<a[\s>]/i.test(
      trimmed,
    )
  ) {
    return { lang: "html", executable: true };
  }

  if (
    /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN)\b/i.test(
      trimmed,
    )
  ) {
    return { lang: "sql", executable: false };
  }

  if (
    /[{}][\s\S]*[:;][\s\S]*/.test(trimmed) &&
    /color:|margin:|padding:|font-size:/i.test(trimmed)
  ) {
    return { lang: "css", executable: false };
  }

  if (
    /\b(function|const|let|var|console\.log|=>|import|export)\b/.test(trimmed)
  ) {
    return { lang: "javascript", executable: true };
  }

  if (/<[A-Z][A-Za-z0-9]*[\s\S]*\/?>/.test(trimmed) && /{.*}/.test(trimmed)) {
    return { lang: "jsx", executable: true };
  }

  return { lang: "text", executable: false };
}

// ---------- کامپوننت نمایش کد ثابت (بدون اجرا) ----------
function StaticCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const copyHandler = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-600 uppercase">
          {language}
        </span>
        <button
          onClick={copyHandler}
          className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
          title="کپی کد"
        >
          {copied ? (
            <Check size={14} className="text-green-600" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------- تابع اصلی ----------
export function findPreviewElements(): HTMLPreElement[] {
  const elements = document.querySelectorAll<HTMLPreElement>(
    "pre.language-jsx, pre.language-sql, pre.language-markup, pre.language-javascript, pre.language-css",
  );
  return Array.from(elements);
}

export const renderInlineSnippets = () => {
  const elements = findPreviewElements();

  elements.forEach((pre) => {
    // جلوگیری از پردازش مجدد
    if (pre.dataset.processed === "true") return;
    if (pre.style.display === "none" || pre.closest(".preview-container")) {
      return;
    }

    const codeElement = pre.querySelector("code");
    if (!codeElement) return;

    const code = codeElement.textContent?.trim() || "";
    const className = pre.className || "";

    const { lang, executable } = detectCodeType(code, className);

    const container = document.createElement("div");
    container.className = "preview-container my-4 no-reset max-w-w";
    container.setAttribute("dir", "ltr");

    pre.parentNode?.insertBefore(container, pre);
    pre.style.display = "none";
    pre.dataset.processed = "true"; // 👈 علامت‌گذاری برای جلوگیری از تکرار

    const root = createRoot(container);

    if (executable) {
      root.render(
        <div className="space-y-4">
          <CodeEditor initialCode={code} language={lang} />
        </div>,
      );
    } else {
      root.render(
        <div className="space-y-4">
          <StaticCodeBlock code={code} language={lang} />
        </div>,
      );
    }
  });
};

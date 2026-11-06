"use client";
import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Play, Terminal, RefreshCw, Sparkles, Eye, EyeOff, Lock, Unlock, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const ConsoleOutput = ({ output }) => (
  <div className="bg-gray-50 text-gray-800 p-4 rounded-b-lg font-mono text-sm h-32 overflow-y-auto border-t border-gray-200">
    {output.length === 0 ? (
      <div className="flex items-center justify-center h-full text-gray-500">
        خروجی کنسول اینجا نمایش داده می‌شود...
      </div>
    ) : (
      output.map((line, i) => (
        <div
          key={i}
          className="flex items-start gap-2 border-b border-gray-200 py-1 last:border-b-0"
        >
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-500 mt-0.5" />
          <pre className={`flex-1 text-${line.color} whitespace-pre-wrap break-words`}>
            {line.text}
          </pre>
        </div>
      ))
    )}
  </div>
);

const JavaScriptPreview = ({ code: initialCode }) => {
  const [code, setCode] = useState('console.log("خوش آمدید!")');
  const [isEditable, setEditable] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const iframeRef = useRef(null);
  const uniqueIdRef = useRef(
    `js-preview-${Math.random().toString(36).substring(2, 9)}`
  );
  console.log(initialCode)
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const runCodeInIframe = async () => {
    if (!code.trim()) {
      toast.warning("کدی برای اجرا وجود ندارد");
      return;
    }

    setConsoleOutput([]);
    setIsRunning(true);
    setIframeKey((prev) => prev + 1);
    setIsPreviewVisible(true);

    await new Promise((resolve) => requestAnimationFrame(() => resolve()));

    const iframe = iframeRef.current;
    if (!iframe) {
      setIsRunning(false);
      return;
    }

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        setIsRunning(false);
        return;
      }

      iframeDoc.open();

      const isFullHTML =
        code.includes("<html") ||
        code.includes("<!DOCTYPE") ||
        code.includes("<body>");

      // ✅ قالب HTML یکسان برای هر دو حالت
      iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="fa">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              padding: 1rem;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              min-height: 100vh;
            }
          </style>
        </head>
        <body>
          ${isFullHTML
          ? code // اگر کاربر HTML کامل داده، همونو بنویس
          : `<script>${code}</script>` // در غیر این صورت فقط JS رو داخل <script> بنویس
        }

          <!-- ✅ تزریق همیشگی اسکریپت console -->
          <script>
            (function() {
              const uniqueId = "${uniqueIdRef.current}";
              const originalConsole = console;
              window.console = {
                log: (...args) => {
                  window.parent.postMessage({
                    type: 'console-log',
                    id: uniqueId,
                    method: 'log',
                    message: args.map(a =>
                      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                    ).join(' ')
                  }, '*');
                  originalConsole.log(...args);
                },
                error: (...args) => {
                  window.parent.postMessage({
                    type: 'console-log',
                    id: uniqueId,
                    method: 'error',
                    message: args.map(a =>
                      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                    ).join(' ')
                  }, '*');
                  originalConsole.error(...args);
                },
                warn: (...args) => {
                  window.parent.postMessage({
                    type: 'console-log',
                    id: uniqueId,
                    method: 'warn',
                    message: args.map(a =>
                      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                    ).join(' ')
                  }, '*');
                  originalConsole.warn(...args);
                },
                info: (...args) => {
                  window.parent.postMessage({
                    type: 'console-log',
                    id: uniqueId,
                    method: 'info',
                    message: args.map(a =>
                      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                    ).join(' ')
                  }, '*');
                  originalConsole.info(...args);
                }
              };
            })();
          </script>
        </body>
      </html>
    `);

      iframeDoc.close();

      // برای اطمینان از توقف وضعیت "در حال اجرا"
      setTimeout(() => setIsRunning(false), 800);
    } catch (error) {
      console.error("Error running code:", error);
      setIsRunning(false);
      toast.error("خطا در اجرای کد");
    }
  };


  function detectCodeType(code) {
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(code); // وجود تگ HTML
    const hasScript = /<script[\s\S]*?>[\s\S]*?<\/script>/i.test(code);

    if (!hasHtmlTags) {
      return "js"; // فقط جاوااسکریپت
    }
    if (hasScript) {
      return "html"; // HTML که داخلش جاوااسکریپت هست
    }
    return "html"; // پیش‌فرض برای markup
  }

  const handleAIModification = async () => {
    if (!code.trim()) {
      toast.warning("کدی برای بهبود وجود ندارد");
      return;
    }

    setIsAILoading(true);
    try {
      const type = detectCodeType(code); // تشخیص نوع کد
      console.log("🔍 نوع کد تشخیص داده شد:", type);

      const response = await fetch(
        `https://pool.techa.ir/api/Modification/${type}?prompt=${encodeURIComponent(code)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.IsSuccess && data.Data) {
        setCode(data.Data);
        toast.success("کد با موفقیت توسط هوش مصنوعی بهبود یافت");
      } else {
        toast.error(data.Message || "خطا در ویرایش کد توسط هوش مصنوعی");
      }
    } catch (error) {
      console.error("AI Modification error:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsAILoading(false);
    }
  };


  const resetCode = () => {
    setCode(initialCode || 'console.log("خوش آمدید!")');
    setConsoleOutput([]);
    toast.info("کد بازنشانی شد");
  };

  useEffect(() => {
    const handleConsoleMessage = (event) => {
      if (
        event.data.type === "console-log" &&
        event.data.id === uniqueIdRef.current
      ) {
        const color =
          {
            log: "gray-800",
            error: "red-600",
            warn: "amber-600",
            info: "blue-600",
          }[event.data.method] || "gray-800";

        setConsoleOutput((prev) => [
          ...prev,
          { text: event.data.message, color },
        ]);
      }
    };

    window.addEventListener("message", handleConsoleMessage);
    return () => window.removeEventListener("message", handleConsoleMessage);
  }, []);

  return (
    <div
      className="bg-white rounded-lg  overflow-hidden border border-gray-200"
      dir="ltr"
    >
      <ToastContainer
        position="bottom-left"
        rtl={true}
        theme="light"
        toastClassName="font-sans"
      />

      {/* Header - Consistent with HtmlPreview */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
          <button
            onClick={() => setEditable(!isEditable)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isEditable
              ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {isEditable ? (
              <>
                <span className="text-sm font-medium">قفل ویرایش</span>
                <Lock className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="text-sm font-medium">ویرایش</span>
                <Unlock className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={handleAIModification}
            disabled={isAILoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isAILoading
              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
          >
            <span className="text-sm font-medium">
              {isAILoading ? "در حال پردازش..." : "بهبود با AI"}
            </span>
            {isAILoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={runCodeInIframe}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isRunning
              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              }`}
          >
            <span className="text-sm font-medium">اجرا</span>
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isPreviewVisible
              ? 'bg-gray-100 border-gray-300 text-gray-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <span className="text-sm font-medium">
              {isPreviewVisible ? "مخفی کردن" : "نمایش"} پیش‌نمایش
            </span>
            {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={resetCode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <span className="text-sm font-medium">بازنشانی</span>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3 lg:mb-0">
          <span className="text-gray-800 font-bold text-2xl" dir="rtl">
            اجرای برخط JavaScript
          </span>
          <Terminal className="w-7 h-7 text-gray-600" />
        </div>
      </div>

      {/* Editor Section */}
      <div className="p-5">
        <div className="bg-gray-50 rounded-lg border border-gray-300 overflow-hidden">
          <MonacoEditor
            height="300px"
            language="javascript"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              readOnly: !isEditable,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              glyphMargin: false,
              folding: true,
              tabSize: 2,
              renderLineHighlight: "all",
              wordWrap: "on",
              lineHeight: 1.5,
              padding: { top: 10, bottom: 10 },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible'
              },
              suggestOnTriggerCharacters: true,
              parameterHints: { enabled: true },
              formatOnType: true,
              formatOnPaste: true
            }}
            theme="vs-light"
            loading={<div className="flex items-center justify-center h-full text-gray-600">در حال بارگذاری ویرایشگر...</div>}
          />
        </div>

        {/* Editor Status Bar */}
        <div className="flex justify-between items-center mt-2 px-2 text-xs text-gray-500">
          <span>JavaScript</span>
          <span>{isEditable ? "حالت ویرایش" : "حالت مشاهده"}</span>
        </div>
      </div>

      {/* Preview Section */}
      {isPreviewVisible && (
        <div className="bg-white mx-4 mb-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
          <div dir="rtl" className="p-5 bg-gray-50 border-b border-gray-300 flex justify-between items-center">
            <span className="text-2xl font-medium text-gray-700">
              پیش‌نمایش زنده
            </span>
            {isRunning && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>در حال بارگذاری...</span>
              </div>
            )}
          </div>
          <div className="h-96 relative bg-white">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="JavaScript Preview Output"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}

      {/* Console Section */}
      {isPreviewVisible && (
        <div className="bg-white mx-4 mb-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
          <div dir="rtl" className="p-5 bg-gray-50 border-b border-gray-300 flex justify-between items-center">
            <span className="text-2xl font-medium text-gray-700">
              خروجی کنسول
            </span>
            {consoleOutput.length > 0 && (
              <button
                onClick={() => setConsoleOutput([])}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                پاک کردن
              </button>
            )}
          </div>
          <ConsoleOutput output={consoleOutput} />
        </div>
      )}
    </div>
  );
};

export default JavaScriptPreview;
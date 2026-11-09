"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  Play,
  Terminal,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const HtmlPreview = ({ code: initialCode }) => {
  const [code, setCode] = useState(initialCode || "<div>Loading...</div>");
  const [isEditable, setEditable] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const iframeRef = useRef(null);

  // به‌روزرسانی کد از پراپ
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // تابع اجرای دستی کد
  const runCodeInIframe = useCallback(async () => {
    if (!code.trim()) {
      toast.warning("کدی برای اجرا وجود ندارد");
      return;
    }

    setIsRunning(true);
    setIframeKey((prev) => prev + 1);
    setIsPreviewVisible(true);

    // صبر کوتاه برای remount شدن iframe
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
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                margin: 0;
                padding: 1rem;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                min-height: 100vh;
              }
              .error { color: #dc2626; padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; margin: 0.5rem 0; }
            </style>
          </head>
          <body>${code}</body>
        </html>
      `);
      iframeDoc.close();
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("خطا در اجرای کد");
    } finally {
      // وضعیت اجرا با رویداد onLoad در JSX پاک می‌شود
    }
  }, [code]);

  // درخواست بهبود با AI
  const handleAIModification = async () => {
    if (!code.trim()) {
      toast.warning("کدی برای بهبود وجود ندارد");
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch(
        `https://pool.techa.ir/api/Modification/html?prompt=${encodeURIComponent(code)}`,
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

  // بازنشانی کد
  const resetCode = () => {
    setCode(initialCode || "<div>Loading...</div>");
    toast.info("کد بازنشانی شد");
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
      dir="ltr"
    >
      <ToastContainer
        position="bottom-left"
        rtl={true}
        theme="light"
        toastClassName="font-sans"
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-white px-4 py-4 border-b border-gray-200 gap-4">
        {/* Title */}
        <div className="flex items-center gap-3 order-1 lg:order-none">
          <span className="text-gray-800 font-bold text-xl md:text-2xl" dir="rtl">
            اجرای برخط HTML
          </span>
          <Terminal className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center order-2 lg:order-none">
          {/* Edit Toggle */}
          <button
            onClick={() => setEditable(!isEditable)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-sm ${isEditable
                ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
          >
            {isEditable ? (
              <>
                <span className="font-medium">قفل ویرایش</span>
                <Lock className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="font-medium">ویرایش</span>
                <Unlock className="w-4 h-4" />
              </>
            )}
          </button>

          {/* AI Modify */}
          <button
            onClick={handleAIModification}
            disabled={isAILoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-sm ${isAILoading
                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              }`}
          >
            <span className="font-medium">
              {isAILoading ? "در حال پردازش..." : "بهبود با AI"}
            </span>
            {isAILoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>

          {/* Manual Run */}
          <button
            onClick={runCodeInIframe}
            disabled={isRunning}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-sm ${isRunning
                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              }`}
            title="اجرای کد"
          >
            <span className="font-medium">اجرا</span>
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={resetCode}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer text-sm"
            title="بازنشانی کد"
          >
            <span className="font-medium">بازنشانی</span>
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-sm ${isPreviewVisible
                ? "bg-gray-100 border-gray-300 text-gray-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
          >
            <span className="font-medium">
              {isPreviewVisible ? "مخفی کردن" : "نمایش"} پیش‌نمایش
            </span>
            {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor Section */}
      <div className="p-4 md:p-5">
        <div className="bg-gray-50 rounded-lg border border-gray-300 overflow-hidden">
          <MonacoEditor
            height="300px"
            language="html"
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
                vertical: "visible",
                horizontal: "visible",
              },
            }}
            theme="vs-light"
            loading={
              <div className="flex items-center justify-center h-full text-gray-600">
                در حال بارگذاری ویرایشگر...
              </div>
            }
          />
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center mt-2 px-2 text-xs text-gray-500">
          <span>HTML</span>
          <span>{isEditable ? "حالت ویرایش" : "حالت مشاهده"}</span>
        </div>
      </div>

      {/* Preview Section */}
      {isPreviewVisible && (
        <div className="bg-white mx-3 md:mx-4 mb-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
          <div
            dir="rtl"
            className="p-4 bg-gray-50 border-b border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-2"
          >
            <span className="text-xl md:text-2xl font-medium text-gray-700">
              پیش‌نمایش زنده
            </span>
            {isRunning && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>در حال بارگذاری...</span>
              </div>
            )}
          </div>
          <div className="h-72 md:h-96 relative bg-white">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="HTML Preview Output"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setIsRunning(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlPreview;
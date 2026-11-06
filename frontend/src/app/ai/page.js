"use client";

import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  Play,
  Square,
  Edit,
  Terminal,
  RefreshCw,
  X,
  Wand2,
  Code,
  Layout,
  Database,
  Braces,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AIAssistedMultiLanguageEditor = () => {
  const languages = [
    { id: "sql", name: "SQL", icon: <Database className="w-4 h-4" /> },
    { id: "js", name: "JavaScript", icon: <Code className="w-4 h-4" /> },
    { id: "react", name: "React", icon: <Layout className="w-4 h-4" /> },
    { id: "html", name: "HTML", icon: <Code className="w-4 h-4" /> },
    { id: "css", name: "CSS", icon: <Braces className="w-4 h-4" /> },
    { id: "csharp", name: "C#", icon: <Code className="w-4 h-4" /> },
    { id: "python", name: "Python", icon: <Code className="w-4 h-4" /> },
    { id: "java", name: "Java", icon: <Code className="w-4 h-4" /> },
  ];

  const defaultCodes = {
    sql: "SELECT * FROM users;",
    js: "function greet() {\n  ",
    react:
      "function App() {\n  return (\n    <div>\n      <h1>Hello React</h1>\n    </div>\n  );\n}",
    html: "<div>\n  <h1>Hello HTML</h1>\n  <p>Edit this code to see changes</p>\n</div>",
    css: "body {\n  background: #f0f9ff;\n  font-family: sans-serif;\n}\nh1 {\n  color: #0c4a6e;\n}",
    csharp:
      'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello C#");\n  }\n}',
    python:
      'def main():\n    print("Hello Python")\n\nif __name__ == "__main__":\n    main()',
    java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Java");\n  }\n}',
  };

  const editorLanguages = {
    sql: "sql",
    js: "javascript",
    react: "javascript",
    html: "html",
    css: "css",
    csharp: "csharp",
    python: "python",
    java: "java",
  };

  const [activeTab, setActiveTab] = useState("html");
  const [code, setCode] = useState(defaultCodes.html || "");
  const [isEditable, setIsEditable] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [savedCodes, setSavedCodes] = useState({});
  const iframeRef = useRef(null);

  // تغییر تب و بارگزاری کد مربوطه
  useEffect(() => {
    if (savedCodes[activeTab]) {
      setCode(savedCodes[activeTab]);
    } else {
      setCode(defaultCodes[activeTab]);
    }
  }, [activeTab]);

  // اجرای کد در آی‌فریم (برای زبان‌های وب)
  const runCodeInIframe = async () => {
    if (!["html", "css", "js", "react"].includes(activeTab)) return;

    setIsRunning(true);
    setIframeKey((prev) => prev + 1);
    setIsPreviewVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // ایجاد محتوای HTML بر اساس زبان
    let htmlContent = "";

    if (activeTab === "html") {
      htmlContent = code;
    } else if (activeTab === "css") {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <h1>CSS Preview</h1>
            <div class="box">Styled Box</div>
            <p>This is a sample text for CSS styling</p>
          </body>
        </html>
      `;
    } else if (activeTab === "js" || activeTab === "react") {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>JavaScript Output</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              #output { margin-top: 20px; padding: 10px; background: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>JavaScript Execution</h1>
            <div id="output"></div>
            <script>
              try {
                ${code}
              } catch (error) {
                document.getElementById('output').innerHTML = 
                  '<div style="color: red;">Error: ' + error.message + '</div>';
              }
            </script>
          </body>
        </html>
      `;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setIsRunning(false);
  };

  // درخواست هوش مصنوعی برای اصلاح کد
  const handleAIAssist = async () => {
    setAiLoading(true);
    toast.info("در حال ارسال کد به هوش مصنوعی...");

    try {
      const response = await fetch(
        `https://pool.techa.ir/api/Modification/${activeTab}?prompt=${code}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (result.IsSuccess && result.Data) {
        setCode(result.Data);
        setSavedCodes((prev) => ({ ...prev, [activeTab]: result.Data }));
        toast.success("کد با موفقیت توسط هوش مصنوعی اصلاح شد!");
      } else {
        toast.error(`خطا: ${result.Message || "پاسخی از سرور دریافت نشد"}`);
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
      console.error("Fetch Error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // ذخیره کد فعلی
  const saveCurrentCode = () => {
    setSavedCodes((prev) => ({ ...prev, [activeTab]: code }));
    toast.success("کد ذخیره شد!");
  };

  // بازگردانی کد ذخیره شده
  const restoreSavedCode = () => {
    if (savedCodes[activeTab]) {
      setCode(savedCodes[activeTab]);
      toast.info("کد ذخیره شده بازگردانی شد");
    }
  };

  // بازگردانی به کد پیش‌فرض
  const restoreDefaultCode = () => {
    setCode(defaultCodes[activeTab]);
    toast.info("کد پیش‌فرض بازگردانی شد");
  };

  // رندر آیکون زبان
  const renderLanguageIcon = (langId) => {
    const lang = languages.find((l) => l.id === langId);
    return lang ? lang.icon : <Code className="w-4 h-4" />;
  };

  return (
    <div className="py-32">

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-200">
        {/* هدر صفحه */}
        <header className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 gap-3 md:mb-0">
            <Terminal className="text-white h-12 w-12 p-2 bg-emerald-700 rounded-lg" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                ویرایشگر هوشمند کد
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                کدنویسی با کمک هوش مصنوعی
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setEditorTheme(
                editorTheme === "vs-light" ? "vs-dark" : "vs-light"
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
          >
            <span>{editorTheme === "vs-light" ? "تم تیره" : "تم روشن"}</span>
            <div
              className={`w-6 h-6 rounded-full ${editorTheme === "vs-dark" ? "bg-gray-800" : "bg-yellow-400"
                }`}
            />
          </button>
        </header>

        {/* تب‌ها */}
        <div className="bg-emerald-50 px-4 border-b border-emerald-200">
          <div className="flex overflow-x-auto py-3 scrollbar-hide">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveTab(lang.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap mr-2 ${activeTab === lang.id
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  }`}
              >
                {renderLanguageIcon(lang.id)}
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* ناحیه اصلی */}
        <div className="p-4 md:p-6">
          {/* تولبار بالا */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setIsEditable(!isEditable)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isEditable
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                } transition-colors`}
            >
              {isEditable ? (
                <>
                  <span>غیرفعال کردن ویرایش</span>
                  <Square className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>فعال کردن ویرایش</span>
                  <Edit className="w-4 h-4" />
                </>
              )}
            </button>

            {["html", "css", "js", "react"].includes(activeTab) && (
              <button
                onClick={runCodeInIframe}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all disabled:opacity-70"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال اجرا...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>اجرای کد</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleAIAssist}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all disabled:opacity-70"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال پردازش...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>هوش مصنوعی (اصلاح کد)</span>
                </>
              )}
            </button>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={saveCurrentCode}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-800 rounded-lg hover:bg-cyan-200 transition-colors"
              >
                <span>ذخیره کد</span>
              </button>

              <button
                onClick={restoreSavedCode}
                disabled={!savedCodes[activeTab]}
                className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-800 rounded-lg hover:bg-violet-200 transition-colors disabled:opacity-50"
              >
                <span>بازیابی ذخیره</span>
              </button>

              <button
                onClick={restoreDefaultCode}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <span>بازنشانی</span>
              </button>
            </div>
          </div>

          {/* ادیتور و پریویو */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border-2 border-emerald-200 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-emerald-600 px-4 py-2 flex justify-between items-center">
                <div className="flex items-start gap-2">
                  <span>{renderLanguageIcon(activeTab)}</span>
                  <span className="text-white font-medium ml-2">
                    ویرایشگر {languages.find((l) => l.id === activeTab)?.name}
                  </span>
                </div>
                <div className="text-emerald-200 text-sm">
                  {isEditable ? "حالت ویرایش" : "حالت فقط خواندنی"}
                </div>
              </div>
              <div dir="ltr">
                <MonacoEditor
                  height="400px"
                  language={editorLanguages[activeTab]}
                  value={code}
                  onChange={setCode}
                  theme={editorTheme}
                  options={{
                    readOnly: !isEditable,
                    minimap: {
                      enabled: true,
                      showSlider: "always",
                      size: "fit",
                      renderCharacters: true,
                    },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    folding: true,
                    tabSize: 2,
                    renderLineHighlight: "gutter",
                    suggestOnTriggerCharacters: true,
                    wordBasedSuggestions: true,
                    parameterHints: { enabled: true },
                    scrollbar: {
                      vertical: "visible",
                      horizontal: "visible",
                      useShadows: true,
                    },
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col">
              {["html", "css", "js", "react"].includes(activeTab) ? (
                <>
                  <div className="flex justify-between items-center bg-emerald-600 px-4 py-2 rounded-t-lg">
                    <div className="flex items-center text-white">
                      <Play className="w-4 h-4 mr-2" />
                      <span>پیش نمایش خروجی</span>
                    </div>
                    <button
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      className="text-emerald-200 hover:text-white"
                    >
                      {isPreviewVisible ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Edit className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {isPreviewVisible ? (
                    <div className="bg-white border-2 border-t-0 border-emerald-200 rounded-b-lg overflow-hidden shadow-lg h-[400px]">
                      <iframe
                        key={iframeKey}
                        ref={iframeRef}
                        title="Code Preview Output"
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-emerald-50 border-2 border-t-0 border-emerald-200 rounded-b-lg text-emerald-800">
                      <div className="text-center p-6">
                        <Play className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
                        <h3 className="font-medium text-lg mb-2">
                          پیش نمایش غیرفعال است
                        </h3>
                        <p className="text-sm max-w-md">
                          برای مشاهده خروجی کد خود، دکمه اجرای کد را بزنید یا
                          این پنل را فعال کنید
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-lg h-full flex flex-col items-center justify-center p-6 text-center">
                  <Wand2 className="w-16 h-16 text-emerald-500 mb-4" />
                  <h3 className="font-bold text-xl text-emerald-800 mb-2">
                    قابلیت پیش‌نمایش برای{" "}
                    {languages.find((l) => l.id === activeTab)?.name}
                  </h3>
                  <p className="text-emerald-700 mb-4 max-w-md">
                    برای زبان‌های غیر وب، از هوش مصنوعی برای تحلیل و اصلاح کد
                    استفاده کنید
                  </p>
                  <button
                    onClick={handleAIAssist}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    تحلیل کد با هوش مصنوعی
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* فوتر */}
        <footer className="bg-emerald-800 text-emerald-200 px-6 py-4 text-center text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">ویرایشگر هوشمند کد - نسخه ۲.۰</div>
            <div className="flex gap-4">
              <span>پشتیبانی از ۸ زبان برنامه‌نویسی</span>
              <span>•</span>
              <span>قابلیت اصلاح کد با هوش مصنوعی</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AIAssistedMultiLanguageEditor;

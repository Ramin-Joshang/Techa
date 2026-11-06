"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import prettier from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import * as htmlPlugin from "prettier/plugins/html";
import {
    Play, RotateCcw, TerminalSquare, Layout, Trash2,
    Maximize, Minimize, AlignLeft, Download, Copy,
    Check, Zap, WrapText
} from "lucide-react";

export default function CodeEditor({ initialCode = "", language = "javascript", title = "Untitled Project" }) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState([]);
    const [activeTab, setActiveTab] = useState("editor"); // برای موبایل
    const [viewMode, setViewMode] = useState("console"); // console, preview

    // تنظیمات پیشرفته
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isAutoRun, setIsAutoRun] = useState(false);
    const [wordWrap, setWordWrap] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);

    const iframeRef = useRef(null);
    const editorContainerRef = useRef(null);

    // ❌ حذف useEffect برای setCode(initialCode) – چون useState مقدار اولیه را می‌گیرد
    // (قبلاً این effect باعث رندر اضافی می‌شد)

    // ✅ Memoize کردن extensions برای جلوگیری از recreate شدن در هر رندر
    const extensions = useMemo(() => {
        const baseExtensions = [
            autocompletion(),
            closeBrackets(),
        ];

        switch (language) {
            case "javascript":
            case "jsx":
                return [...baseExtensions, javascript({ jsx: true })];
            case "html":
                return [...baseExtensions, html()];
            case "css":
                return [...baseExtensions, css()];
            case "sql":
                return [...baseExtensions, sql()];
            default:
                return [...baseExtensions, javascript()];
        }
    }, [language]);

    // فرمت کردن کد با Prettier
    const formatCode = async () => {
        setIsFormatting(true);
        try {
            const formatted = await prettier.format(code, {
                parser: language === "html" ? "html" : "babel",
                plugins: [babelPlugin, estreePlugin, htmlPlugin],
                semi: true,
                singleQuote: false,
                tabWidth: 4,
            });
            setCode(formatted);
        } catch (error) {
            console.error("Format Error:", error);
        } finally {
            setIsFormatting(false);
        }
    };

    // اجرای کد
    const handleRun = useCallback(() => {
        setOutput([]);

        if (language === "javascript" || language === "jsx") {
            setViewMode("console");
            runJavaScript(code);
        } else if (language === "html") {
            setViewMode("preview");
        }
    }, [code, language]);

    // اجرای خودکار در صورت روشن بودن Auto-Run
    useEffect(() => {
        if (isAutoRun) {
            const timeout = setTimeout(() => handleRun(), 1000);
            return () => clearTimeout(timeout);
        }
    }, [code, isAutoRun, handleRun]);

    // منطق اجرای JS و رهگیری کنسول
    const runJavaScript = (jsCode) => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const logs = [];

        const formatOutput = (arg) => {
            if (typeof arg === 'string') return `"${arg}"`;
            if (typeof arg === 'number' || typeof arg === 'boolean') return arg.toString();
            if (typeof arg === 'undefined') return 'undefined';
            if (arg === null) return 'null';
            if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
            if (typeof arg === 'function') return `[Function: ${arg.name || 'anonymous'}]`;
            return String(arg);
        };

        console.log = (...args) => {
            logs.push({ type: "log", text: args.map(formatOutput).join(" ") });
            originalLog(...args);
        };
        console.error = (...args) => {
            logs.push({ type: "error", text: args.join(" ") });
            originalError(...args);
        };
        console.warn = (...args) => {
            logs.push({ type: "warn", text: args.join(" ") });
            originalWarn(...args);
        };

        try {
            const executeCode = new Function(jsCode);
            executeCode();
        } catch (error) {
            logs.push({ type: "error", text: error.toString() });
        } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            setOutput(logs);
        }
    };

    // گوش دادن به پیام‌های iframe برای لاگ‌های HTML
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'IFRAME_LOG') {
                setOutput(prev => [...prev, { type: event.data.logType, text: event.data.text }]);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // تزریق اسکریپت به HTML برای گرفتن لاگ‌ها
    const getHtmlWithConsoleHook = (htmlCode) => {
        const script = `
            <script>
                const originalLog = console.log;
                const originalError = console.error;
                console.log = (...args) => {
                    window.parent.postMessage({ type: 'IFRAME_LOG', logType: 'log', text: args.join(' ') }, '*');
                    originalLog(...args);
                };
                console.error = (...args) => {
                    window.parent.postMessage({ type: 'IFRAME_LOG', logType: 'error', text: args.join(' ') }, '*');
                    originalError(...args);
                };
                window.onerror = function(msg, url, lineNo, columnNo, error) {
                    window.parent.postMessage({ type: 'IFRAME_LOG', logType: 'error', text: msg + ' (Line: ' + lineNo + ')' }, '*');
                    return false;
                };
            </script>
        `;
        return htmlCode.includes('<head>') ? htmlCode.replace('<head>', '<head>' + script) : script + htmlCode;
    };

    // امکانات جانبی
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const downloadCode = () => {
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `script.${language === 'html' ? 'html' : 'js'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            editorContainerRef.current.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div
            ref={editorContainerRef}
            dir="ltr"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className={`flex flex-col overflow-hidden shadow-2xl bg-[#0d1117] font-sans transition-all duration-300
                ${isFullscreen ? "fixed inset-0 z-50 w-screen h-screen rounded-none" : "w-full max-w-6xl mx-auto rounded-xl border border-gray-700/60 h-[600px]"}
            `}
        >
            {/* Header / Mac Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-red-400 cursor-pointer shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-yellow-400 cursor-pointer shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-green-400 cursor-pointer shadow-sm"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-200">{title}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{language}</span>
                    </div>
                </div>

                {/* Toolbar Actions */}
                <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-gray-800">
                    <button onClick={() => setWordWrap(!wordWrap)} className={`p-1.5 rounded transition-colors ${wordWrap ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-white'}`} title="شکستن خطوط">
                        <WrapText size={16} />
                    </button>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <button onClick={formatCode} disabled={isFormatting} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded" title="مرتب‌سازی کد (Prettier)">
                        <AlignLeft size={16} className={isFormatting ? "animate-pulse text-green-400" : ""} />
                    </button>
                    <button onClick={copyToClipboard} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded" title="کپی کد">
                        {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                    <button onClick={downloadCode} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded" title="دانلود فایل">
                        <Download size={16} />
                    </button>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <button onClick={toggleFullscreen} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded" title="تمام صفحه">
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                </div>

                {/* Run / Execution Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAutoRun(!isAutoRun)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors rounded-md border
                            ${isAutoRun ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500"}`}
                        title="اجرای خودکار هنگام تایپ"
                    >
                        <Zap size={14} className={isAutoRun ? "fill-yellow-500" : ""} />
                        <span className="hidden sm:inline">Auto-Run</span>
                    </button>

                    <button
                        onClick={() => { setCode(initialCode); setOutput([]); }}
                        className="p-1.5 text-gray-400 transition-colors rounded-md hover:bg-gray-800 hover:text-white border border-transparent"
                        title="بازیابی کد"
                    >
                        <RotateCcw size={16} />
                    </button>

                    <button
                        onClick={handleRun}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white transition-all bg-green-600 rounded-md hover:bg-green-500 shadow-lg shadow-green-600/20"
                    >
                        <Play size={16} fill="currentColor" />
                        <span>Run</span>
                    </button>
                </div>
            </div>

            {/* Main Workspace (Split Pane) */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* Editor Panel */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800">
                    <div className="flex-1 overflow-auto bg-[#282c34] custom-scrollbar">
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme={oneDark}
                            extensions={extensions}  // ✅ استفاده از extensions memoized
                            onChange={(value) => {
                                setCode(value);
                            }} className="text-[14px] h-full"
                            style={{ fontFamily: "Operator Mono Lig,Vazir" }}
                            basicSetup={{
                                lineNumbers: true,
                                highlightActiveLine: true,
                                foldGutter: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                                bracketMatching: true,
                                closeBrackets: true,
                                autocompletion: true,
                                rectangularSelection: true,
                                crosshairCursor: true,
                                highlightActiveLineGutter: true,
                            }}
                        />
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117] border-t lg:border-t-0 border-gray-800 z-10">

                    {/* Output Tabs */}
                    <div className="flex items-center bg-[#161b22] border-b border-gray-800 px-2 pt-2">
                        <button
                            onClick={() => setViewMode("console")}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all rounded-t-lg
                                ${viewMode === "console" ? "bg-[#0d1117] text-green-400 border-t-2 border-green-500" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}`}
                        >
                            <TerminalSquare size={14} /> Console
                        </button>

                        {(language === "html" || viewMode === "preview") && (
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all rounded-t-lg
                                    ${viewMode === "preview" ? "bg-[#0d1117] text-emerald-400 border-t-2 border-emerald-500" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}`}
                            >
                                <Layout size={14} /> Preview
                            </button>
                        )}

                        {viewMode === "console" && (
                            <button onClick={() => setOutput([])} className="ml-auto p-1.5 mr-2 text-gray-500 hover:text-red-400 transition-colors" title="پاک کردن کنسول">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* Output Content */}
                    <div className="flex-1 overflow-auto relative custom-scrollbar">
                        {viewMode === "console" ? (
                            <div className="p-4 font-mono text-[13px] leading-relaxed tracking-wide min-h-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {output.length === 0 ? (
                                    <div className="text-gray-600 italic select-none">~ No output yet. Click Run to execute...</div>
                                ) : (
                                    output.map((log, index) => (
                                        <div
                                            key={index}
                                            className={`py-1.5 px-2 mb-1 rounded flex items-start gap-3 border-l-2
                                                ${log.type === "error" ? "bg-red-500/10 text-red-400 border-red-500" :
                                                    log.type === "warn" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500" :
                                                        "hover:bg-gray-800/50 text-gray-300 border-transparent hover:border-gray-600"}
                                            `}
                                        >
                                            <span className="text-gray-600 select-none mt-0.5 font-bold">›</span>
                                            <span className="break-all whitespace-pre-wrap">{log.text}</span>
                                        </div>
                                    ))
                                )}
                                {output.length > 0 && <div className="w-2 h-4 bg-gray-500/50 mt-2 animate-pulse ml-5"></div>}
                            </div>
                        ) : viewMode === "preview" ? (
                            <iframe
                                dir="rtl"
                                ref={iframeRef}
                                srcDoc={getHtmlWithConsoleHook(code)}
                                title="Live Preview"
                                className="w-full h-full bg-white border-none"
                                sandbox="allow-scripts allow-modals allow-forms allow-popups"
                            />
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styling (Global CSS Inject) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #0d1117; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 5px; border: 2px solid #0d1117; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }
            `}} />
        </div>
    );
}
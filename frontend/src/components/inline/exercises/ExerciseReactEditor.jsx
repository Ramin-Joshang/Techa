"use client";
import { GetTemplateById } from "../../../api/handlers/InlineReactHandler";
import React, { useEffect, useState, useRef } from "react";
import { LiveEditor, LiveProvider } from "react-live";
import {
    Play,
    Square,
    Edit,
    Terminal,
    RefreshCw,
    ChevronRight,
    X,
} from "lucide-react";

const ConsoleOutput = ({ output }) => (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-b-lg font-mono text-sm h-32 overflow-y-auto">
        {output.map((line, i) => (
            <div
                key={i}
                className="flex items-start gap-2 border-b border-gray-700 py-1"
            >
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <pre className={`flex-1 text-${line.color}`}>{line.text}</pre>
            </div>
        ))}
    </div>
);

const ReactPreview = ({ tutorialID, onCodeChange, editable }) => {
    const [code, setCode] = useState("Loading...");
    const [isEditable, setEditable] = useState(editable);
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const iframeRef = useRef(null);
    const uniqueIdRef = useRef(
        `react-preview-${tutorialID}-${Math.random().toString(36).substring(2, 9)}`
    );


    useEffect(() => {
        onCodeChange(code);
    }, [code]);

    useEffect(() => {
        GetTemplateById(tutorialID)
            .then((res) => {
                if (res.data.IsSuccess) {
                    setCode(
                        res.data.Data.TemplateType === 2
                            ? res.data.Data.Script
                            : "Snippet Not Found!"
                    );
                }
            })
            .catch(() => setCode("Error"));
    }, [tutorialID]);

    const runCodeInIframe = async () => {
        setConsoleOutput([]);
        setIsRunning(true);
        setIframeKey((prev) => prev + 1);
        setIsPreviewVisible(true);

        await new Promise((resolve) => setTimeout(resolve, 50));

        const iframe = iframeRef.current;
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        iframeDoc.open();
        iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
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
                    message: args.join(' ') 
                  }, '*');
                  original
                },
                error: (...args) => {
                  window.parent.postMessage({ 
                    type: 'console-log', 
                    id: uniqueId, 
                    method: 'error', 
                    message: args.join(' ') 
                  }, '*');
                  originalConsole.error(...args);
                },
                warn: (...args) => {
                  window.parent.postMessage({ 
                    type: 'console-log', 
                    id: uniqueId, 
                    method: 'warn', 
                    message: args.join(' ') 
                  }, '*');
                  originalConsole.warn(...args);
                }
              };
            })();
          </script>
        </head>
        <body>${code}</body>
      </html>
    `);
        iframeDoc.close();
    };

    useEffect(() => {
        const handleConsoleMessage = (event) => {
            if (
                event.data.type === "console-log" &&
                event.data.id === uniqueIdRef.current
            ) {
                const color =
                    {
                        log: "emerald-400",
                        error: "red-400",
                        warn: "amber-400",
                    }[event.data.method] || "gray-400";

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
        <LiveProvider code={code}>
            <div
                dir="ltr"
                className="flex flex-col gap-4 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700"
            >
                {/* Header */}
                <div className="flex flex-col-reverse lg:flex-row items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditable(!isEditable)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors duration-200"
                        >
                            {isEditable ? (
                                <>
                                    <span className="text-xs font-medium">قفل</span>
                                    <Square className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-medium">ویرایش</span>
                                    <Edit className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={runCodeInIframe}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-200"
                        >
                            <span className="text-xs font-medium">اجرا</span>
                            {isRunning ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors duration-200"
                        >
                            <span className="text-xs font-medium">
                                {isPreviewVisible ? "بستن" : "بازکردن"} پیش نمایش
                            </span>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <h2 className="text-gray-200 font-semibold text-sm">
                            اجرای برخط React
                        </h2>
                        <Terminal className="w-10 h-10 text-emerald-400 scale-x-[-1]" />
                    </div>
                </div>

                {/* Editor */}
                <div className="px-4 pb-4">
                    <LiveEditor
                        language="javascript"
                        disabled={!isEditable}
                        className="rounded-lg overflow-hidden border border-gray-700 max-w-full"
                    // theme="vs-dark"
                    />
                </div>

                {/* Preview & Console */}
                {isPreviewVisible && (
                    <>
                        <div className="bg-gray-900 mx-4 mb-4 rounded-lg overflow-hidden border border-gray-700">
                            <div className="px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider text-end">
                                    پیش نمایش
                                </h3>
                            </div>
                            <div className="h-48 relative bg-gray-900">
                                <iframe
                                    key={iframeKey}
                                    ref={iframeRef}
                                    title="React Preview"
                                    className="w-full h-full"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-900 mx-4 mb-4 rounded-lg overflow-hidden border border-gray-700">
                            <div className="px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider text-end">
                                    کنسول
                                </h3>
                            </div>
                            <ConsoleOutput output={consoleOutput} />
                        </div>
                    </>
                )}
            </div>
        </LiveProvider>
    );
};

export default ReactPreview;

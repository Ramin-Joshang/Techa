"use client";
import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { GetHtmlSnippetByIdApiHandler } from "../../../api/handlers/InlineHtmlHandler";
import { Play, Square, Edit, Terminal, RefreshCw, X } from "lucide-react";



const ExerciseHTMLEditor = ({ tutorialID, onCodeChange, editable }) => {
    const [code, setCode] = useState("<div>Loading...</div>");
    const [isEditable, setEditable] = useState(editable);
    const [isRunning, setIsRunning] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetchHtmlSnippet(tutorialID);
            if (res) setCode(res.Script);
        };
        fetchData();
    }, [tutorialID]);

    useEffect(() => {
        onCodeChange(code);
    }, [code]);

    const runCodeInIframe = async () => {
        setIsRunning(true);
        setIframeKey((prev) => prev + 1);
        setIsPreviewVisible(true);

        await new Promise((resolve) => setTimeout(resolve, 50));

        const iframe = iframeRef.current;
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        iframeDoc.open();
        iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 1rem; background: white; }
          </style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `);
        iframeDoc.close();

        const checkContent = () => setIsRunning(false);
        iframe.onload = checkContent;
    };

    return (
        <div
            className="flex flex-col gap-4 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700"
            dir="ltr"
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

                    {/* New Close Button */}
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
                    <h2 className="text-gray-200 font-semibold text-3xl" dir="rtl">
                        اجرای برخط HTML
                    </h2>
                    <Terminal className="w-10 h-10 text-emerald-400 scale-x-[-1]" />
                </div>
            </div>

            {/* Editor */}
            <div className="px-4 pb-4">
                <MonacoEditor
                    height="300px"
                    language="html"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        readOnly: !isEditable,
                        minimap: { enabled: false },
                        fontSize: 15,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        glyphMargin: false,
                        folding: false,
                        tabSize: 4,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 0,
                        renderLineHighlight: "none",
                    }}
                    theme="vs-dark"
                    className="rounded-lg overflow-hidden border border-gray-700"
                />
            </div>

            {/* Preview */}
            {isPreviewVisible && (
                <div className="bg-gray-900 mx-4 mb-4 rounded-lg overflow-hidden border border-gray-700">
                    <div className="px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider text-end">
                            پیش نمایش
                        </h3>
                    </div>
                    <div className="h-96 relative bg-gray-900">
                        <iframe
                            key={iframeKey}
                            ref={iframeRef}
                            title="HTML Preview Output"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

async function fetchHtmlSnippet(
    tutorialID
) {
    const { data } = await GetHtmlSnippetByIdApiHandler(tutorialID);
    return data.IsSuccess ? data.Data : null;
}

export default ExerciseHTMLEditor;

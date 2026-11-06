"use client";
import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { LiveProvider, LiveEditor } from "react-live";
import { Terminal } from "lucide-react";

const CodePreview = ({ code, language, readOnly = true }) => {
    const [internalCode, setInternalCode] = useState(code);

    return (
        <div className="flex flex-col gap-4 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700" dir="ltr">
            {/* Header */}
            <div className="flex items-center justify-end text-2xl bg-gray-900 px-4 py-3 border-b border-gray-700">
                <h2 className="text-gray-200 font-semibold text">
                    {language.toUpperCase()} ادیتور برخط
                </h2>
                <Terminal className="w-10 h-10 text-emerald-400 scale-x-[-1]" />
            </div>

            {/* Editor */}
            <div className="px-4 pb-4">
                {language === "react" ? (
                    <LiveProvider code={internalCode}>
                        <LiveEditor
                            language="javascript"
                            theme="vs-dark"
                            onChange={!readOnly ? setInternalCode : undefined}
                            className="rounded-lg overflow-hidden border border-gray-700"
                        />
                    </LiveProvider>
                ) : (
                    <MonacoEditor
                        height="250px"
                        language={language}
                        value={internalCode}
                        onChange={!readOnly ? setInternalCode : undefined}
                        options={{
                            readOnly,
                            minimap: { enabled: false },
                            fontSize: 15,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                        theme="vs-dark"
                        className="rounded-lg overflow-hidden border border-gray-700"
                    />
                )}
            </div>
        </div>
    );
};

export default CodePreview;
"use client";
import { useEffect, useRef, useState } from "react";
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
    ChevronRight,
} from "lucide-react";
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

const SQLPreview = ({ code: initialCode }) => {
    const [code, setCode] = useState('-- SQL کد خود را اینجا بنویسید\nSELECT * FROM users;');
    const [isEditable, setEditable] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState([]);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);

    useEffect(() => {
        if (initialCode) {
            setCode(initialCode);
        }
    }, [initialCode]);

    const runQuery = async () => {
        if (!code.trim()) {
            toast.warning("کدی برای اجرا وجود ندارد");
            return;
        }

        setConsoleOutput([]);
        setIsRunning(true);
        setIsPreviewVisible(true);

        try {
            // شبیه‌سازی اجرای کوئری
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockResponse = [
                { id: 1, name: 'کاربر تست ۱', email: 'test1@example.com', created_at: '2024-01-01' },
                { id: 2, name: 'کاربر تست ۲', email: 'test2@example.com', created_at: '2024-01-02' },
                { id: 3, name: 'کاربر تست ۳', email: 'test3@example.com', created_at: '2024-01-03' }
            ];

            setResults(mockResponse);
            setConsoleOutput([{
                text: '✅ کوئری با موفقیت اجرا شد. 3 رکورد پیدا شد.',
                color: 'green-600'
            }]);
        } catch (error) {
            setConsoleOutput([{
                text: `❌ خطا: ${error.message}`,
                color: 'red-600'
            }]);
            toast.error("خطا در اجرای کوئری");
        } finally {
            setIsRunning(false);
        }
    };

    const handleAIModification = async () => {
        if (!code.trim()) {
            toast.warning("کدی برای بهبود وجود ندارد");
            return;
        }

        setIsAILoading(true);
        try {
            const response = await fetch(
                `https://pool.techa.ir/api/Modification/sql?prompt=${encodeURIComponent(code)}`,
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
        setCode(initialCode || '-- SQL کد خود را اینجا بنویسید\nSELECT * FROM users;');
        setConsoleOutput([]);
        setResults([]);
        toast.info("کد بازنشانی شد");
    };

    return (
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200" dir="ltr">
            <ToastContainer
                position="bottom-left"
                rtl={true}
                theme="light"
                toastClassName="font-sans"
            />

            {/* Header - Light Theme */}
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
                        onClick={runQuery}
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
                    <span className="text-gray-800 font-bold text-xl" dir="rtl">
                        اجرای برخط SQL
                    </span>
                    <Terminal className="w-7 h-7 text-gray-600" />
                </div>
            </div>

            {/* Editor Section */}
            <div className="p-5">
                <div className="bg-gray-50 rounded-lg border border-gray-300 overflow-hidden">
                    <MonacoEditor
                        height="300px"
                        language="sql"
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
                    <span>SQL</span>
                    <span>{isEditable ? "حالت ویرایش" : "حالت مشاهده"}</span>
                </div>
            </div>

            {/* Results Table */}
            {isPreviewVisible && (
                <div className="bg-white mx-4 mb-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                    <div dir="rtl" className="p-5 bg-gray-50 border-b border-gray-300 flex justify-between items-center">
                        <span className="text-2xl font-medium text-gray-700">
                            نتایج کوئری
                        </span>
                        {isRunning && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>در حال اجرای کوئری...</span>
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        {results.length > 0 ? (
                            <table className="w-full text-gray-700">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {Object.keys(results[0]).map((key) => (
                                            <th key={key} className="px-4 py-3 text-sm font-medium text-gray-700 text-left border-b border-gray-200">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((row, i) => (
                                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                                            {Object.values(row).map((value, j) => (
                                                <td key={j} className="px-4 py-3 text-sm text-gray-600">
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                هیچ داده‌ای برای نمایش وجود ندارد
                            </div>
                        )}
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

export default SQLPreview;
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCode, FiRefreshCw, FiCheck } from "react-icons/fi";
import CodeEditor from "../common/CodeEditor";
// 👈 ایمپورت ادیتور جدید (مسیر را بر اساس پوشه‌بندی خود تنظیم کنید)

export default function ExerciseEditor({ exercise, slug, code, setCode, onSubmit, submitting }) {
    const [isSaved, setIsSaved] = useState(false);
    console.log(slug)
    const isDisabled = exercise.UserStatus === 2 || exercise.UserStatus === 3;

    // بارگذاری کد اولیه
    useEffect(() => {
        const savedCode = localStorage.getItem(`exercise-${exercise.Id}-code`);
        if (savedCode) {
            setCode(savedCode);
        } else if (exercise.Code) {
            setCode(exercise.Code);
            localStorage.setItem(`exercise-${exercise.Id}-code`, exercise.Code);
        } else {
            const defaultCode = '// کد خود را اینجا بنویسید';
            setCode(defaultCode);
            localStorage.setItem(`exercise-${exercise.Id}-code`, defaultCode);
        }
    }, [exercise.Id, exercise.Code, setCode]);

    // بازنشانی کد به حالت اولیه
    const resetCode = () => {
        if (isDisabled) return;
        if (confirm('آیا از بازنشانی کد به حالت اولیه اطمینان دارید؟')) {
            const initial = exercise.Code || '// کد خود را اینجا بنویسید';
            setCode(initial);
            localStorage.setItem(`exercise-${exercise.Id}-code`, initial);
        }
    };

    // تعیین زبان برای ادیتور جدید
    const getLanguage = () => {
        switch (slug) {
            case "html":
            case "javascript":
                return slug;
            case "10": return "jsx";
            default: return "html";
        }
    };

    return (
        <div className="mb-8">
            {/* عنوان و دکمه‌ها */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiCode />
                    محیط کدنویسی
                </h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={resetCode}
                        disabled={isDisabled}
                        className={`text-sm flex items-center px-3 py-2 rounded-lg ${isDisabled
                            ? "text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                            : "text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
                            }`}
                    >
                        <FiRefreshCw className="ml-1" />
                        بازنشانی کد
                    </button>
                </div>
            </div>

            {/* ادیتور */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0d1117] rounded-xl relative shadow-lg">
                <div className="relative overflow-hidden transition-all duration-300">

                    {/* 👈 استفاده از ادیتور جدید */}
                    {code !== undefined && (
                        <CodeEditor
                            initialCode={code}
                            language={getLanguage()}
                            title={`Exercise: ${exercise.Title || "Task"}`}
                        />
                    )}

                    {isDisabled && (
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl cursor-not-allowed z-50 p-4">
                            <div className="relative mb-3">
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center shadow-inner border border-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-gray-200 text-sm font-medium text-center">تمرین قفل شده است</span>
                            <span className="text-gray-400 text-xs mt-1 text-center">این بخش در حال حاضر غیرقابل ویرایش می‌باشد</span>
                        </div>
                    )}
                </div>

                {/* دکمه ارسال */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 p-4 border-t border-gray-800">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSubmit(code)}
                        disabled={submitting || isDisabled}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5 px-8 rounded-lg transition-all shadow-lg hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto ml-auto"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                در حال ارسال...
                            </>
                        ) : (
                            <>
                                <FiCheck className="w-5 h-5" />
                                ارسال تمرین
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

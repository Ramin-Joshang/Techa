"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, Check, CheckCircle, RefreshCw, X } from "lucide-react";
import { fetchQuizExercise } from "../../../../../../features/main/exercises/exercisesActions";
import LoadingSpinner from "../../../../../../components/common/LoadingSpinner";

// کامپوننت صفحه آزمون
export default function QuizPage() {
    const { id, slug } = useParams(); // slug را هم برای لینک بازگشت می‌گیریم
    const router = useRouter();
    const dispatch = useDispatch();
    const { exercises: flatQuestions, loading, error } = useSelector((state) => state.exercises);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // واکشی داده‌ها در اولین رندر
    useEffect(() => {
        dispatch(fetchQuizExercise({ "ExerciseId": id }));
    }, [dispatch, id]);

    // ۱. پردازش و گروه‌بندی داده‌های مسطح به ساختار سوال و گزینه
    const processedQuestions = useMemo(() => {
        if (!flatQuestions || flatQuestions.length === 0) return [];

        const questionsMap = new Map();
        flatQuestions.forEach(item => {
            if (!questionsMap.has(item.QuestionId)) {
                questionsMap.set(item.QuestionId, {
                    id: item.QuestionId,
                    text: item.QuestionText,
                    sortIndex: item.SortIndex,
                    options: []
                });
            }
            questionsMap.get(item.QuestionId).options.push({
                id: item.OptionId,
                text: item.OptionText,
                isCorrect: item.IsCorrect
            });
        });

        // تبدیل Map به آرایه و مرتب‌سازی بر اساس SortIndex
        return Array.from(questionsMap.values()).sort((a, b) => a.sortIndex - b.sortIndex);
    }, [flatQuestions]);

    // مدیریت انتخاب گزینه
    const handleOptionSelect = (option) => {
        if (selectedOptionId) return; // اگر قبلا انتخاب شده، کاری نکن

        setSelectedOptionId(option.id);
        if (option.isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    // مدیریت رفتن به سوال بعدی یا پایان آزمون
    const handleNext = () => {
        if (currentQuestionIndex < processedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptionId(null);
        } else {
            setIsFinished(true);
        }
    };

    // مدیریت شروع مجدد آزمون
    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setScore(0);
        setIsFinished(false);
    };

    // ==========================================
    // رندرهای وضعیت‌های مختلف
    // ==========================================

    if (loading) {
        return <LoadingUI />;
    }

    if (error) {
        return <ErrorUI error={error} slug={slug} />;
    }

    if (processedQuestions.length === 0) {
        return <div className="text-center p-8">آزمونی برای نمایش وجود ندارد.</div>
    }

    const currentQuestion = processedQuestions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / processedQuestions.length) * 100;

    // اگر آزمون تمام شده، صفحه نتایج را نمایش بده
    if (isFinished) {
        return <ResultsScreen score={score} totalQuestions={processedQuestions.length} onRetry={handleRetry} slug={slug} />;
    }

    // رندر اصلی آزمون
    return (
        <div className="max-w-3xl mx-auto my-10 p-4 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
            {/* هدر آزمون با نوار پیشرفت */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>سوال {currentQuestionIndex + 1} از {processedQuestions.length}</span>
                    <span>امتیاز: {score}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <motion.div
                        className="bg-emerald-500 h-2.5 rounded-full"
                        initial={{ width: `${((currentQuestionIndex) / processedQuestions.length) * 100}%` }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>
            </div>

            {/* بخش سوال */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-8 text-center leading-relaxed">
                        {currentQuestion.text}
                    </h2>

                    {/* گزینه‌ها */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map(option => {
                            const isSelected = selectedOptionId === option.id;
                            const isCorrectAnswer = option.isCorrect;
                            let buttonClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700";

                            if (selectedOptionId) {
                                if (isSelected) {
                                    buttonClass = isCorrectAnswer ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "border-rose-500 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400";
                                } else if (isCorrectAnswer) {
                                    buttonClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
                                } else {
                                    buttonClass = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 opacity-70";
                                }
                            }

                            return (
                                <motion.button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={!!selectedOptionId}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 text-right w-full transition-all duration-300 ${buttonClass}`}
                                    whileTap={{ scale: selectedOptionId ? 1 : 0.97 }}
                                >
                                    <span className="font-medium text-lg">{option.text}</span>
                                    {selectedOptionId && (isSelected || isCorrectAnswer) && (
                                        <div className={`p-1.5 rounded-full ${isCorrectAnswer ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                            {isCorrectAnswer ? <Check size={18} /> : <X size={18} />}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* دکمه بعدی */}
            <div className="mt-10 flex justify-end">
                <AnimatePresence>
                    {selectedOptionId && (
                        <motion.button
                            onClick={handleNext}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            {currentQuestionIndex < processedQuestions.length - 1 ? 'سوال بعدی' : 'مشاهده نتایج'}
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// کامپوننت‌های UI برای وضعیت‌های مختلف (برای تمیزی کد)
const LoadingUI = () => (
    <div className="flex flex-col min-h-[60vh] items-center justify-center animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
            <LoadingSpinner className="w-10 h-10 text-emerald-500 relative z-10" />
        </div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse tracking-wide">
            در حال آماده‌سازی آزمون...
        </p>
    </div>
);

const ErrorUI = ({ error, slug }) => (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-red-100 p-8 rounded-3xl shadow-xl shadow-red-900/5 max-w-md w-full text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-12">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">اوه! مشکلی پیش آمد</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {typeof error === "string" ? error : "خطا در دریافت اطلاعات آزمون. لطفاً اتصال اینترنت خود را بررسی کنید."}
            </p>
            <Link
                href={`/docs/${slug}`}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
                بازگشت به صفحه دوره
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    </div>
);

const ResultsScreen = ({ score, totalQuestions, onRetry, slug }) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[80vh] items-center justify-center p-4"
        >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-black/20 max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', delay: 0.2, duration: 1 }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
                >
                    <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">آزمون تمام شد!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">خسته نباشی! اینم نتیجه عملکردت:</p>

                <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl mb-8">
                    <div className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">{percentage}%</div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">
                        شما به <strong className="text-slate-800 dark:text-white">{score}</strong> از <strong className="text-slate-800 dark:text-white">{totalQuestions}</strong> سوال پاسخ صحیح دادی.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onRetry}
                        className="flex-1 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        آزمون مجدد
                    </button>
                    <Link
                        href={`/docs/${slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        بازگشت به دوره
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

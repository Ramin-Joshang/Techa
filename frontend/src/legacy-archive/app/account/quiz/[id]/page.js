"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, ChevronRight, ChevronLeft, Flag, CheckCircle,
    AlertTriangle, Check, LogOut, Award, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizeById, fetchQuizQuestions, sendQuize } from '../../../../features/main/quizzes/quizzesActions';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

export default function LiveExamPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const { loading, error, singlequiz, quizQuestions: flatQuestions } = useSelector(state => state.quizzes);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [flagged, setFlagged] = useState(new Set());

    const [timeLeft, setTimeLeft] = useState(null);
    const [startTime, setStartTime] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false); // وضعیت لودینگ هنگام ارسال
    const [isFinished, setIsFinished] = useState(false);
    const [examResult, setExamResult] = useState(null); // ذخیره نتیجه دریافتی از سرور

    useEffect(() => {
        if (id) {
            dispatch(fetchQuizeById({ QuizId: id }));
            dispatch(fetchQuizQuestions({ QuizId: id }));
        }
    }, [dispatch, id]);

    // پردازش سوالات (دیگر نیازی به IsCorrect در فرانت‌اند نیست)
    const processedQuestions = useMemo(() => {
        if (!flatQuestions || flatQuestions.length === 0) return [];
        const questionsMap = new Map();

        flatQuestions.forEach(item => {
            if (!questionsMap.has(item.QuestionId)) {
                questionsMap.set(item.QuestionId, {
                    id: item.QuestionId,
                    text: item.Question,
                    sortIndex: item.SortIndex,
                    options: []
                });
            }
            questionsMap.get(item.QuestionId).options.push({
                id: item.OptionId,
                text: item.OptionText
            });
        });
        return Array.from(questionsMap.values()).sort((a, b) => a.sortIndex - b.sortIndex);
    }, [flatQuestions]);

    useEffect(() => {
        if (isFinished || !singlequiz?.TimeLimit) return;

        if (timeLeft === null) {
            setTimeLeft(singlequiz.TimeLimit * 60);
            setStartTime(new Date());
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, singlequiz, timeLeft]);

    const formatTime = (sec) => {
        if (sec === null) return '...';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const toggleFlag = () => {
        const newSet = new Set(flagged);
        if (newSet.has(currentIdx)) newSet.delete(currentIdx);
        else newSet.add(currentIdx);
        setFlagged(newSet);
    };
    function getLocalDateTimeForSql(date) {
        const pad = (n) => n.toString().padStart(2, '0');

        return (
            date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + ' ' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes()) + ':' +
            pad(date.getSeconds())
        );
    }

    // تابع جدید پایان آزمون و ارسال به سرور
    const finishExam = async () => {
        if (isFinished || isSubmitting) return;
        setIsSubmitting(true);

        // تبدیل آبجکت جواب‌ها به آرایه‌ای که دیتابیس (Type) نیاز دارد
        const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
            QuestionId: parseInt(qId),
            OptionId: parseInt(optId)
        }));

        const payload = {
            QuizId: parseInt(id),
            UserId: 9,
            StartedAt: getLocalDateTimeForSql(startTime),
            FinishedAt: getLocalDateTimeForSql(new Date()),
            Answers: JSON.stringify(formattedAnswers)
        };


        console.log(payload)
        try {
            // فرض بر این است که sendQuize یک async thunk است و شما نتیجه SP را برمی‌گردانید
            const result = await dispatch(sendQuize(payload)).unwrap();

            // نتیجه دریافتی از سرور را در State ذخیره می‌کنیم
            setExamResult(result);
            setIsFinished(true);
            console.log(result)
        } catch (err) {
            console.error("Failed to submit quiz:", err);
            // اینجا می‌توانید یک Toast ارور نمایش دهید
        } finally {
            setIsSubmitting(false);
        }
    };

    const allAnswered = processedQuestions.length > 0 && Object.keys(answers).length === processedQuestions.length;

    if (loading && !singlequiz) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner className="w-12 h-12 text-indigo-600" /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-rose-500">{error}</div>;
    }

    // اگر آزمون تمام شده و نتیجه از سرور آمده، صفحه نتیجه را نشان بده
    if (isFinished && examResult) {
        return <ResultView result={examResult} />;
    }

    if (processedQuestions.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">سوالی برای این آزمون یافت نشد.</div>
    }

    const currentQuestion = processedQuestions[currentIdx];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" dir="rtl">
            <aside className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 z-20">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-slate-800">{singlequiz?.Title}</h2>
                        <span className="text-xs text-slate-500">آزمون آنلاین</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-lg flex items-center gap-2 ${timeLeft < 300 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-4">سوالات آزمون</p>
                    <div className="grid grid-cols-5 gap-2">
                        {processedQuestions.map((q, idx) => {
                            const isAnswered = answers[q.id] !== undefined;
                            const isFlagged = flagged.has(idx);
                            const isCurrent = currentIdx === idx;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIdx(idx)}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                                        ${isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110 z-10' :
                                            isAnswered ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {idx + 1}
                                    {isFlagged && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 border border-white"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={finishExam}
                        disabled={!allAnswered || isSubmitting}
                        className="w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-bold border border-rose-100 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <LogOut className="w-4 h-4" />
                                پایان آزمون
                            </>
                        )}
                    </button>
                    {!allAnswered && <p className="text-center text-xs text-slate-400 mt-2">برای پایان، به همه سوالات پاسخ دهید</p>}
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 flex flex-col max-w-4xl mx-auto w-full">
                {/* ... (بخش Progress Bar و نمایش سوالات دقیقاً مشابه کد قبلی است و نیازی به تغییر ندارد) ... */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIdx + 1) / processedQuestions.length) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIdx}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                                سوال {currentIdx + 1} از {processedQuestions.length}
                            </span>
                            <button
                                onClick={toggleFlag}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${flagged.has(currentIdx) ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Flag className={`w-4 h-4 ${flagged.has(currentIdx) ? 'fill-current' : ''}`} />
                                {flagged.has(currentIdx) ? 'نشان شده' : 'نشان کردن'}
                            </button>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-10">
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((opt, index) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                                    className={`w-full p-5 rounded-2xl text-right transition-all border-2 relative ${answers[currentQuestion.id] === opt.id
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                                        : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${answers[currentQuestion.id] === opt.id
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-slate-400 border-slate-200'
                                            }`}>
                                            {String.fromCharCode(1575 + index)}
                                        </div>
                                        <span className="font-medium text-lg">{opt.text}</span>
                                    </div>
                                    {answers[currentQuestion.id] === opt.id && (
                                        <motion.div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-600">
                                            <CheckCircle className="w-6 h-6 fill-indigo-100" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronRight className="w-5 h-5" />
                        قبلی
                    </button>

                    <button
                        onClick={() => {
                            if (currentIdx < processedQuestions.length - 1) setCurrentIdx(prev => prev + 1);
                            else finishExam();
                        }}
                        disabled={(currentIdx === processedQuestions.length - 1 && !allAnswered) || isSubmitting}
                        className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> :
                            (currentIdx === processedQuestions.length - 1 ? 'پایان آزمون' : 'سوال بعدی')
                        }
                        {currentIdx === processedQuestions.length - 1 ? <Check className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </main>
        </div>
    );
}

// --- Result Component ---
// تغییر: مقادیر مستقیماً از result که خروجی سرور است خوانده می‌شوند
const ResultView = ({ result }) => {
    // گرفتن متغیرها بر اساس خروجی که در SP تعریف کردید
    const { Score, CorrectAnswers, TotalQuestions, Passed } = result[0];

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl"
        >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${Passed ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-red-500'}`}></div>

                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${Passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                >
                    {Passed ? <Award className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                </motion.div>

                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                    {Passed ? 'تبریک! قبول شدید' : 'متاسفانه قبول نشدید'}
                </h1>
                <p className="text-slate-500 mb-10">
                    {Passed ? 'شما با موفقیت آزمون را پشت سر گذاشتید.' : 'نیاز به تلاش بیشتر دارید.'}
                </p>

                <div className="relative w-48 h-48 mx-auto mb-10">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" className="text-slate-100" strokeWidth="12" fill="none" stroke="currentColor" />
                        <motion.circle
                            initial={{ pathLength: 0 }} animate={{ pathLength: Score / 100 }} transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="96" cy="96" r="88"
                            className={Passed ? "text-emerald-500" : "text-rose-500"}
                            strokeWidth="12" fill="none" strokeLinecap="round" stroke="currentColor"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-slate-800">{Score}%</span>
                        <span className="text-sm text-slate-400 font-medium mt-1">نمره نهایی</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                        <div className="text-2xl font-bold text-slate-800">{TotalQuestions}</div>
                        <div className="text-xs text-slate-500">کل سوالات</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                        <div className="text-2xl font-bold text-slate-800">{CorrectAnswers}</div>
                        <div className="text-xs text-slate-500">پاسخ صحیح</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/account/quiz" className="flex-1">
                        <button className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            بازگشت به لیست آزمون‌ها
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

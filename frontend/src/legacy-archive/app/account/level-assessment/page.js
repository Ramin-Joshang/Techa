"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
    Clock,
} from "lucide-react";
import StartScreen from "../../../components/account/level-assessment/StartScreen";
import QuestionCard from "../../../components/account/level-assessment/QuestionCard";
import ResultScreen from "../../../components/account/level-assessment/ResultScreen";
import HistorySection from "../../../components/account/level-assessment/HistorySection";

const AssessmentWizard = () => {
    const [step, setStep] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [history, setHistory] = useState([]);
    const [selectedTech, setSelectedTech] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [progress, setProgress] = useState(0);

    // سوالات طبقه‌بندی شده
    const questions = {
        html: [
            {
                id: 'html1',
                type: 'code',
                lang: 'html',
                code: `<div class="header">\n  <h1>عنوان سایت</h1>\n</div>`,
                question: "بهترین جایگزین معنایی برای این کد چیست؟",
                options: ["<header>", "<head>", "<section>", "<div>"],
                correct: 0,
                time: 45,
                difficulty: 'medium',
                explanation: "استفاده از تگ <header> برای بخش هدر صفحه مناسب‌تر و معنایی است.",
                chapter: 'فصل 1',
                session: 'جلسه 1'
            },
            {
                id: 'html2',
                type: 'theory',
                question: "کدام تگ برای ایجاد لیست توصیفی استفاده می‌شود؟",
                options: ["<ul>", "<dl>", "<ol>", "<li>"],
                correct: 1,
                time: 30,
                difficulty: 'easy',
                explanation: "تگ <dl> برای لیست‌های توصیفی (Description List) استفاده می‌شود.",
                chapter: 'فصل 1',
                session: 'جلسه 2'
            }
        ],
        css: [
            {
                id: 'css1',
                type: 'code',
                lang: 'css',
                code: `.container {\n  display: flex;\n  gap: 1rem;\n}`,
                question: "این کد چه تاثیری دارد؟",
                options: [
                    "ایجاد فاصله بین آیتم‌ها",
                    "تراز عمودی آیتم‌ها",
                    "تغییر جهت flex",
                    "هیچکدام"
                ],
                correct: 0,
                time: 35,
                difficulty: 'easy',
                explanation: "خاصیت gap فاصله بین آیتم‌های flex را تعیین می‌کند.",
                chapter: 'فصل 2',
                session: 'جلسه 1'
            },
            {
                id: 'css2',
                type: 'theory',
                question: "کدام واحد نسبت به اندازه فونت والد نسبی است؟",
                options: ["rem", "em", "px", "vw"],
                correct: 1,
                time: 30,
                difficulty: 'medium',
                explanation: "واحد em نسبت به فونت‌سایز المان والد محاسبه می‌شود.",
                chapter: 'فصل 2',
                session: 'جلسه 2'
            }
        ],
        tailwindCSS: [
            {
                id: 'tailwind1',
                type: 'code',
                lang: 'html',
                code: `<div class="grid grid-cols-3 gap-4 p-6">...</div>`,
                question: "این کلاس‌های Tailwind چه چیزی را ایجاد می‌کنند؟",
                options: [
                    "یک شبکه با 3 ستون و فاصله بین آنها",
                    "یک شبکه با 4 ستون",
                    "یک شبکه با 2 ستون",
                    "هیچکدام"
                ],
                correct: 0,
                time: 35,
                difficulty: 'easy',
                explanation: "کلاس grid-cols-3 به معنای ایجاد 3 ستون در شبکه است.",
                chapter: 'فصل 3',
                session: 'جلسه 1'
            },
            {
                id: 'tailwind2',
                type: 'theory',
                question: "کدام کلاس برای ایجاد حاشیه در Tailwind استفاده می‌شود؟",
                options: ["m-", "p-", "border-", "flex-"],
                correct: 2,
                time: 30,
                difficulty: 'easy',
                explanation: "کلاس border- برای اضافه کردن حاشیه به المان‌ها در Tailwind استفاده می‌شود.",
                chapter: 'فصل 3',
                session: 'جلسه 2'
            }
        ],
        javaScript: [
            {
                id: 'js1',
                type: 'code',
                lang: 'javascript',
                code: `const numbers = [1, 2, 3];\nconst doubled = numbers.map(n => n * 2);`,
                question: "خروجی این کد چیست؟",
                options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "خطا"],
                correct: 1,
                time: 40,
                difficulty: 'medium',
                explanation: "متد map هر عنصر را دو برابر می‌کند و آرایه جدیدی برمی‌گرداند.",
                chapter: 'فصل 4',
                session: 'جلسه 1'
            },
            {
                id: 'js2',
                type: 'theory',
                question: "کدام یک از این موارد یک نوع داده در JavaScript نیست؟",
                options: ["String", "Boolean", "Number", "Character"],
                correct: 3,
                time: 30,
                difficulty: 'easy',
                explanation: "Character نوع داده‌ای در JavaScript نیست و به صورت String نمایش داده می‌شود.",
                chapter: 'فصل 4',
                session: 'جلسه 2'
            }
        ],
        react: [
            {
                id: 'react1',
                type: 'code',
                lang: 'jsx',
                code: `function App() {\n  return <h1>Hello, World!</h1>;\n}`,
                question: "این کامپوننت چه چیزی را نمایش می‌دهد؟",
                options: ["Hello, World!", "خطا", "undefined", "هیچکدام"],
                correct: 0,
                time: 30,
                difficulty: 'easy',
                explanation: "این کامپوننت یک عنوان با متن 'Hello, World!' را نمایش می‌دهد.",
                chapter: 'فصل 5',
                session: 'جلسه 1'
            },
            {
                id: 'react2',
                type: 'theory',
                question: "کدام یک از این هوک‌ها برای مدیریت وضعیت در React استفاده می‌شود؟",
                options: ["useEffect", "useState", "useContext", "همه موارد"],
                correct: 1,
                time: 30,
                difficulty: 'medium',
                explanation: "هوک useState برای مدیریت وضعیت در کامپوننت‌های React استفاده می‌شود.",
                chapter: 'فصل 5',
                session: 'جلسه 2'
            }
        ],
        nextJS: [
            {
                id: 'nextjs1',
                type: 'theory',
                question: "کدام ویژگی Next.js برای رندر سمت سرور استفاده می‌شود؟",
                options: ["getStaticProps", "getServerSideProps", "useEffect", "همه موارد"],
                correct: 1,
                time: 45,
                difficulty: 'medium',
                explanation: "getServerSideProps برای رندر کردن صفحات در سمت سرور استفاده می‌شود.",
                chapter: 'فصل 6',
                session: 'جلسه 1'
            },
            {
                id: 'nextjs2',
                type: 'code',
                lang: 'javascript',
                code: `export async function getStaticProps() {\n  return { props: { data: 'Hello' } };\n}`,
                question: "این کد چه کاری انجام می‌دهد؟",
                options: [
                    "داده‌ها را از API بارگذاری می‌کند",
                    "صفحه را در زمان ساخت رندر می‌کند",
                    "داده‌ها را در سمت کلاینت بارگذاری می‌کند",
                    "هیچکدام"
                ],
                correct: 1,
                time: 40,
                difficulty: 'medium',
                explanation: "این تابع برای رندر کردن صفحه در زمان ساخت استفاده می‌شود و داده‌ها را به عنوان props به کامپوننت می‌دهد.",
                chapter: 'فصل 6',
                session: 'جلسه 2'
            }
        ]
    };

    // ترکیب سوالات بر اساس تکنولوژی‌های انتخاب شده
    const allQuestions = selectedTech
        .map(tech => questions[tech])
        .flat();

    // بارگذاری تاریخچه از localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('assessmentHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Error parsing history:', error);
            }
        }
    }, []);

    // شروع آزمون
    const startAssessment = (techList) => {
        if (techList.length === 0) return;

        setSelectedTech(techList);
        setStep(1);
        setCurrentQuestion(0);
        setAnswers([]);
        setTimeLeft(allQuestions[0]?.time || 30);
        setProgress(0);
    };

    // مدیریت پاسخ‌دهی
    // مدیریت پاسخ‌دهی
    const handleAnswer = useCallback((answerIndex) => {
        const newAnswers = [...answers, answerIndex];
        setAnswers(newAnswers);

        // ذخیره پاسخ فعلی
        const currentAnswer = {
            questionId: allQuestions[currentQuestion].id,
            answer: answerIndex,
            isCorrect: answerIndex === allQuestions[currentQuestion].correct,
            timeSpent: allQuestions[currentQuestion].time - timeLeft,
            chapter: allQuestions[currentQuestion].chapter, // اضافه کردن فصل
            session: allQuestions[currentQuestion].session  // اضافه کردن جلسه
        };



        // بررسی پایان آزمون
        if (currentQuestion < allQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTimeLeft(allQuestions[currentQuestion + 1]?.time);
            setShowExplanation(false);
        } else {
            // ذخیره نتیجه نهایی
            const result = {
                id: Date.now(),
                date: new Date().toISOString(),
                score: calculateScore(newAnswers),
                total: allQuestions.length,
                tech: selectedTech,
                details: newAnswers.map((ans, idx) => ({
                    questionId: allQuestions[idx].id,
                    answer: ans,
                    isCorrect: ans === allQuestions[idx].correct,
                    chapter: allQuestions[idx].chapter, // اضافه کردن فصل
                    session: allQuestions[idx].session  // اضافه کردن جلسه
                }))
            };

            setHistory(prev => {
                const newHistory = [result, ...prev.slice(0, 9)]; // فقط 10 نتیجه آخر را نگه دار
                localStorage.setItem('assessmentHistory', JSON.stringify(newHistory));
                return newHistory;
            });

            setStep(2);
        }
    }, [answers, currentQuestion, allQuestions, timeLeft, selectedTech]);
    // محاسبه امتیاز
    const calculateScore = useCallback((answers) => {
        return allQuestions.reduce((score, q, index) =>
            answers[index] === q.correct ? score + 1 : score, 0
        );
    }, [allQuestions]);

    // مدیریت زمان
    useEffect(() => {
        let timer;
        if (step === 1 && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAnswer(-1); // پاسخ ندادن
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft, handleAnswer]);

    // محاسبه پیشرفت
    useEffect(() => {
        if (allQuestions.length > 0) {
            setProgress(((currentQuestion + 1) / allQuestions.length) * 100);
        }
    }, [currentQuestion, allQuestions.length]);

    // محاسبه سطح کاربر
    const calculateUserLevel = useCallback((score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 90) return { level: 'حرفه‌ای', color: 'bg-purple-500' };
        if (percentage >= 70) return { level: 'پیشرفته', color: 'bg-emerald-500' };
        if (percentage >= 50) return { level: 'متوسط', color: 'bg-blue-500' };
        return { level: 'مبتدی', color: 'bg-amber-500' };
    }, []);

    // ریست آزمون
    const resetAssessment = () => {
        setStep(0);
        setCurrentQuestion(0);
        setAnswers([]);
        setSelectedTech([]);
        setTimeLeft(0);
        setProgress(0);
    };
    console.log(history)
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <>
                        <StartScreen
                            key="start"
                            onStart={startAssessment}
                            history={history}
                            selectedTech={selectedTech}
                            setSelectedTech={setSelectedTech}
                        />


                        <HistorySection
                            history={history}
                            className="bg-white max-w-4xl mx-auto rounded-2xl shadow-sm p-6 border border-emerald-100 
                bg-gradient-to-b from-white to-emerald-50"
                        />
                    </>
                )}

                {step === 1 && (
                    <motion.div
                        key="assessment"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-3xl mx-auto px-4 py-8 sm:py-12"
                    >
                        <AssessmentHeader
                            progress={progress}
                            timeLeft={timeLeft}
                            currentQuestion={currentQuestion + 1}
                            totalQuestions={allQuestions.length}
                        />

                        <QuestionCard
                            question={allQuestions[currentQuestion]}
                            onAnswer={handleAnswer}
                            showExplanation={showExplanation}
                            setShowExplanation={setShowExplanation}
                        />
                    </motion.div>
                )}

                {step === 2 && (
                    <ResultScreen
                        key="result"
                        score={calculateScore(answers)}
                        total={allQuestions.length}
                        tech={selectedTech}
                        answers={answers}
                        questions={allQuestions}
                        onRestart={resetAssessment}
                        history={history}
                        calculateUserLevel={calculateUserLevel}
                    />
                )}
            </AnimatePresence>
            {/* <HistorySection
                history={history}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            /> */}
        </div>
    );
};

// کامپوننت هدر آزمون
const AssessmentHeader = ({ progress, timeLeft, currentQuestion, totalQuestions }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-green-100 bg-gradient-to-br from-white to-green-50">
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-48 h-3 bg-green-100 rounded-full overflow-hidden">
                <motion.div
                    className="absolute h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full shadow-inner"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                        duration: 0.8,
                        ease: "easeInOut"
                    }}
                />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600">
                    {currentQuestion}
                </span>
                <span className="text-sm text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
                    {totalQuestions}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-green-100/80 px-4 py-2 rounded-full border border-green-200 backdrop-blur-sm whitespace-nowrap">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-700 w-10">
                {timeLeft}
                <span className="text-sm text-emerald-500 ml-1"> ثانیه</span>
            </span>
        </div>
    </div>
);

export default AssessmentWizard;
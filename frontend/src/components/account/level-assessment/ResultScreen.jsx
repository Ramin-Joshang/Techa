import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, RotateCw, Leaf, Code, BookOpen, ChevronRight, Calendar, Award, Clock, PieChart } from "lucide-react";
import TechBadge from "./TechBadge";
import { useEffect, useState } from "react";
import ProgressCircle from "./ProgressCircle";

// تنظیمات پیشنهادی دوره‌ها
const roadmapConfig = {
    html: {
        courses: [
            {
                title: "دوره جامع HTML از صفر تا پروژه",
                link: "/courses/html",
                chapters: ["فصل ۱", "فصل ۲", "فصل ۴"],
            },
        ],
    },
    css: {
        courses: [
            {
                title: "CSS پیشرفته با Flex و Grid",
                link: "/courses/css-advanced",
                chapters: ["فصل ۲", "فصل ۳"],
            },
        ],
    },
    tailwindCSS: {
        courses: [
            {
                title: "آموزش Tailwind CSS در ۳ ساعت",
                link: "/courses/tailwind",
                chapters: ["فصل ۱", "فصل ۳", "فصل ۵"],
            },
        ],
    },
    javaScript: {
        courses: [
            {
                title: "جاوااسکریپت مدرن از پایه",
                link: "/courses/js",
                chapters: ["فصل ۲", "فصل ۳"],
            },
        ],
    },
    react: {
        courses: [
            {
                title: "React.js جامع (با پروژه)",
                link: "/courses/react",
                chapters: ["فصل ۱", "فصل ۳"],
            },
        ],
    },
    nextJS: {
        courses: [
            {
                title: "Next.js برای تولید وب‌اپلیکیشن",
                link: "/courses/nextjs",
                chapters: ["فصل ۱", "فصل ۲"],
            },
        ],
    },
};

const ResultScreen = ({
    score,
    total,
    tech,
    answers,
    questions,
    onRestart,
    calculateUserLevel,
}) => {
    const [history, setHistory] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        // Load history from localStorage
        const savedHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
        setHistory(savedHistory);
    }, []);

    useEffect(() => {
        // Save new result when component mounts
        const newResult = {
            id: Date.now(),
            date: new Date().toISOString(),
            score,
            total,
            tech,
            details: questions.map((q, i) => ({
                questionId: q.id,
                answer: answers[i],
                isCorrect: answers[i] === q.correctAnswer,
                chapter: q.chapter,
                session: q.session,
            })),
        };

        const updatedHistory = [newResult, ...history.slice(0, 4)];
        localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
    }, []);

    const percentage = Math.round((score / total) * 100);
    const { level, color } = calculateUserLevel(score, total);
    const avgTime = Math.round(
        questions.reduce((sum, q, i) =>
            sum + (q.time - (answers[i] === -1 ? q.time : 0)),
            0
        )) / questions.length;

    // محاسبه آمار هر تکنولوژی
    const techStats = {};
    questions.forEach((q, i) => {
        const techName = q.tech;
        if (!techStats[techName]) {
            techStats[techName] = {
                total: 0,
                correct: 0,
                weakAreas: new Set(),
            };
        }
        techStats[techName].total += 1;
        if (answers[i] !== -1 && answers[i] === q.correctAnswer) {
            techStats[techName].correct += 1;
        } else {
            techStats[techName].weakAreas.add(`${q.chapter} - ${q.session}`);
        }
    });

    // تبدیل Set به Array
    Object.keys(techStats).forEach((tech) => {
        techStats[tech].weakAreas = Array.from(techStats[tech].weakAreas);
    });

    // تابع برای تعیین رنگ بر اساس درصد نمره


    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-4xl mx-auto px-4 py-12"
        >
            {/* بخش هدر و آمار کلی */}
            <div className="text-center mb-12 space-y-8">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex flex-col items-center"
                >
                    <div className={`p-6 rounded-2xl shadow-lg mb-4 ${color} text-white 
              bg-gradient-to-br from-emerald-500 to-green-600`}>
                        <Trophy className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        <span className="bg-gradient-to-r from-emerald-600 to-green-500 
                bg-clip-text text-transparent">
                            ارزیابی تکمیل شد!
                        </span>
                    </h2>
                    <div className={`mt-2 px-4 py-1 rounded-full ${color} 
              bg-opacity-20 text-emerald-700 font-medium`}>
                        سطح مهارت: {level}
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* کارت امتیاز نهایی */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 
              bg-gradient-to-b from-white to-emerald-50">
                        <h3 className="text-lg font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            امتیاز نهایی
                        </h3>
                        <div className="text-4xl font-bold text-emerald-600">
                            {score}<span className="text-2xl text-emerald-400">/{total}</span>
                        </div>
                        <div className="mt-2 text-sm text-emerald-500">
                            {percentage}% پاسخ صحیح
                        </div>
                    </div>

                    {/* کارت میانگین زمان */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 
              bg-gradient-to-b from-white to-emerald-50">
                        <h3 className="text-lg font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                            <Leaf className="w-5 h-5" />
                            سرعت پاسخگویی
                        </h3>
                        <div className="text-4xl font-bold text-emerald-600">
                            {avgTime.toFixed(2)} ثانیه
                        </div>
                        <div className="mt-2 text-sm text-emerald-500">
                            میانگین زمان هر سوال
                        </div>
                    </div>

                    {/* کارت مهارت‌ها */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 
              bg-gradient-to-b from-white to-emerald-50">
                        <h3 className="text-lg font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            حوزه‌های ارزیابی
                        </h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {tech.map(t => (
                                <TechBadge key={t} tech={t} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* نمودار پیشرفت */}
                <div className="flex justify-center mt-8 w-full">
                    <ProgressCircle
                        progress={percentage}
                        size={160}
                        strokeWidth={12}
                        color="stroke-emerald-500"
                        className="border-emerald-100 rounded-full p-2"
                    />
                </div>
            </div>

            {/* تحلیل تکنولوژی‌ها */}
            <div className="space-y-8 mb-16">
                {tech.map((techName) => (
                    <TechAnalysisSection
                        key={techName}
                        techName={techName}
                        stats={techStats[techName] || { total: 0, correct: 0, weakAreas: [] }}
                        roadmapConfig={roadmapConfig}
                    />
                ))}
            </div>

            {/* تاریخچه نتایج + نتیجه فعلی */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-emerald-100"
            >
                <h3 className="text-xl font-semibold text-emerald-800 p-6 border-b border-emerald-100 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                    نتایج اخیر شما
                </h3>

                <AnimatePresence initial={false}>
                    {history.map((record) => (
                        <HistoryItem
                            key={record.id}
                            record={record}
                            expandedId={expandedId}
                            setExpandedId={setExpandedId}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* دکمه شروع مجدد */}
            <div className="flex justify-center mt-12">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRestart}
                    className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-3.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-emerald-200/50"
                >
                    <RotateCw className="w-5 h-5" />
                    شروع آزمون مجدد
                </motion.button>
            </div>
        </motion.div>
    );
};

// کامپوننت جداگانه برای آیتم تاریخچه
const HistoryItem = ({ record, expandedId, setExpandedId }) => {
    const percentage = (record.score / record.total) * 100;

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return "text-green-600";
        if (percentage >= 50) return "text-amber-600";
        return "text-red-600";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
    };

    return (
        <motion.article
            layout
            transition={{ duration: 0.2, type: "spring" }}
            className="group p-6 hover:bg-emerald-50/50 transition-colors border-b border-emerald-100 last:border-0"
        >
            <button
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                className="w-full text-left focus:outline-none"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreColor(percentage)} bg-emerald-50`}>
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <time className="text-sm text-emerald-600 block mb-1">
                                {formatDate(record.date)}
                            </time>
                            <div className="flex flex-wrap gap-2">
                                {record.tech.map((t) => (
                                    <TechBadge key={t} tech={t} small />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className={`font-bold text-lg ${getScoreColor(percentage)}`}>
                                {percentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-emerald-600">
                                {record.score}/{record.total}
                            </div>
                        </div>
                        <ChevronRight className={`text-emerald-400 transition-transform ${expandedId === record.id ? "rotate-90" : ""
                            }`} />
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {expandedId === record.id && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-6 mt-4"
                    >
                        {/* جزئیات سوالات */}
                        <div className="grid gap-4">
                            {record.details.map((q, i) => (
                                <div
                                    key={q.questionId}
                                    className={`p-4 rounded-lg border ${q.isCorrect
                                        ? "border-emerald-200 bg-emerald-50"
                                        : "border-rose-200 bg-rose-50"
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-emerald-800">
                                                سوال {i + 1}
                                            </div>
                                            <div className="text-sm text-emerald-600">
                                                {q.chapter} - {q.session}
                                            </div>
                                        </div>
                                        <div className={`text-sm font-medium ${q.isCorrect ? "text-emerald-600" : "text-rose-600"
                                            }`}>
                                            {q.isCorrect ? "صحیح" : "نادرست"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
};

// کامپوننت جداگانه برای تحلیل هر تکنولوژی
const TechAnalysisSection = ({ techName, stats, roadmapConfig }) => {
    const scorePercent = stats.total
        ? Math.round((stats.correct / stats.total) * 100)
        : 0;
    const courses = roadmapConfig[techName]?.courses || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-50"
        >
            <div className="flex items-center gap-4 mb-6">
                <TechBadge tech={techName} />
                <h3 className="text-2xl font-bold text-gray-800">
                    تحلیل عملکرد {techName}
                </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* نمره و نقاط ضعف */}
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-bold text-emerald-600">
                            {scorePercent}%
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${scorePercent}%` }}
                                />
                            </div>
                            <div className="text-sm text-emerald-600">
                                {stats.correct} از {stats.total} سوال صحیح
                            </div>
                        </div>
                    </div>

                    {stats.weakAreas.length > 0 && (
                        <div className="mt-6">
                            <h4 className="flex items-center gap-2 text-red-600 font-semibold mb-3">
                                <BookOpen className="w-5 h-5" />
                                نیاز به بازبینی در:
                            </h4>
                            <ul className="space-y-2">
                                {stats.weakAreas.map((area, i) => (
                                    <li
                                        key={i}
                                        className="text-gray-600 text-sm bg-red-50 px-3 py-2 rounded-lg"
                                    >
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* دوره‌های پیشنهادی */}
                <div>
                    <h4 className="flex items-center gap-2 text-emerald-700 font-semibold mb-4">
                        <Sparkles className="w-5 h-5" />
                        پیشنهاد آموزشی:
                    </h4>
                    <div className="space-y-3">
                        {courses.map((course, i) => (
                            <a
                                key={i}
                                href={course.link}
                                className="block group p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 bg-gradient-to-r from-white to-emerald-50 hover:to-emerald-100 transition-all"
                            >
                                <div className="font-medium text-emerald-800 group-hover:text-emerald-900">
                                    {course.title}
                                </div>
                                <div className="text-sm text-emerald-600 mt-1">
                                    فصل‌های پوشش داده شده: {course.chapters.join("، ")}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ResultScreen;
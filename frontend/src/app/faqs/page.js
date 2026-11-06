"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Mail, MessageCircle, PhoneCall, BookOpen, User, Sparkles, HelpCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RiFeedbackFill, RiQuestionMark } from "react-icons/ri";

const ModernFAQ = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const faqItems = [
        {
            id: "account",
            title: "حساب کاربری",
            icon: <User className="w-5 h-5" />,
            questions: [
                {
                    id: "q1",
                    question: "چگونه حساب کاربری ایجاد کنم؟",
                    answer: "از طریق دکمه 'ثبت نام' در منوی اصلی میتوانید در کمتر از ۱ دقیقه حساب کاربری خود را ایجاد کنید."
                },
                {
                    id: "q2",
                    question: "چگونه رمز عبور را بازنشانی کنم؟",
                    answer: "در صفحه ورود روی گزینه 'فراموشی رمز عبور' کلیک کرده و مراحل ارسال ایمیل را دنبال کنید."
                },
                {
                    id: "q3",
                    question: "چگونه اطلاعات حساب کاربری خود را ویرایش کنم؟",
                    answer: "پس از ورود به حساب کاربری، به بخش 'تنظیمات' بروید و اطلاعات خود را ویرایش کنید."
                },
                {
                    id: "q4",
                    question: "چگونه حساب کاربری خود را حذف کنم؟",
                    answer: "برای حذف حساب کاربری، با پشتیبانی تماس بگیرید و درخواست خود را ارسال کنید."
                },
                {
                    id: "q5",
                    question: "چگونه می‌توانم از حساب کاربری خود خارج شوم؟",
                    answer: "برای خروج از حساب کاربری، روی دکمه 'خروج' در منوی کاربری کلیک کنید."
                }
            ]
        },
        {
            id: "courses",
            title: "دوره های آموزشی",
            icon: <BookOpen className="w-5 h-5" />,
            questions: [
                {
                    id: "q1",
                    question: "آیا محتوای دوره ها همیشه در دسترس است؟",
                    answer: "بله، پس از خرید هر دوره به صورت مادام العمر به محتوای آن دسترسی خواهید داشت."
                },
                {
                    id: "q2",
                    question: "امکان دریافت مدرک وجود دارد؟",
                    answer: "پس از اتمام موفقیت آمیز هر دوره، مدرک معتبر قابل دانلود ارائه می شود."
                },
                {
                    id: "q3",
                    question: "آیا می‌توانم دوره‌ها را به صورت آنلاین ببینم؟",
                    answer: "بله، تمامی دوره‌ها به صورت آنلاین و در هر زمان قابل دسترسی هستند."
                },
                {
                    id: "q4",
                    question: "آیا دوره‌ها به صورت زنده برگزار می‌شوند؟",
                    answer: "بله، برخی از دوره‌ها به صورت زنده و با حضور مدرس برگزار می‌شوند."
                },
                {
                    id: "q5",
                    question: "چگونه می‌توانم به محتوای دوره دسترسی داشته باشم؟",
                    answer: "پس از خرید دوره، تمامی محتوا در پنل کاربری شما قابل دسترسی خواهد بود."
                }
            ]
        },
        {
            id: "payments",
            title: "پرداخت ها",
            icon: <CreditCard className="w-5 h-5" />,
            questions: [
                {
                    id: "q1",
                    question: "چه روش های پرداختی پشتیبانی می شود؟",
                    answer: "تمام درگاه های بانکی، کیف پول دیجیتال و رمزارزها."
                },
                {
                    id: "q2",
                    question: "آیا پرداخت امن است؟",
                    answer: "ما از جدیدترین استانداردهای امنیتی SSL استفاده میکنیم."
                },
                {
                    id: "q3",
                    question: "آیا امکان پرداخت قسطی وجود دارد؟",
                    answer: "بله، برای برخی از دوره‌ها امکان پرداخت قسطی وجود دارد."
                },
                {
                    id: "q4",
                    question: "چگونه فاکتور خرید خود را دریافت کنم؟",
                    answer: "پس از پرداخت، فاکتور به ایمیل شما ارسال خواهد شد."
                },
                {
                    id: "q5",
                    question: "آیا می‌توانم پرداخت را لغو کنم؟",
                    answer: "در صورت درخواست، می‌توانید پرداخت را لغو کنید، مشروط به شرایط خاص."
                }
            ]
        },
        {
            id: "support",
            title: "پشتیبانی",
            icon: <HelpCircle className="w-5 h-5" />,
            questions: [
                {
                    id: "q1",
                    question: "چگونه با پشتیبانی تماس بگیرم؟",
                    answer: "شما می‌توانید از طریق صفحه 'تماس با ما' با پشتیبانی تماس بگیرید."
                },
                {
                    id: "q2",
                    question: "ساعات کاری پشتیبانی چه زمانی است؟",
                    answer: "پشتیبانی ما از شنبه تا چهارشنبه، از ساعت ۹ صبح تا ۵ بعد از ظهر فعال است."
                },
                {
                    id: "q3",
                    question: "آیا پشتیبانی آنلاین وجود دارد؟",
                    answer: "بله، ما یک چت آنلاین برای پاسخگویی به سوالات شما داریم."
                },
                {
                    id: "q4",
                    question: "چگونه شکایت خود را ثبت کنم؟",
                    answer: "شما می‌توانید شکایت خود را از طریق ایمیل یا فرم تماس ثبت کنید."
                },
                {
                    id: "q5",
                    question: "چگونه می‌توانم سوالات خود را بپرسم؟",
                    answer: "شما می‌توانید سوالات خود را از طریق فرم تماس یا چت آنلاین بپرسید."
                }
            ]
        },
        {
            id: "faq",
            title: "سوالات متداول",
            icon: <RiQuestionMark className="w-5 h-5" />,
            questions: [
                {
                    id: "q1",
                    question: "آیا می‌توانم سوالات خود را در اینجا پیدا کنم؟",
                    answer: "بله، ما سعی کرده‌ایم تمامی سوالات متداول را در این بخش جمع‌آوری کنیم."
                },
                {
                    id: "q2",
                    question: "چگونه می‌توانم به این بخش کمک کنم؟",
                    answer: "اگر سوالی دارید که در اینجا نیست، می‌توانید آن را به ما ارسال کنید."
                },
                {
                    id: "q3",
                    question: "آیا می‌توانم سوالات خود را به زبان‌های دیگر بپرسم؟",
                    answer: "بله، ما از سوالات به زبان‌های مختلف استقبال می‌کنیم و سعی می‌کنیم به آن‌ها پاسخ دهیم."
                },
                {
                    id: "q4",
                    question: "چگونه می‌توانم سوالات خود را بپرسم؟",
                    answer: "شما می‌توانید سوالات خود را از طریق فرم تماس یا چت آنلاین بپرسید."
                },
                {
                    id: "q5",
                    question: "آیا می‌توانم سوالات خود را به صورت ناشناس بپرسم؟",
                    answer: "بله، شما می‌توانید سوالات خود را به صورت ناشناس ارسال کنید."
                }
            ]
        },
        {
            id: "feedback",
            title: "بازخورد",
            icon: <RiFeedbackFill className="w-5 h-5" />,
            questions: [
                {
                    id: "q1",
                    question: "چگونه می‌توانم بازخورد خود را ارسال کنم؟",
                    answer: "شما می‌توانید بازخورد خود را از طریق فرم تماس ارسال کنید."
                },
                {
                    id: "q2",
                    question: "آیا بازخورد من ناشناس خواهد بود؟",
                    answer: "بله، شما می‌توانید بازخورد خود را به صورت ناشناس ارسال کنید."
                },
                {
                    id: "q3",
                    question: "آیا بازخورد من بررسی خواهد شد؟",
                    answer: "بله، تمامی بازخوردها بررسی می‌شوند و در بهبود خدمات ما موثر خواهند بود."
                },
                {
                    id: "q4",
                    question: "چگونه می‌توانم از وضعیت بازخورد خود مطلع شوم؟",
                    answer: "ما به شما ایمیلی ارسال خواهیم کرد تا شما را از وضعیت بازخوردتان مطلع کنیم."
                },
                {
                    id: "q5",
                    question: "آیا می‌توانم بازخورد خود را ویرایش کنم؟",
                    answer: "بله، شما می‌توانید بازخورد خود را ویرایش کنید و دوباره ارسال نمایید."
                }
            ]
        }
    ];

    const filteredItems = faqItems.map(section => ({
        ...section,
        questions: section.questions.filter(q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.questions.length > 0);

    const toggleSection = (sectionId) => {
        if (activeSection === sectionId) {
            setActiveSection(null);
            setActiveQuestion(null);
        } else {
            setActiveSection(sectionId);
            setActiveQuestion(null);
        }
    };

    const toggleQuestion = (questionId) => {
        if (activeQuestion === questionId) {
            setActiveQuestion(null);
        } else {
            setActiveQuestion(questionId);
        }
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 pt-32">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-block mb-6"
                    >
                        <div className="p-4 bg-emerald-500/10 rounded-2xl">
                            <Sparkles className="w-12 h-12 text-emerald-600 animate-pulse" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent mb-4"
                    >
                        سوالات متداول
                    </motion.h1>
                    <p className="text-xl text-gray-600 mb-8">
                        پاسخ به بهترین پرسش‌های شما با <span className="font-semibold text-emerald-600">جزئیات کامل</span>
                    </p>

                    {/* Search Input */}
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="relative max-w-2xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 blur-2xl rounded-xl" />
                        <input
                            type="text"
                            placeholder="جستجو در سوالات..."
                            className="relative w-full pr-14 pl-6 py-4 rounded-xl border-2 border-emerald-100 bg-white/50 backdrop-blur-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-5 top-4 text-emerald-500" />
                    </motion.div>
                </div>

                {/* FAQ Content */}
                <div className="space-y-4">
                    {filteredItems.map((section) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow group"
                        >
                            {/* Section Header - Clickable */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-8 border-b border-emerald-50 text-right"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <motion.div
                                        animate={{ rotate: activeSection === section.id ? 180 : 0 }}
                                        className="p-2 bg-emerald-100 rounded-lg"
                                    >
                                        <ChevronDown className="w-6 h-6 text-emerald-600" />
                                    </motion.div>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-400 rounded-xl text-white">
                                            {section.icon}
                                        </div>
                                        <div className="flex-1 text-right">
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {section.title}
                                            </h2>
                                            <p className="text-gray-500 mt-1">
                                                {section.questions.length} سوال
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Section Questions - Animated */}
                            <AnimatePresence>
                                {activeSection === section.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 space-y-4">
                                            {section.questions.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-emerald-50 hover:to-emerald-100 transition-all"
                                                >
                                                    <button
                                                        onClick={() => toggleQuestion(item.id)}
                                                        className="w-full flex items-center justify-between p-6 group"
                                                    >
                                                        <span className="text-right text-lg font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                                                            {item.question}
                                                        </span>
                                                        <motion.div
                                                            animate={{ rotate: activeQuestion === item.id ? 180 : 0 }}
                                                            className="p-2 bg-emerald-100 rounded-lg"
                                                        >
                                                            <ChevronDown className="w-6 h-6 text-emerald-600" />
                                                        </motion.div>
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeQuestion === item.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-emerald-100">
                                                                    <div className="pr-4 border-r-4 border-emerald-400">
                                                                        {item.answer}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Support Section */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mt-20 text-center bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-xl border-2 border-emerald-100"
                >
                    <div className="max-w-md mx-auto">
                        <div className="inline-block p-6 bg-emerald-500/10 rounded-2xl mb-6">
                            <MessageCircle className="w-12 h-12 text-emerald-600 animate-bounce" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            نیاز به کمک بیشتر دارید؟
                        </h3>
                        <p className="text-gray-600 mb-6">
                            تیم پشتیبانی ما ۲۴ ساعته آماده پاسخگویی است
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ y: -2 }}
                                className="bg-emerald-600 text-white px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-3 shadow-lg hover:shadow-emerald-200"
                            >
                                <Mail className="w-6 h-6" />
                                <span>ارسال تیکت</span>
                            </motion.button>
                            <Link href="contact-us">
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    className="bg-white text-emerald-600 px-8 py-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-200 transition-colors flex items-center gap-3 shadow-lg hover:shadow-emerald-100"
                                >
                                    <PhoneCall className="w-6 h-6" />
                                    <span>تماس فوری</span>
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ModernFAQ;
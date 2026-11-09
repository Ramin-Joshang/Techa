"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, BookOpenText, ShieldAlert, Gavel, ArrowUp, PhoneCall, CreditCard, XCircle, HelpCircle, User } from "lucide-react";
import { useState } from "react";

const TermsPage = () => {
    const [activeSection, setActiveSection] = useState(null);

    const sections = [
        {
            id: "terms",
            title: "قوانین عمومی",
            icon: <Gavel className="w-6 h-6" />,
            content: [
                "استفاده از خدمات ما به منزله پذیرش کامل این قوانین است.",
                "کاربران موظفند اطلاعات صحیح و به روز ارائه دهند.",
                "هرگونه سوء استفاده از پلتفرم پیگرد قانونی دارد."
            ]
        },
        {
            id: "privacy",
            title: "حریم خصوصی",
            icon: <ShieldAlert className="w-6 h-6" />,
            content: [
                "اطلاعات کاربران نزد ما محفوظ است.",
                "ما اطلاعات را به اشخاص ثالث نمیفروشیم.",
                "امکان حذف اطلاعات شخصی از طریق پنل کاربری وجود دارد."
            ]
        },
        {
            id: "content",
            title: "محتوا و مالکیت",
            icon: <BookOpenText className="w-6 h-6" />,
            content: [
                "کلیه محتوای آموزشی تحت قانون کپی رایت است.",
                "استفاده تجاری از محتوا ممنوع است.",
                "انتشار محتوا در پلتفرم‌های دیگر نیاز به مجوز کتبی دارد."
            ]
        },
        {
            id: "payments",
            title: "پرداخت‌ها",
            icon: <CreditCard className="w-6 h-6" />,
            content: [
                "تمامی پرداخت‌ها باید از طریق درگاه‌های معتبر انجام شود.",
                "در صورت بروز مشکل در پرداخت، لطفاً با پشتیبانی تماس بگیرید.",
                "ما هیچ‌گونه مسئولیتی در قبال پرداخت‌های ناموفق نداریم."
            ]
        },
        {
            id: "cancellation",
            title: "لغو و بازگشت",
            icon: <XCircle className="w-6 h-6" />,
            content: [
                "کاربران می‌توانند تا ۷۲ ساعت پس از خرید، درخواست بازگشت وجه دهند.",
                "درخواست‌های بازگشت وجه باید از طریق پنل کاربری ارسال شوند.",
                "بازگشت وجه تنها در صورت عدم دسترسی به محتوای دوره امکان‌پذیر است."
            ]
        },
        {
            id: "support",
            title: "پشتیبانی",
            icon: <HelpCircle className="w-6 h-6" />,
            content: [
                "پشتیبانی ما از شنبه تا چهارشنبه، از ساعت ۹ صبح تا ۵ بعد از ظهر فعال است.",
                "شما می‌توانید از طریق چت آنلاین یا ایمیل با ما تماس بگیرید.",
                "تمامی سوالات و مشکلات شما در اسرع وقت بررسی خواهند شد."
            ]
        },
        {
            id: "user-responsibilities",
            title: "مسئولیت‌های کاربران",
            icon: <User Check className="w-6 h-6" />,
            content: [
                "کاربران موظفند از حساب کاربری خود به درستی استفاده کنند.",
                "هرگونه فعالیت غیرمجاز از حساب کاربری پیگرد قانونی دارد.",
                "کاربران باید از اطلاعات حساب کاربری خود محافظت کنند."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-20 px-4 sm:px-6 lg:px-8 pt-32">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block p-6 bg-emerald-500/10 rounded-2xl mb-8">
                        <Scale className="w-12 h-12 text-emerald-600 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent mb-4">
                        قوانین و مقررات
                    </h1>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        برای حفظ کیفیت خدمات و حقوق همه کاربران، لطفا موارد زیر را با دقت مطالعه کنید
                    </p>
                </motion.div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {sections.map((section) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <button
                                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                className="w-full p-8 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {section.title}
                                    </h2>
                                </div>
                                <motion.div
                                    animate={{ rotate: activeSection === section.id ? 180 : 0 }}
                                    className="p-2 bg-emerald-100 rounded-lg"
                                >
                                    <ArrowUp className="w-6 h-6 text-emerald-600" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {activeSection === section.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 space-y-4 border-t border-emerald-50">
                                            <ul className="space-y-4">
                                                {section.content.map((item, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-start gap-3 text-gray-600 leading-relaxed"
                                                    >
                                                        <div className="w-2 h-2 bg-emerald-400 rounded-full mt-3" />
                                                        {item}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Footer CTA */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mt-20 text-center bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-xl border-2 border-emerald-100"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        سوالی درباره قوانین دارید؟
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        تیم پشتیبانی ما آماده پاسخگویی به تمام سوالات شماست
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ y: -3 }}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-3 shadow-lg"
                        >
                            <PhoneCall className="w-6 h-6" />
                            تماس با پشتیبانی
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -3 }}
                            className="bg-white text-emerald-600 px-8 py-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-200 transition-colors flex items-center gap-3 shadow-lg"
                        >
                            <BookOpenText className="w-6 h-6" />
                            مطالعه راهنما
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsPage;


// "use client";
// import { motion } from "framer-motion";
// import { Scale, Shield, BookOpen, Handshake } from "lucide-react";

// const ModernTermsPage = () => {
//     const cards = [
//         {
//             icon: <Shield className="w-8 h-8" />,
//             title: "امنیت اطلاعات",
//             content: [
//                 "رمزنگاری پیشرفته داده‌ها",
//                 "احراز هویت دو مرحله‌ای",
//                 "پشتیبان‌گیری روزانه"
//             ],
//             color: "bg-blue-100"
//         },
//         {
//             icon: <Scale className="w-8 h-8" />,
//             title: "انصاف در معاملات",
//             content: [
//                 "قیمت‌گذاری شفاف",
//                 "ضمانت بازگشت وجه",
//                 "عدم دریافت هزینه پنهان"
//             ],
//             color: "bg-emerald-100"
//         },
//         {
//             icon: <BookOpen className="w-8 h-8" />,
//             title: "شفافیت محتوا",
//             content: [
//                 "نمونه محتوای رایگان",
//                 "بررسی نظرات کاربران",
//                 "نمایش سرفصل‌ها کامل"
//             ],
//             color: "bg-amber-100"
//         },
//         {
//             icon: <Handshake className="w-8 h-8" />,
//             title: "تعهدات متقابل",
//             content: [
//                 "پشتیبانی 24 ساعته",
//                 "آپدیت‌های دوره‌ای",
//                 "گارانتی کیفیت خدمات"
//             ],
//             color: "bg-rose-100"
//         }
//     ];

//     return (
//         <div className="min-h-screen bg-white">
//             {/* هدر */}
//             <div className="bg-gradient-to-b from-blue-50 to-emerald-50 py-20 px-4">
//                 <div className="max-w-4xl mx-auto text-center">
//                     <motion.div
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         className="inline-block p-6 bg-white rounded-2xl shadow-lg mb-8"
//                     >
//                         <Scale className="w-12 h-12 text-blue-600" />
//                     </motion.div>
//                     <h1 className="text-4xl font-bold text-gray-800 mb-4">
//                         <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
//                             قوانین شفاف
//                         </span>
//                         <br />
//                         برای تجربه‌ای امن و لذت‌بخش
//                     </h1>
//                     <p className="text-gray-600 text-lg">
//                         ما برای حفظ حقوق شما و خودمان این اصول را تنظیم کرده‌ایم
//                     </p>
//                 </div>
//             </div>

//             {/* کارت‌های تعاملی */}
//             <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//                 {cards.map((card, index) => (
//                     <motion.div
//                         key={index}
//                         initial={{ y: 50, opacity: 0 }}
//                         animate={{ y: 0, opacity: 1 }}
//                         transition={{ delay: index * 0.1 }}
//                         className={`p-8 rounded-3xl ${card.color} hover:shadow-xl transition-shadow`}
//                     >
//                         <div className="flex flex-col items-center text-center">
//                             <div className="p-4 bg-white rounded-2xl mb-6 shadow-sm">
//                                 {card.icon}
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-800 mb-4">
//                                 {card.title}
//                             </h3>
//                             <ul className="space-y-3">
//                                 {card.content.map((item, i) => (
//                                     <motion.li
//                                         key={i}
//                                         whileHover={{ x: 5 }}
//                                         className="text-gray-600 flex items-center gap-2"
//                                     >
//                                         <div className="w-2 h-2 rounded-full bg-current" />
//                                         {item}
//                                     </motion.li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </motion.div>
//                 ))}
//             </div>

//             {/* بخش توافق */}
//             <div className="bg-gray-50 py-20 px-4">
//                 <div className="max-w-3xl mx-auto text-center">
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         whileInView={{ opacity: 1 }}
//                         className="inline-block p-8 bg-white rounded-3xl shadow-lg mb-8"
//                     >
//                         <Handshake className="w-16 h-16 text-emerald-600" />
//                     </motion.div>
//                     <h2 className="text-3xl font-bold text-gray-800 mb-4">
//                         با کلیک بر روی دکمه زیر
//                         <br />
//                         <span className="text-emerald-600">تمام مفاد</span> را می‌پذیرید
//                     </h2>
//                     <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         className="bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-emerald-200 transition-all"
//                     >
//                         پذیرش قوانین و ادامه
//                     </motion.button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModernTermsPage;
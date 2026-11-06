"use client";
import { Check, X, Zap, Gem, HelpCircle, ChevronRight, Code, MessageCircle, Crown, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
    const pricingPlans = [
        {
            id: "bronze",
            title: "برنزی",
            price: "۳۹,۰۰۰",
            isPopular: false,
            color: "bronze",
            icon: Code,
            features: [
                { text: "دسترسی به تمام ویدیوهای آموزشی", available: true },
                { text: "مستندات کامل زبان‌ها", available: true },
                { text: "محیط اجرای برخط مثال‌ها", available: true },
                { text: "پشتیبانی جامعه", available: true },
                { text: "هوش مصنوعی راهنمای کدنویسی", available: true },
                { text: "تمرین‌های اختصاصی", available: false },
                { text: "تعامل با استاد", available: false },
                { text: "جلسات مجازی", available: false },
            ],
        },
        {
            id: "silver",
            title: "نقره‌ای",
            price: "۷۹,۰۰۰",
            isPopular: true,
            color: "silver",
            icon: MessageCircle,
            features: [
                { text: "تمام امکانات نسخه برنزی", available: true },
                { text: "تمرین‌های اختصاصی", available: true },
                { text: "تعامل با استاد در تمرین‌ها", available: true },
                { text: "دریافت بازخورد شخصی", available: true },
                { text: "پشتیبانی VIP", available: true },
                { text: "پروژه‌های واقعی", available: false },
                { text: "راهنمایی برخط", available: false },
                { text: "جلسات مجازی", available: false },
            ],
        },
        {
            id: "gold",
            title: "طلایی",
            price: "۱۲۹,۰۰۰",
            isPopular: false,
            color: "gold",
            icon: Crown,
            features: [
                { text: "تمام امکانات نسخه نقره‌ای", available: true },
                { text: "پروژه‌های واقعی", available: true },
                { text: "راهنمایی برخط", available: true },
                { text: "جلسات مجازی هفتگی", available: true },
                { text: "برنامه‌ریزی یادگیری شخصی", available: true },
                { text: "مصاحبه‌های شغلی شبیه‌سازی", available: true },
                { text: "مشاوره حرفه‌ای", available: true },
                { text: "گواهینامه پایان دوره", available: true },
            ],
        },
    ];

    const faqs = [
        {
            question: "تفاوت پلن‌های مختلف چیست؟",
            answer: "پلن برنزی شامل محیط اجرای برخط و راهنمایی هوش مصنوعی می‌شود. پلن نقره‌ای امکان تعامل با استاد و دریافت بازخورد را فراهم می‌کند. پلن طلایی شامل جلسات مجازی، راهنمایی برخط و مشاوره حرفه‌ای است.",
        },
        {
            question: "آیا می‌توانم پلن را تغییر دهم؟",
            answer: "بله، در هر زمان می‌توانید از طریق حساب کاربری خود پلن را ارتقا یا کاهش دهید.",
        },
        {
            question: "آیا دوره‌ها به صورت آفلاین هم قابل دسترسی هستند؟",
            answer: "بله، تمام محتوای آموزشی در پنل کاربری شما همیشه قابل دسترسی است و می‌توانید آنها را دانلود کنید.",
        },
    ];

    const getColorClasses = (color) => {
        switch (color) {
            case "bronze":
                return {
                    bg: "bg-gradient-to-br from-green-200 to-emerald-300",
                    border: "border-emerald-300",
                    text: "text-green-900",
                    button: "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white",
                    iconBg: "bg-white/30",
                    iconColor: "text-emerald-600",
                    badge: "bg-emerald-500 text-white"
                };
            case "silver":
                return {
                    bg: "bg-gradient-to-br from-emerald-300 to-teal-400",
                    border: "border-teal-300",
                    text: "text-green-900",
                    button: "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white",
                    iconBg: "bg-white/30",
                    iconColor: "text-teal-700",
                    badge: "bg-teal-600 text-white"
                };
            case "gold":
                return {
                    bg: "bg-gradient-to-br from-amber-200 to-yellow-300",
                    border: "border-amber-300",
                    text: "text-green-900",
                    button: "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white",
                    iconBg: "bg-white/30",
                    iconColor: "text-amber-700",
                    badge: "bg-amber-500 text-white"
                };
            default:
                return {
                    bg: "bg-gradient-to-br from-green-200 to-emerald-300",
                    border: "border-emerald-200",
                    text: "text-green-900",
                    button: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
                    iconBg: "bg-white/30",
                    iconColor: "text-emerald-600",
                    badge: "bg-emerald-500 text-white"
                };
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="container py-24 mx-auto text-center relative overflow-hidden 2xl:px-20 px-5">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h1 className="text-5xl font-extrabold text-green-800 mb-6 drop-shadow-md">
                        <span className="bg-gradient-to-r from-green-600 to-emerald-700 text-transparent bg-clip-text">
                            مسیر یادگیری حرفه‌ای
                        </span>
                        <br />با پلن‌های اختصاصی ما
                    </h1>
                    <p className="text-xl text-green-700 max-w-2xl mx-auto leading-relaxed">
                        از پایه تا پیشرفته، با پشتیبانی اختصاصی و منابع آموزشی به‌روز
                    </p>
                </motion.div>

                {/* افکت زمینه */}
                {/* <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full  h-96 bg-gradient-to-r from-green-200/40 to-emerald-200/40 blur-3xl rounded-full"
                /> */}

                <div className="grid lg:grid-cols-3 gap-8  mx-auto my-14">
                    {pricingPlans.map((plan, index) => {
                        const colors = getColorClasses(plan.color);
                        return (
                            <motion.div
                                key={plan.title}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.2,
                                    type: "spring",
                                    stiffness: 120
                                }}
                                whileHover={{
                                    y: -15,
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                                }}
                                className={`relative p-8 rounded-3xl shadow-xl transition-all duration-300 ${colors.bg} border ${colors.border}`}
                            >
                                {/* نشان پرفروش */}
                                {plan.isPopular && (
                                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${colors.badge} px-6 py-2 rounded-full font-bold shadow-lg`}>
                                        پرفروش ترین پلن
                                    </div>
                                )}

                                {/* هدر کارت */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className={`p-4 rounded-2xl ${colors.iconBg} mb-4`}>
                                        <plan.icon className={`w-12 h-12 ${colors.iconColor}`} />
                                    </div>
                                    <h2 className={`text-3xl font-bold ${colors.text}`}>{plan.title}</h2>
                                </div>

                                {/* قیمت */}
                                <div className="mb-8 flex flex-col items-center">
                                    <span className="text-5xl font-black text-green-900">{plan.price}</span>
                                    <span className={`text-lg text-green-800`}>
                                        تومان / ماهانه
                                    </span>
                                </div>

                                {/* ویژگی‌ها */}
                                <ul className="space-y-4 mb-10 pr-2">
                                    {plan.features.map((feature) => (
                                        <motion.li
                                            key={feature.text}
                                            whileHover={{ x: 10 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div
                                                className={`p-2 rounded-lg mt-1 ${feature.available
                                                    ? "bg-green-500/20 text-green-600"
                                                    : "bg-gray-200 text-gray-400"
                                                    }`}
                                            >
                                                {feature.available ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <X className="w-5 h-5" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-md ${colors.text} ${feature.available ? "opacity-100" : "opacity-70"
                                                    }`}
                                            >
                                                {feature.text}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>

                                {/* دکمه */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${colors.button}`}
                                >
                                    {plan.id === "gold" ? "شروع طلایی" : "شروع یادگیری"}
                                    <ChevronLeft className="w-5 h-5 inline-block mr-2" />
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* مقایسه پلن‌ها */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-28 bg-white/90 rounded-3xl shadow-xl p-8  border border-green-100 backdrop-blur-sm"
                >
                    <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
                        مقایسه کامل پلن‌ها
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center">
                            <thead>
                                <tr className="border-b-2 border-green-200">
                                    <th className="pb-4 text-green-700 font-medium">ویژگی</th>
                                    {pricingPlans.map(plan => (
                                        <th key={plan.id} className="pb-4 text-lg font-bold text-green-800">
                                            {plan.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-green-100">
                                    <td className="py-4 text-green-700">محیط اجرای برخط</td>
                                    {pricingPlans.map(plan => (
                                        <td key={plan.id} className="py-4">
                                            {plan.features[2].available ?
                                                <Check className="w-6 h-6 text-green-500 mx-auto" /> :
                                                <X className="w-6 h-6 text-red-400 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-green-100 bg-green-50/50">
                                    <td className="py-4 text-green-700">هوش مصنوعی راهنما</td>
                                    {pricingPlans.map(plan => (
                                        <td key={plan.id} className="py-4">
                                            {plan.features[4].available ?
                                                <Check className="w-6 h-6 text-green-500 mx-auto" /> :
                                                <X className="w-6 h-6 text-red-400 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-green-100">
                                    <td className="py-4 text-green-700">تعامل با استاد</td>
                                    {pricingPlans.map(plan => (
                                        <td key={plan.id} className="py-4">
                                            {plan.features[6]?.available ?
                                                <Check className="w-6 h-6 text-green-500 mx-auto" /> :
                                                <X className="w-6 h-6 text-red-400 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-green-100 bg-green-50/50">
                                    <td className="py-4 text-green-700">جلسات مجازی</td>
                                    {pricingPlans.map(plan => (
                                        <td key={plan.id} className="py-4">
                                            {plan.features[7]?.available ?
                                                <Check className="w-6 h-6 text-green-500 mx-auto" /> :
                                                <X className="w-6 h-6 text-red-400 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b border-green-100">
                                    <td className="py-4 text-green-700">پشتیبانی VIP</td>
                                    {pricingPlans.map(plan => (
                                        <td key={plan.id} className="py-4">
                                            {plan.features[4]?.text === "پشتیبانی VIP" && plan.features[4]?.available ?
                                                <Check className="w-6 h-6 text-green-500 mx-auto" /> :
                                                <X className="w-6 h-6 text-red-400 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* سوالات متداول */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-4xl font-bold text-center text-green-800 mt-28 mb-16 flex items-center justify-center gap-3"
                >
                    <HelpCircle className="w-10 h-10 text-emerald-500" />
                    سوالات متداول
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10  mx-auto">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.question}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer p-6 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-emerald-100 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                    <HelpCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-green-800">
                                    {faq.question}
                                </h3>
                            </div>
                            <p className="mt-4 pl-12 text-green-700 leading-relaxed">
                                {faq.answer}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="py-16 bg-gradient-to-r from-emerald-500 to-green-600">
                <div className="container mx-auto text-center px-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            آماده شروع سفر یادگیری خود هستید؟
                        </h2>
                        <p className="text-xl text-emerald-100 mb-10">
                            همین امروز به جامعه برنامه‌نویسان ما بپیوندید
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-emerald-700 font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:bg-emerald-50 transition-colors"
                        >
                            انتخاب پلن مناسب
                            <ChevronLeft className="w-5 h-5 inline-block mr-2" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
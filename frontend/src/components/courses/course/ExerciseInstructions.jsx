// components/ExerciseInstructions.js
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, UploadCloud, FileText, Clock, AlertTriangle, Zap } from "lucide-react";

const InstructionItem = ({ icon, title, description }) => {
    const IconComponent = {
        study: BookOpen,
        upload: UploadCloud,
        file: FileText,
        time: Clock,
        alert: AlertTriangle,
        start: Zap
    }[icon];

    return (
        <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:to-white transition-all cursor-pointer shadow-sm hover:shadow-md border border-gray-100 hover:border-emerald-100"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                    <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <p className="text-gray-600 mt-2 leading-relaxed">{description}</p>
                </div>
                <Zap className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 mt-1" />
            </div>

            {/* Hover Effect Line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 opacity-0 group-hover:opacity-100"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.li>
    );
};

const ExerciseInstructions = () => {
    const instructions = [
        {
            icon: "study",
            title: "مطالعه دقیق تمرین",
            description: "صورت تمرین را با دقت مطالعه کرده و تمام الزامات را بررسی کنید"
        },
        {
            icon: "upload",
            title: "آپلود فایل",
            description: "می‌توانید فایل کد (تا ۵MB) با فرمت‌های zip, js, py, java آپلود کنید"
        },
        {
            icon: "alert",
            title: "توجه مهم",
            description: "پس از ارسال پاسخ، امکان ویرایش وجود نخواهد داشت"
        },
        {
            icon: "time",
            title: "مدیریت زمان",
            description: "مهلت انجام تمرین را در قسمت اطلاعات تمرین مشاهده کنید"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />

            <div className="p-8 space-y-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-2"
                >
                    <Zap className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        راهنمای جامع تمرینات
                    </h2>
                    <p className="text-gray-600">برای موفقیت در تمرینات این دستورالعمل‌ها را دنبال کنید</p>
                </motion.div>

                <AnimatePresence>
                    <motion.ul
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {instructions.map((item, index) => (
                            <InstructionItem
                                key={index}
                                {...item}
                            />
                        ))}
                    </motion.ul>
                </AnimatePresence>

                {/* Floating Particles */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
                            initial={{
                                x: Math.random() * 100 - 50 + "%",
                                y: Math.random() * 100 - 50 + "%",
                                scale: 0
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                rotate: [0, 360]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ExerciseInstructions;
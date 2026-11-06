import { motion } from "framer-motion";
import { Leaf, Code, Clock, CheckCircle, ArrowRight } from "lucide-react";
import TechSelector from "./TechSelector";

const StartScreen = ({ onStart, history, selectedTech, setSelectedTech }) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-4xl mx-auto px-4 py-5 "
        >
            <div className="text-center mb-12">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-block p-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-xl mb-8 shadow-emerald-100/50"
                >
                    <Leaf className="w-12 h-12 text-white fill-current" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
                >
                    <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                        سنجش سطح مهارت‌های فنی
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
                >
                    دانش خود را در حوزه‌های مختلف ارزیابی کنید و
                    <span className="text-emerald-600 font-medium"> نقشه راه یادگیری</span> شخصی‌سازی شده دریافت نمایید
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-emerald-50 bg-gradient-to-br from-white to-emerald-50"
            >
                <TechSelector
                    selectedTech={selectedTech}
                    setSelectedTech={setSelectedTech}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
            >
                <motion.button
                    whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStart(selectedTech)}
                    disabled={!selectedTech.length}
                    className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-emerald-200/50 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <span className="group-hover:translate-x-1 transition-transform">
                        شروع ارزیابی
                    </span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default StartScreen;
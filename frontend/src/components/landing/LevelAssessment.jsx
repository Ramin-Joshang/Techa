"use client"
import { motion } from 'framer-motion'
import { Rocket, BrainCircuit, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

const LevelAssessment = () => {


    return (
        <section className="relative min-h-[600px] bg-gradient-to-br from-green-50 to-emerald-50 py-20 overflow-hidden mt-20">
            {/* Floating background elements */}
            <div
                className="absolute inset-0 opacity-20"

            >
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-24 h-24 border-4 border-emerald-200 rounded-full"
                        initial={{
                            x: Math.random() * 100 - 50 + '%',
                            y: Math.random() * 100 - 50 + '%',
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50 + '%'],
                            y: [0, Math.random() * 100 - 50 + '%'],
                            transition: {
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                repeatType: 'mirror'
                            }
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent mb-6">
                        مسیر یادگیری خودت رو انتخاب کن
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        چه تازه میخوای شروع کنی چه تجربه داری، مسیر درست رو بهت نشون میدیم!
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Start from Scratch Card */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full" />
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                <Rocket className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                شروع از صفر مطلق
                            </h3>
                            <p className="text-gray-600 mb-6">
                                از مفاهیم پایه تا سطح حرفه‌ای، قدم به قدم با پروژه‌های واقعی
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'آموزش گام به گام',
                                    'پروژه‌های عملی',
                                    'پشتیبانی دائمی',
                                    'جامعه یادگیری'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-emerald-700">
                                        <Zap className="w-5 h-5 mr-2 text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href='/front-boot-camp'>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                                >
                                    شروع مسیر مبتدی
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Smart Assessment Card */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-emerald-600 rounded-2xl p-8 shadow-lg relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                <BrainCircuit className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                تعیین سطح هوشمند
                            </h3>
                            <p className="text-emerald-100 mb-6">
                                آزمون تعاملی برای تشخیص سطح فعلی و پیشنهاد مسیر شخصی‌سازی شده
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'سوالات هوشمند',
                                    'تحلیل پیشرفته',
                                    'پیشنهاد شخصی',
                                    'صرفه‌جویی در زمان'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-emerald-50">
                                        <Zap className="w-5 h-5 mr-2 text-emerald-200" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/account/level-assessment">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-white text-emerald-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                                >
                                    شروع آزمون تعیین سطح
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12 text-gray-600 flex items-center justify-center gap-2 text-sm sm:text-lg"
                >
                    <span className="h-px w-12 sm:w-full bg-emerald-200" />
                    <span className='min-w-fit'>
                        هنوز مطمئن نیستی؟
                    </span>
                    <button className="text-emerald-600 font-semibold hover:underline min-w-fit">
                        راهنمای انتخاب مسیر
                    </button>
                    <span className="h-px w-12 sm:w-full bg-emerald-200" />
                </motion.div>
            </div>
        </section>
    )
}

export default LevelAssessment
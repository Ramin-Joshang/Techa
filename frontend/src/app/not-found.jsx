"use client"
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RiHome3Line, RiLeafLine, RiGhostLine, RiArrowRightLine } from 'react-icons/ri';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen py-20 flex items-center relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto text-center"
                >
                    {/* Main Card */}
                    <motion.div
                        className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-100 
              hover:shadow-3xl transition-shadow duration-300 group"
                    >
                        {/* Floating 404 Text */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.05 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -top-20 left-1/2 -translate-x-1/2 text-[20rem] font-dana-black text-emerald-700 pointer-events-none"
                        >
                            404
                        </motion.div>

                        {/* Animated Illustration */}
                        <motion.div
                            animate={{
                                y: [-15, 15, -15],
                                rotate: [-2, 2, -2]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-64 h-64 mx-auto mb-10"
                        >
                            <Image
                                src="/images/404.png"
                                alt="404 Illustration"
                                fill
                                className="drop-shadow-lg"
                                priority
                            />
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                            >
                                <RiGhostLine className="w-24 h-24 text-emerald-600/20" />
                            </motion.div>
                        </motion.div>

                        {/* Content Section */}
                        <div className="relative space-y-6 md:space-y-8">
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl md:text-6xl font-dana-bold text-emerald-800 flex flex-col items-center gap-4"
                            >
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-full text-2xl md:text-3xl"
                                >
                                    خطای ۴۰۴
                                </motion.span>
                                <span className="flex items-center gap-3">
                                    صفحه گم شد!
                                    <RiLeafLine className="w-10 h-10 text-emerald-600 animate-spin-slow" />
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed md:leading-loose"
                            >
                                به نظر میرسه در جستجوی چیزی هستید که وجود نداره یا ممکنه به مکان دیگری منتقل شده باشه.
                                <br className="hidden md:block" />
                                پیشنهاد میکنیم مسیر خودتون رو بررسی کنید یا از دکمه زیر برای بازگشت استفاده نمایید.
                            </motion.p>

                            {/* Animated Button */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-block"
                            >
                                <Link
                                    href="/"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl inline-flex items-center gap-3 
                    transition-all duration-300 group shadow-lg hover:shadow-emerald-200/50"
                                >
                                    <RiHome3Line className="w-8 h-8 transition-transform group-hover:-translate-x-1" />
                                    <span className="font-dana-medium text-xl">بازگشت به خانه</span>
                                    <RiArrowRightLine className="w-8 h-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 
                    transition-all duration-300" />
                                </Link>
                            </motion.div>
                        </div>

                        {/* Decorative Elements */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-48 -left-48 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute -bottom-48 -right-48 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"
                        />
                    </motion.div>

                    {/* Animated Leaves */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 left-10 opacity-20 md:opacity-30 w-24 h-24 md:w-32 md:h-32"
                    >
                        <RiLeafLine className="w-full h-full text-emerald-600" />
                    </motion.div>

                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-1/4 right-10 opacity-20 md:opacity-30 w-32 h-32 md:w-48 md:h-48"
                    >
                        <RiLeafLine className="w-full h-full text-emerald-600" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Animated Noise Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.03 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-[url('/images/grain.png')] mix-blend-overlay pointer-events-none"
            />
        </div>
    );
};

export default NotFoundPage;
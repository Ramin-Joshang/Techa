'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Rocket, Code2, Code, Gem, Trophy, Medal } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css';
import 'swiper/css/pagination';

const Poster = () => {
    const [isMounted, setIsMounted] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [particlePositions, setParticlePositions] = useState([]);

    // ۴ رفرنس برای ۴ اسلاید
    const refs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ]

    const inViews = [
        useInView(refs[0], { margin: '-100px' }),
        useInView(refs[1], { margin: '-100px' }),
        useInView(refs[2], { margin: '-100px' }),
        useInView(refs[3], { margin: '-100px' })
    ]

    useEffect(() => {
        setIsMounted(true);
        // Generate random positions for particles
        const positions = Array.from({ length: 20 }, () => ({
            x: Math.random() * 1000,
            y: Math.random() * 500
        }));
        setParticlePositions(positions);
    }, [])

    const slides = [
        {
            title: 'مگاپکیج الماس 💎',
            badge: 'صفر تا استخدام',
            description: 'کامل‌ترین مسیر یادگیری: تخصص فرانت‌اند + تجربه کارآموزی + تسلط بر فریلنسری',
            link: "/packages/diamond-path-zero-to-hire", // لینک را متناسب با روتر خود اصلاح کنید
            buttonText: 'خرید مگاپکیج الماس',
            icon: <Gem className="w-5 h-5" />
        },
        {
            title: 'پکیج طلایی 🌟',
            badge: 'ورود به بازار کار',
            description: 'پلی به سوی درآمدزایی: دوره شبیه‌سازی کارآموزی در کنار آموزش صفر تا صد فریلنسری',
            link: "/packages/golden-path-internship-freelance",
            buttonText: 'شروع مسیر طلایی',
            icon: <Trophy className="w-5 h-5" />
        },
        {
            title: 'پکیج نقره‌ای 🥈',
            badge: 'تخصص و تجربه',
            description: 'تبدیل شدن به یک مهندس واقعی: آموزش جامع فرانت‌اند همراه با چالش‌های دوره کارآموزی',
            link: "/packages/silver-path-frontend-internship",
            buttonText: 'کسب تخصص نقره‌ای',
            icon: <Medal className="w-5 h-5" />
        },
        {
            title: 'مستندات آموزشی تعاملی',
            badge: 'اجرای زنده کد',
            description: 'دسترسی به مستندات جامع با قابلیت اجرای کد در ادیتور آنلاین و مثال‌های کاربردی',
            link: "/docs",
            buttonText: 'مشاهده مستندات',
            icon: <Code className="w-5 h-5" />
        },
    ];

    return (
        <section className="mt-20 md:mt-60 mb-20" dir="rtl">
            <div className="container mx-auto px-5 xl:px-20">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    autoplay={{ delay: 6000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    spaceBetween={50}
                    slidesPerView={1}
                    loop={true}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="h-[320px] relative overflow-hidden rounded-3xl"
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={index}>
                            <div ref={refs[index]} className="h-full w-full relative">
                                {/* افکت پس زمینه */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={inViews[index] ? { opacity: 1 } : {}}
                                    transition={{ duration: 1 }}
                                    className="absolute inset-0 bg-gradient-to-br from-[#042A1B] via-[#0A3323] to-[#042A1B] opacity-95 rounded-3xl"
                                />

                                {/* محتوای اصلی */}
                                <div className="relative z-10 h-full flex items-center justify-center">
                                    <div className="container mx-auto px-4">
                                        <motion.div
                                            key={activeIndex}
                                            initial={{ y: '50%', opacity: 0 }}
                                            animate={inViews[index] ? { y: '0%', opacity: 1 } : {}}
                                            transition={{ duration: 1 }}
                                            className="text-center space-y-8"
                                        >
                                            {/* عنوان */}
                                            <AnimatePresence mode='wait'>
                                                {isMounted && (
                                                    <motion.h1
                                                        key={`title-${activeIndex}`}
                                                        initial={{ opacity: 0, y: 50 }}
                                                        animate={inViews[index] ? { opacity: 1, y: 0 } : {}}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#F6DC66] flex flex-wrap justify-center items-center gap-4"
                                                    >
                                                        <span className="inline-block overflow-hidden">
                                                            <motion.span
                                                                initial={{ y: '100%' }}
                                                                animate={inViews[index] ? { y: 0 } : {}}
                                                                transition={{ duration: 1, delay: 0.5 }}
                                                                className="block"
                                                            >
                                                                {slide.title}
                                                            </motion.span>
                                                        </span>
                                                        <span className="inline-block overflow-hidden">
                                                            <motion.span
                                                                initial={{ y: '100%' }}
                                                                animate={inViews[index] ? { y: 0 } : {}}
                                                                transition={{ duration: 1, delay: 0.8 }}
                                                                className="block bg-[#7AE36A] text-[#042A1B] text-lg md:text-2xl px-4 py-2 rounded-xl"
                                                            >
                                                                {slide.badge}
                                                            </motion.span>
                                                        </span>
                                                    </motion.h1>
                                                )}
                                            </AnimatePresence>

                                            {/* توضیحات */}
                                            <motion.div
                                                key={`desc-${activeIndex}`}
                                                initial={{ opacity: 0 }}
                                                animate={inViews[index] ? { opacity: 1 } : {}}
                                                transition={{ delay: 1.2 }}
                                                className="text-lg md:text-xl text-white/90 mb-5 max-w-3xl mx-auto"
                                            >
                                                <div className="overflow-hidden">
                                                    <motion.span
                                                        initial={{ y: '100%' }}
                                                        animate={inViews[index] ? { y: 0 } : {}}
                                                        transition={{ duration: 0.8, delay: 1.6 }}
                                                        className="text-[#7AE36A] font-bold block leading-relaxed"
                                                    >
                                                        {slide.description}
                                                    </motion.span>
                                                </div>
                                            </motion.div>

                                            {/* دکمه‌ها */}
                                            <motion.div
                                                key={`buttons-${activeIndex}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={inViews[index] ? { opacity: 1, scale: 1 } : {}}
                                                transition={{ delay: 2, type: 'spring' }}
                                                className="flex flex-col sm:flex-row gap-4 justify-center"
                                            >
                                                <Link href={slide.link} passHref>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-8 py-3.5 bg-[#7AE36A] text-[#042A1B] rounded-xl font-bold relative overflow-hidden group shine-effect shadow-lg shadow-[#7AE36A]/20"
                                                    >
                                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                                            {slide.icon}
                                                            {slide.buttonText}
                                                        </span>
                                                    </motion.button>
                                                </Link>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* افکت کدنویسی پس‌زمینه */}
                                <motion.div
                                    key={`code-${activeIndex}`}
                                    initial={{ opacity: 0 }}
                                    animate={inViews[index] ? { opacity: 1 } : {}}
                                    transition={{ duration: 1 }}
                                    className="absolute inset-0 z-0 pointer-events-none"
                                >
                                    <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
                                        animate={inViews[index] ? { rotate: [0, 360], scale: [1, 1.2] } : {}}
                                        transition={{
                                            duration: 30,
                                            repeat: Infinity,
                                            ease: 'linear'
                                        }}
                                    >
                                        <Code2 className="absolute text-[#7AE36A20] w-32 h-32"
                                            style={{ top: '10%', left: '20%' }} />
                                        <Code2 className="absolute text-[#F6DC6620] w-28 h-28"
                                            style={{ top: '70%', right: '15%' }} />
                                        <Code2 className="absolute text-[#7AE36A20] w-24 h-24"
                                            style={{ bottom: '20%', left: '40%' }} />
                                    </motion.div>
                                </motion.div>

                                {/* افکت پارتیکل */}
                                <motion.div
                                    key={`particles-${activeIndex}`}
                                    initial={{ opacity: 0 }}
                                    animate={inViews[index] ? { opacity: 1 } : {}}
                                    transition={{ duration: 1 }}
                                    className="absolute inset-0 z-0 overflow-hidden"
                                >
                                    {particlePositions.map((pos, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-[#7AE36A] rounded-full shadow-glow"
                                            initial={{
                                                x: pos.x,
                                                y: pos.y
                                            }}
                                            animate={inViews[index] ? {
                                                scale: [0.5, 1, 0.5],
                                                opacity: [0.3, 1, 0.3]
                                            } : {}}
                                            transition={{
                                                duration: 2 + Math.random() * 3,
                                                repeat: Infinity,
                                                delay: Math.random() * 2
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        </SwiperSlide>
                    ))}

                    {/* استایل‌های کاستوم برای Pagination */}
                    <style jsx global>{`
                        .swiper-pagination-bullet {
                            background: #7AE36A !important;
                            bottom: 20px;
                            opacity: 0.3;
                            transition: all 0.3s ease;
                        }
                        .swiper-pagination-bullet-active {
                            opacity: 1 !important;
                            width: 24px !important;
                            border-radius: 12px !important;
                        }
                    `}</style>
                </Swiper>
            </div>
        </section>
    )
}

export default Poster

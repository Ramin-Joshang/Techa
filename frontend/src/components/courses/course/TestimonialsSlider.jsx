'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star } from 'lucide-react'

const TestimonialsSlider = ({ testimonials }) => {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full blur-3xl translate-y-1/2" />

            <div className="relative">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent"
                    >
                        تجربه شرکت کنندگان
                    </motion.h2>
                    <p className="text-lg text-gray-600">آنچه دیگران درباره ما میگویند</p>
                </div>

                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{ delay: 5000, disableOnInteraction: false }} // Autoplay settings
                    pagination={{
                        clickable: true,
                        bulletClass: 'swiper-pagination-bullet bg-emerald-500/80',
                        bulletActiveClass: '!bg-emerald-500 !w-6 !rounded-full'
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                    }}
                    className="!pb-14"
                >
                    {testimonials.map((testimonial, index) => (
                        <SwiperSlide key={index}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -10 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-100/50 h-full mx-4"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="relative overflow-hidden rounded-full border-2 border-emerald-500/20 p-1"
                                    >
                                        <Image
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            width={64}
                                            height={64}
                                            className="rounded-full object-cover"
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL="data:image/svg+xml;base64,..."
                                        />
                                    </motion.div>
                                    <div className="text-right">
                                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                                        <p className="text-emerald-600 font-medium">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6">{testimonial.text}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                fill={i < testimonial.rating ? '#10b981' : 'transparent'}
                                                strokeWidth={1.5}
                                                className={`w-6 h-6 ${i < testimonial.rating ? 'text-emerald-500' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <svg className="w-12 h-12 text-emerald-100" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M18 14c0-4-6-10.8-6-10.8s-1.33 1.51-2.73 3.52l8.59 8.59c.09-.42.14-.86.14-1.31zm-.77 4.57L5.43 6.77C4.14 7.83 3 9.21 3 11c0 3.31 2.69 6 6 6c1.52 0 2.9-.57 3.96-1.5l1.08 1.08l-1.42 1.42L7.62 21c1.57.7 3.3 1 5.03 1c6.07 0 11-4.93 11-11c0-1.34-.25-2.65-.72-3.87l-1.42 1.42c.27.67.43 1.39.43 2.15c0 3.18-2.45 6.92-7.34 11.23l-2.85-2.85l.6-.63C16.46 18.01 17 16.54 17 15c0-1.74-1.17-3.62-2.58-5.47L12 10.8s-1.5 1.7-2.6 3.33c1.26.97 2.1 2.07 2.1 3.37c0 1.35-1 2.5-2.5 2.5S6 18.85 6 17.5H4c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.24-1.66-4.03-3.43-5.15l.53-.79C12.62 11.52 14 13.07 14 14c0 1.1-.9 2-2 2s-2-.9-2-2c0-.64.31-1.23.82-1.61l-.78-1.15C9.5 10.97 9 11.95 9 13c0 1.66 1.34 3 3 3s3-1.34 3-3c0-.88-.38-1.7-1.03-2.27l1.43-1.43C17.22 10.38 18 12.6 18 14c0 1.57-.5 3.03-1.36 4.24l1.43 1.43c1.03-1.45 1.64-3.2 1.64-5.07c0-1.03-.16-2.03-.46-2.98l1.45-1.45c.43 1.13.67 2.34.67 3.58c0 5.74-4.44 10.42-10 10.42c-2.15 0-4.16-.55-5.93-1.5l-1.9 1.9l1.41 1.41L17.19 20l1.42-1.42L3 3l1.41-1.41l19.8 19.8l-1.41 1.41l-5.61-5.61z" />
                                    </svg>
                                </div>
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
}

export default TestimonialsSlider;
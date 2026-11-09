"use client";
import React, { useEffect, useState } from 'react';
import { LeftAngleIcon, RightAngleIcon } from '../Icons/Icons';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion } from "framer-motion"
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Navigation } from 'swiper/modules';
import { FiArrowLeft, FiClock, FiUsers } from 'react-icons/fi';

const LastCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch("https://pool.techa.ir/api/Course");
                const data = await response.json();

                if (data.IsSuccess) {
                    const enrichedCourses = data.Data.filter(course => !course.Disabled).map(course => ({
                        ...course,
                        Students: Math.floor(Math.random() * 5000),
                        Rating: (Math.random() * 1 + 4).toFixed(1),
                        Comments: Math.floor(Math.random() * 200),
                        Level: ['مبتدی', 'متوسط', 'پیشرفته'][Math.floor(Math.random() * 3)],
                        Duration: Math.floor(Math.random() * 20) + 5
                    }));
                    setCourses(enrichedCourses);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);
    const images = [
        "/images/sql.webp",
        "/images/sql-2.jpg",
        "/images/React.jpg",
        "/images/htmlcss.jpeg",
        "/images/tailwind.jpg",
        "/images/js.png",
    ];

    const truncateDescription = (description) => {
        const div = document.createElement("div");
        div.innerHTML = description || "توضیحات در دسترس نیست.";
        const text = div.innerText;
        return text.split(" ").slice(0, 20).join(" ") + "...";
    };

    return (
        <div className="mt-20">
            <div className="container mx-auto px-5 xl:px-20">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                    <div className="text-[#042A1B] text-center md:text-start">
                        <h1 className="font-extrabold text-4xl ">
                            مهارت های ویژه
                            <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">کارآموزان</span>
                        </h1>
                        <p className="text-lg font-normal mt-3">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ</p>
                    </div>
                    <div className="hidden md:flex items-center gap-5">
                        <span className="custom-prev border border-[#042A1B4D] h-14 w-14 rounded-full flex justify-center items-center cursor-pointer hover:border-[#042A1B]">
                            <LeftAngleIcon />
                        </span>
                        <span className="custom-next border border-[#042A1B4D] h-14 w-14 rounded-full flex justify-center items-center cursor-pointer hover:border-[#042A1B]">
                            <RightAngleIcon />
                        </span>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div>
                        <Swiper
                            style={{
                                padding: '50px 0px',
                            }}
                            slidesPerView={1}
                            spaceBetween={50}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            loop
                            breakpoints={{
                                600: {
                                    slidesPerView: 2,
                                    spaceBetween: 20,
                                },
                                992: {
                                    slidesPerView: 2,
                                    spaceBetween: 40,
                                },
                                1024: {
                                    slidesPerView: 3,
                                    spaceBetween: 30,
                                },
                                1280: {
                                    slidesPerView: 4,
                                    spaceBetween: 40,
                                },
                            }}
                            navigation={{
                                nextEl: '.custom-next',
                                prevEl: '.custom-prev',
                            }}
                            modules={[Autoplay, Navigation]}
                            className="mySwiper"
                        >
                            {courses.map((course, index) => {
                                return (
                                    <SwiperSlide key={course.Id} className="swiper-slide">
                                        <CourseCard
                                            key={course.Id}
                                            course={course}
                                            image={images[index % images.length]}
                                        />
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                )}
            </div>
        </div>
    );
};


const CourseCard = ({ course, image }) => (
    <motion.div
        className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col relative"
        whileHover={{ y: -5 }}
    >
        {/* Course Image */}
        <div className="relative aspect-video overflow-hidden">
            <motion.div
                className="relative h-full w-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
            >
                <Image
                    src={image}
                    alt={course.Title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Top Badges */}
            <div className="absolute bottom-4 left-3 right-3">
                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center justify-between w-full gap-2">
                        <motion.div
                            className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm text-white"
                            whileHover={{ scale: 1.05 }}
                        >
                            <FiClock className="w-4 h-4" />
                            <span className="text-xs">{course.Duration} ساعت</span>
                        </motion.div>

                        <motion.div
                            className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm text-white"
                            whileHover={{ scale: 1.05 }}
                        >
                            <FiUsers className="w-4 h-4" />
                            <span className="text-xs">{course.Students.toLocaleString()} نفر</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>

        {/* Course Content */}
        <div className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <Link
                    href={`/courses/${course.Id}`}
                    className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors relative group"
                >
                    <span className="relative">
                        دوره {course.Title} پروژه محور
                        <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-emerald-500 transition-all group-hover:w-full" />
                    </span>
                </Link>


            </div>

            {/* Instructor Section */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                    <Image
                        width={32}
                        height={32}
                        src="/images/teacher.jpeg"
                        alt="رامین جوشنگ"
                        className="object-cover rounded-full"

                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <span className="text-sm text-gray-500">
                    مدرس: {course.Instructor || 'رامین جوشنگ'}
                </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                این دوره به شما کمک می‌کند تا مهارت‌های خود را به سطح حرفه‌ای برسانید و در پروژه‌های واقعی بدرخشید؛ همچنین از تجربیات اساتید مجرب بهره‌مند شوید.
            </p>

            {/* Footer Section */}
            <div className="flex items-center justify-between mt-auto">
                {/* Price Tag */}
                <div className={`flex items-center ${course.Price > 0 ? 'text-emerald-600' : 'text-amber-500'
                    }`}>
                    <div className="relative">
                        {course.Price > 0 && (
                            <div className="absolute -top-3 -right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-[10px]">
                                20% تخفیف
                            </div>
                        )}
                        <span className="font-bold text-lg">
                            {course.Price > -1 ?
                                `${(Math.floor(Math.random() * 8) * 500000 + 1000000).toLocaleString('fa-IR')} تومان` :
                                'رایگان'}
                        </span>
                    </div>
                </div>

                {/* CTA Button */}
                <motion.div whileHover={{ x: -4 }}>
                    <Link
                        href={`/courses/${course.Id}`}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-all"
                    >
                        <span className="text-sm">مشاهده دوره</span>
                        <FiArrowLeft className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>

        {/* Best Seller Ribbon */}
        {course.isBestSeller && (
            <div className="absolute top-4 left-[-2rem] w-[8rem] bg-amber-500 text-white text-xs font-bold text-center py-1 transform rotate-[-45deg] z-10 shadow-md">
                پرفروش ترین
            </div>
        )}
    </motion.div>
);

export default LastCourses;

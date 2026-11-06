"use client";
import React, { useEffect, useState } from 'react';
import { LeftAngleIcon, RightAngleIcon } from '../Icons/Icons';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion } from "framer-motion";
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Navigation } from 'swiper/modules';
import { FiArrowLeft, FiClock, FiUsers, FiPackage } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackages } from '../../features/main/packages/packagesActions';

const Packages = () => {
    // const [packages, setPackages] = useState([]);
    // const [loading, setLoading] = useState(true);
    const { loading, packages, error } = useSelector(state => state.packages)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchPackages({ "Take": 8 }))
    }, [dispatch]);

    console.log(packages)


    return (
        <div className="mt-20">
            <div className="container mx-auto px-5 xl:px-20">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                    <div className="text-[#042A1B] text-center md:text-start">
                        <h1 className="font-extrabold text-4xl ">
                            پکیج های ویژه
                            <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block mr-2">آموزشی</span>
                        </h1>
                        <p className="text-lg font-normal mt-3">مسیر یادگیری خود را با پکیج‌های جامع ما کامل کنید</p>
                    </div>
                    <div className="hidden md:flex items-center gap-5">
                        <span className="pkg-custom-prev border border-[#042A1B4D] h-14 w-14 rounded-full flex justify-center items-center cursor-pointer hover:border-[#042A1B]">
                            <LeftAngleIcon />
                        </span>
                        <span className="pkg-custom-next border border-[#042A1B4D] h-14 w-14 rounded-full flex justify-center items-center cursor-pointer hover:border-[#042A1B]">
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
                                delay: 3500,
                                disableOnInteraction: false,
                            }}
                            loop
                            breakpoints={{
                                600: { slidesPerView: 2, spaceBetween: 20 },
                                992: { slidesPerView: 2, spaceBetween: 40 },
                                1024: { slidesPerView: 3, spaceBetween: 30 },
                                1280: { slidesPerView: 4, spaceBetween: 40 },
                            }}
                            navigation={{
                                nextEl: '.pkg-custom-next',
                                prevEl: '.pkg-custom-prev',
                            }}
                            modules={[Autoplay, Navigation]}
                            className="mySwiper"
                        >
                            {packages.map((pkg, index) => {
                                return (
                                    <SwiperSlide key={pkg.Id} className="swiper-slide">
                                        <PackageCard
                                            key={pkg.Id}
                                            pkg={pkg}
                                        />
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                )}
                <div className="text-center mb-10">
                    <Link href={`/packages`} className="px-8 w-fit py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                        مشاهده تمام پکیج‌ها
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const PackageCard = ({ pkg }) => {
    // محاسبه وضعیت تخفیف
    const hasDiscount = pkg.DiscountPrice !== null && pkg.DiscountPrice >= 0 && pkg.DiscountPrice < pkg.Price;

    // محاسبه درصد تخفیف در صورت وجود
    const discountPercentage = hasDiscount
        ? Math.round(((pkg.Price - pkg.DiscountPrice) / pkg.Price) * 100)
        : 0;

    return (
        <motion.div
            className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col relative"
            whileHover={{ y: -5 }}
        >
            {/* Package Image */}
            <div className="relative aspect-video overflow-hidden">
                <motion.div
                    className="relative h-full w-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                >
                    <Image
                        src={pkg.ImageUrl}
                        alt={pkg.Title}
                        fill
                        className="object-left-bottom group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </motion.div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute bottom-4 left-3 right-3">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center justify-between w-full gap-2">
                            <motion.div
                                className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm text-white"
                                whileHover={{ scale: 1.05 }}
                            >
                                <FiPackage className="w-4 h-4" />
                                <span className="text-xs">پکیج جامع</span>
                            </motion.div>

                            <motion.div
                                className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm text-white"
                                whileHover={{ scale: 1.05 }}
                            >
                                <FiUsers className="w-4 h-4" />
                                <span className="text-xs">{pkg.Students?.toLocaleString('fa-IR')} نفر</span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Content */}
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <Link
                        href={`/packages/${pkg.Slug}`}
                        className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors relative group"
                    >
                        <span className="relative">
                            {pkg.Title.split("(")[0]}
                            <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-emerald-500 transition-all group-hover:w-full" />
                        </span>
                    </Link>
                </div>

                {/* Description (Mapped exactly to the API description) */}
                <div
                    className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed text-justify"
                    dangerouslySetInnerHTML={{ __html: pkg.ShortDescription || 'توضیحاتی برای این پکیج ثبت نشده است.' }}
                />

                {/* Footer Section / Pricing */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">

                    {/* Price Logic */}
                    <div className="flex flex-col">
                        {pkg.Price === 0 ? (
                            <span className="font-bold text-lg text-emerald-600">رایگان</span>
                        ) : (
                            <div className="flex flex-col relative">
                                {hasDiscount ? (
                                    <>
                                        {/* نشان درصد تخفیف */}
                                        <div className="absolute -top-6 -right-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                                            {discountPercentage}% تخفیف
                                        </div>
                                        {/* قیمت اصلی خط خورده */}
                                        <span className="text-xs text-gray-400 line-through">
                                            {pkg.Price?.toLocaleString('fa-IR')}
                                        </span>
                                        {/* قیمت با تخفیف */}
                                        <span className="font-bold text-lg text-emerald-600">
                                            {pkg.DiscountPrice?.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span>
                                        </span>
                                    </>
                                ) : (
                                    // نمایش فقط قیمت اصلی در صورت نداشتن تخفیف
                                    <span className="font-bold text-lg text-emerald-600 mt-2">
                                        {pkg.Price?.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <motion.div whileHover={{ x: -4 }}>
                        <Link
                            href={`/packages/${pkg.Slug}`}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-all"
                        >
                            <span className="text-sm">مشاهده پکیج</span>
                            <FiArrowLeft className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Best Seller Ribbon */}
            {pkg.isBestSeller && (
                <div className="absolute top-4 left-[-2.5rem] w-[9rem] bg-amber-500 text-white text-xs font-bold text-center py-1.5 transform rotate-[-45deg] z-10 shadow-md">
                    پرفروش ترین
                </div>
            )}
        </motion.div>
    );
};

export default Packages;

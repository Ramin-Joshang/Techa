"use client";
import React, { useEffect, useState } from 'react';
import { LeftAngleIcon, RightAngleIcon } from '../Icons/Icons';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Navigation } from 'swiper/modules';
import { BlogCard } from '../blog/BlogCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../features/main/blog/blogsActions';

const LastArticles = () => {

    const { loading, blogs } = useSelector(state => state.blogs);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchBlogs({ "Take": 6 }));
    }, []);

    return (
        <div className="mt-20">
            <div className="container mx-auto px-5 2xl:px-20">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                    <div className="text-[#042A1B] text-center md:text-start">
                        <h1 className="font-extrabold text-4xl ">
                            آخرین
                            <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">مقالات</span>
                        </h1>
                        <p className="text-lg font-normal mt-3">آخرین مقالات و آموزش‌های برنامه‌نویسی</p>
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
                {blogs.length === 0 ? (
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
                                // 1280: {
                                //     slidesPerView: 4,
                                //     spaceBetween: 40,
                                // },
                            }}
                            navigation={{
                                nextEl: '.custom-next',
                                prevEl: '.custom-prev',
                            }}
                            modules={[Autoplay, Navigation]}
                            className="mySwiper"
                        >
                            {blogs.map((post, index) => {
                                return (
                                    <SwiperSlide key={post.Id} className="swiper-slide">
                                        <BlogCard
                                            post={post}
                                            index={index}
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

export default LastArticles;

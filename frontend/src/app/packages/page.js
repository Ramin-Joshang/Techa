"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiUsers, FiPackage, FiSearch, FiFilter, FiSliders, FiFrown } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
// فرض بر این است که اکشن شما همه پکیج ها را میگیرد یا صفحه بندی دارد
import { fetchPackages } from '../../features/main/packages/packagesActions';

// --- تنظیمات فیلترهای استاتیک (می‌تواند از API هم بیاید) ---
const CATEGORIES = [
    { id: 'all', title: 'همه پکیج‌ها' },
    { id: 'frontend', title: 'فرانت‌اند' },
    { id: 'backend', title: 'بک‌اند' },
    { id: 'internship', title: 'کارآموزی' },
    { id: 'freelance', title: 'بازار کار' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'جدیدترین‌ها' },
    { value: 'cheapest', label: 'ارزان‌ترین' },
    { value: 'expensive', label: 'گران‌ترین' },
    { value: 'popular', label: 'محبوب‌ترین (پرفروش)' },
];

const Packages = () => {
    const dispatch = useDispatch();
    const { loading, packages, error } = useSelector(state => state.packages);

    // --- State های کنترل صفحه ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        // گرفتن همه پکیج ها (بدون محدودیت Take یا با صفحه بندی)
        dispatch(fetchPackages({ "Take": 100 }));
    }, [dispatch]);

    // --- منطق فیلتر، جستجو و مرتب‌سازی در فرانت‌اند ---
    const filteredAndSortedPackages = useMemo(() => {
        if (!packages) return [];

        let result = [...packages];

        // 1. فیلتر بر اساس جستجو
        if (searchTerm) {
            result = result.filter(pkg =>
                pkg.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (pkg.ShortDescription && pkg.ShortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. فیلتر بر اساس دسته‌بندی (فرض میکنیم فیلد CategoryId یا Type در دیتای شما هست، اینجا شبیه‌سازی شده)
        // اگر در دیتابیس فیلد دسته بندی ندارید، این بخش را مطابق ساختار خود اصلاح کنید
        if (activeCategory !== 'all') {
            // result = result.filter(pkg => pkg.CategorySlug === activeCategory);
        }

        // 3. مرتب‌سازی
        result.sort((a, b) => {
            switch (sortBy) {
                case 'cheapest':
                    return (a.DiscountPrice || a.Price) - (b.DiscountPrice || b.Price);
                case 'expensive':
                    return (b.DiscountPrice || b.Price) - (a.DiscountPrice || a.Price);
                case 'popular':
                    return (b.Students || 0) - (a.Students || 0);
                case 'newest':
                default:
                    return b.SoartIndex - a.SortIndex; // فرض بر این است که ID بزرگتر یعنی جدیدتر
            }
        });

        return result;
    }, [packages, searchTerm, activeCategory, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            {/* Header & Control Panel */}
            <div className="bg-white shadow-sm border-b border-gray-100 mb-10 pb-8 pt-8">
                <div className="container mx-auto px-5 xl:px-20">

                    {/* Title Section */}
                    <div className="text-center md:text-start mb-8">
                        <h1 className="font-extrabold text-3xl md:text-4xl text-[#042A1B]">
                            لیست کامل <span className="text-emerald-600">پکیج‌های آموزشی</span>
                        </h1>
                        <p className="text-gray-500 mt-3 text-sm md:text-base">
                            بر اساس نیاز خود جستجو کنید و بهترین مسیر یادگیری را انتخاب کنید.
                        </p>
                    </div>

                    {/* Filters & Search Bar */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">

                        {/* Search Input */}
                        <div className="relative w-full lg:w-1/3">
                            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="جستجوی پکیج، دوره یا مهارت..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm shadow-sm"
                            />
                        </div>

                        {/* Categories (Pills) */}
                        <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <div className="flex items-center gap-2 min-w-max">
                                <FiFilter className="text-gray-400 mr-2 ml-1" />
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {cat.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative w-full lg:w-auto flex items-center gap-2">
                            <FiSliders className="text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm shadow-sm cursor-pointer min-w-[160px]"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>
            </div>

            {/* Packages Grid Section */}
            <div className="container mx-auto px-5 xl:px-20">
                {loading ? (
                    /* Loading Skeletons */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-white rounded-3xl p-4 h-[450px] animate-pulse shadow-sm border border-gray-100">
                                <div className="bg-gray-200 h-48 rounded-2xl mb-4 w-full"></div>
                                <div className="bg-gray-200 h-6 w-3/4 rounded-md mb-3"></div>
                                <div className="bg-gray-200 h-4 w-full rounded-md mb-2"></div>
                                <div className="bg-gray-200 h-4 w-5/6 rounded-md mb-6"></div>
                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between">
                                    <div className="bg-gray-200 h-8 w-24 rounded-md"></div>
                                    <div className="bg-gray-200 h-8 w-24 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAndSortedPackages.length > 0 ? (
                    /* Framer Motion Grid */
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                    >
                        <AnimatePresence>
                            {filteredAndSortedPackages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.Id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="h-full"
                                >
                                    <PackageCard pkg={pkg} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                            <FiFrown className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">هیچ پکیجی پیدا نشد!</h3>
                        <p className="text-gray-500 max-w-md">
                            با عبارت جستجو شده یا فیلترهای انتخابی شما نتیجه‌ای یافت نشد. لطفاً فیلترها را تغییر دهید یا عبارت دیگری را جستجو کنید.
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                            className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-colors"
                        >
                            حذف همه فیلترها
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// --- کامپوننت کارت پکیج (بهبود یافته برای گرید) ---
const PackageCard = ({ pkg }) => {
    const hasDiscount = pkg.DiscountPrice !== null && pkg.DiscountPrice >= 0 && pkg.DiscountPrice < pkg.Price;
    const discountPercentage = hasDiscount
        ? Math.round(((pkg.Price - pkg.DiscountPrice) / pkg.Price) * 100)
        : 0;

    return (
        <motion.div
            className="group bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-300 overflow-hidden h-full flex flex-col relative"
            whileHover={{ y: -8 }}
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-bl-md rounded-br-md">
                <Image
                    src={pkg.ImageUrl}
                    alt={pkg.Title}
                    fill
                    className="object-fill object-center group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Badges on Image */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        {pkg.isBestSeller && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md w-max shadow-sm">
                                🔥 پرفروش
                            </span>
                        )}
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-1 rounded-lg text-white">
                            <FiUsers className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">{pkg.Students?.toLocaleString('fa-IR') || 0} دانشجو</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-grow flex flex-col bg-white z-10">
                <Link
                    href={`/packages/${pkg.Slug}`}
                    className="text-lg font-extrabold text-gray-800 hover:text-emerald-600 transition-colors mb-2 line-clamp-2 leading-tight"
                >
                    {pkg.Title}
                </Link>

                <p className="text-gray-500 text-xs mb-6 line-clamp-3 leading-relaxed font-light">
                    {pkg.ShortDescription || 'بدون توضیحات کوتاه...'}
                </p>

                {/* Footer Section / Pricing */}
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-dashed border-gray-200">

                    {/* Price */}
                    <div className="flex flex-col justify-end">
                        {pkg.Price === 0 ? (
                            <span className="font-extrabold text-xl text-emerald-500">رایگان!</span>
                        ) : (
                            <div className="flex flex-col gap-0.5 relative">
                                {hasDiscount ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 line-through decoration-red-400">
                                                {pkg.Price?.toLocaleString('fa-IR')}
                                            </span>
                                            <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                {discountPercentage}%
                                            </span>
                                        </div>
                                        <div className="font-black text-lg text-gray-800">
                                            {pkg.DiscountPrice?.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-gray-400">تومان</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="font-black text-lg text-gray-800">
                                        {pkg.Price?.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-gray-400">تومان</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Button */}
                    <Link
                        href={`/packages/${pkg.Slug || pkg.Id}`}
                        className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-emerald-500 text-gray-600 hover:text-white rounded-xl transition-all duration-300 group/btn border border-gray-200 hover:border-emerald-500"
                    >
                        <FiArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default Packages;

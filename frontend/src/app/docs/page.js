"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiSliders, FiFrown } from "react-icons/fi";
import { AlertCircle } from "lucide-react";

// ایمپورت‌های مربوط به مستندات
import { fetchDocs } from "../../features/main/docs/docsActions";
import DocCard from "../../components/docs/DocCard";
import DocsSkeleton from "../../components/common/DocsSkeleton";

// --- تنظیمات فیلترها بر اساس فیلد Level در مستندات ---
const CATEGORIES = [
  { id: "all", title: "همه سطوح" },
  { id: "Beginner", title: "مبتدی" },
  { id: "Intermediate", title: "متوسط" },
  { id: "Advanced", title: "پیشرفته" },
];

const SORT_OPTIONS = [
  { value: "default", label: "پیش‌فرض (ترتیب)" },
  { value: "a-z", label: "الفبا (صعودی)" },
  { value: "z-a", label: "الفبا (نزولی)" },
];

export default function Docs() {
  const dispatch = useDispatch();
  const { loading, docs, error } = useSelector((state) => state.docs);

  // --- State های کنترل صفحه ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    dispatch(fetchDocs());
  }, [dispatch]);

  // --- منطق فیلتر، جستجو و مرتب‌سازی در فرانت‌اند ---
  const filteredAndSortedDocs = useMemo(() => {
    if (!docs) return [];

    let result = [...docs];

    // 1. فیلتر بر اساس جستجو (عنوان یا خلاصه)
    if (searchTerm) {
      result = result.filter(
        (doc) =>
          doc.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.Summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. فیلتر بر اساس سطح (Level)
    if (activeCategory !== "all") {
      result = result.filter((doc) => doc?.Level === activeCategory);
    }

    // 3. مرتب‌سازی
    result.sort((a, b) => {
      switch (sortBy) {
        case "a-z":
          return a.Title.localeCompare(b.Title, "fa");
        case "z-a":
          return b.Title.localeCompare(a.Title, "fa");
        case "default":
        default:
          return (a.SortIndex || 0) - (b.SortIndex || 0);
      }
    });

    return result;
  }, [docs, searchTerm, activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Header & Control Panel */}
      <div className="bg-white shadow-sm border-b border-gray-100 mb-10 pb-8 pt-8">
        <div className="container mx-auto px-5 xl:px-20">
          {/* Title Section */}
          <div className="text-center md:text-start mb-8">
            <h1 className="font-extrabold text-3xl md:text-4xl text-[#042A1B]">
              مستندات <span className="text-emerald-600">آموزشی</span>
            </h1>
            <p className="text-gray-500 mt-3 text-sm md:text-base">
              در میان مستندات جستجو کنید و مهارت‌های خود را ارتقا دهید.
            </p>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {/* Search Input */}
            <div className="relative w-full lg:w-1/3">
              <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="جستجوی تکنولوژی، زبان یا مهارت..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm shadow-sm"
              />
            </div>

            {/* Categories (Pills) */}
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <FiFilter className="text-gray-400 mr-2 ml-1" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
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
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Docs Grid Section */}
      <div className="container mx-auto px-5 xl:px-20">
        {/* 1) Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-200">
            <AlertCircle size={48} className="mb-4" />
            <h3 className="text-xl font-bold">خطا در دریافت اطلاعات</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => dispatch(fetchDocs())}
              className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* 2) Loading State */}
        {loading && !error ? (

          <DocsSkeleton />

        ) : !error && filteredAndSortedDocs.length > 0 ? (
          /* 3) Success State with Framer Motion */
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            <AnimatePresence>
              {filteredAndSortedDocs.map((doc, index) => (
                <motion.div
                  key={doc.Id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  {/* پاس دادن دیتای اسپرد شده یا به صورت آبجکت بر اساس ساختار DocCard شما */}
                  <DocCard doc={doc} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : !error ? (
          /* 4) Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
              <FiFrown className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">هیچ مستندی پیدا نشد!</h3>
            <p className="text-gray-500 max-w-md">
              با عبارت جستجو شده یا فیلترهای انتخابی شما نتیجه‌ای یافت نشد. لطفاً فیلترها را تغییر دهید.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
              }}
              className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-colors"
            >
              حذف همه فیلترها
            </button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

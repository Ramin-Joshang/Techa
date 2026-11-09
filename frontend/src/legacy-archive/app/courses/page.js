"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { FiArrowLeft, FiClock, FiStar, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import { SP_fetch } from "../../api/utils/api";

const ModernCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        //  const response = await fetch("https://pool.techa.ir/api/Course");
        const { Data, IsSuccess, Message, StatusCode } = await SP_fetch(
          "Report_Courses"
        );
        const raw = Data;

        if (IsSuccess) {
          const enrichedCourses = raw
            .filter((course) => !course.Disabled)
            .map((course) => ({
              ...course,
              Students: Math.floor(Math.random() * 5000),
              Rating: (Math.random() * 1 + 4).toFixed(1),
              Comments: Math.floor(Math.random() * 200),
              Level: ["مبتدی", "متوسط", "پیشرفته"][
                Math.floor(Math.random() * 3)
              ],
              Duration: Math.floor(Math.random() * 20) + 5,
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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.Title.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const matchesPrice =
      priceFilter === "all"
        ? true
        : priceFilter === "free"
          ? course.Price === 0
          : course.Price > 0;

    const matchesDuration =
      durationFilter === "all"
        ? true
        : durationFilter === "short"
          ? course.Duration <= 5
          : durationFilter === "medium"
            ? course.Duration <= 10
            : course.Duration > 10;

    return matchesSearch && matchesPrice && matchesDuration;
  });

  return (
    <div className="min-h-screen pt-32 py-12">
      <div className="container mx-auto px-5 lg:px-0 xl:px-5 2xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700">
              دوره‌های آموزشی
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            بهترین دوره‌های برنامه‌نویسی با تدریس اساتید برجسته
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-16 space-y-6">
          {/* Floating Label Search */}
          <div className="relative">
            <input
              type="text"
              placeholder=" "
              className="w-full peer pt-6 pb-2 px-4 border-0 ring-1 focus:outline-none ring-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 bg-white placeholder-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <label className="absolute pointer-events-none start-4 top-2 text-sm text-gray-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
              جستجو در دوره‌ها...
            </label>
            <div className="absolute inset-y-0 end-4 flex items-center">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3">
            <FilterChip
              label="همه دوره‌ها"
              active={priceFilter === "all" && durationFilter === "all"}
              onClick={() => {
                setPriceFilter("all");
                setDurationFilter("all");
              }}
            />
            <FilterChip
              label="رایگان"
              active={priceFilter === "free"}
              onClick={() => setPriceFilter("free")}
              icon={
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <FilterChip
              label="پولی"
              active={priceFilter === "paid"}
              onClick={() => setPriceFilter("paid")}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.09 1.05 1.13 1.77 2.2 1.34 1.09-.45 1.24-1.56.64-2.13-.74-.71-2.18-.2-2.87-.81-1.08-.94-1.09-2.52-.02-3.46.87-.76 2.21-.66 3.05.15.37.37.65.82.81 1.31h1.93c-.28-1.88-1.85-3.36-3.75-3.6V4h2.67v1.95c1.86.28 3.25 1.7 3.43 3.6h-1.99c-.15-1.05-1.14-1.78-2.2-1.34-1.09.45-1.24 1.56-.64 2.13.74.71 2.18.2 2.87.81 1.08.94 1.09 2.52.02 3.46-.87.76-2.21.66-3.05-.15a3.5 3.5 0 01-.79-1.31H9.3c.28 1.88 1.85 3.36 3.75 3.6z" />
                </svg>
              }
            />
            <DurationDropdown
              durationFilter={durationFilter}
              setDurationFilter={setDurationFilter}
            />
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredCourses.map((course, index) => (
                  <CourseCard
                    key={course.Id}
                    course={course}
                    image={images[index % images.length]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-2xl text-gray-700 mb-4">
                  دوره‌ای با این مشخصات یافت نشد
                </div>
                <button
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => {
                    setSearchQuery("");
                    setPriceFilter("all");
                    setDurationFilter("all");
                  }}
                >
                  بازنشانی فیلترها
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Component for Filter Chip
const FilterChip = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${active
      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
      : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
      }`}
  >
    {icon && <span>{icon}</span>}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Component for Duration Dropdown
const DurationDropdown = ({ durationFilter, setDurationFilter }) => {
  const [isOpen, setIsOpen] = useState(false);

  const durationOptions = [
    { label: "همه مدت‌ها", value: "all" },
    { label: "کوتاه (کمتر از 5 ساعت)", value: "short" },
    { label: "متوسط (5-10 ساعت)", value: "medium" },
    { label: "طولانی (بیشتر از 10 ساعت)", value: "long" },
  ];

  const currentLabel =
    durationOptions.find((opt) => opt.value === durationFilter)?.label ||
    "مدت زمان";

  return (
    <div className="relative">
      <button
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${durationFilter !== "all"
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
          : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium">{currentLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-10 overflow-hidden">
          {durationOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                setDurationFilter(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 cursor-pointer transition-colors ${durationFilter === option.value
                ? "bg-emerald-50 text-emerald-600"
                : "hover:bg-gray-50"
                }`}
            >
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for Course Card
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
              <span className="text-xs">
                {course.Students.toLocaleString()} نفر
              </span>
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
          مدرس: {course.Instructor || "رامین جوشنگ"}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
        این دوره به شما کمک می‌کند تا مهارت‌های خود را به سطح حرفه‌ای برسانید و
        در پروژه‌های واقعی بدرخشید؛ همچنین از تجربیات اساتید مجرب بهره‌مند شوید.
      </p>

      {/* Footer Section */}
      <div className="flex items-center justify-between mt-auto">
        {/* Price Tag */}
        <div
          className={`flex items-center ${course.Price > 0 ? "text-emerald-600" : "text-amber-500"
            }`}
        >
          <div className="relative">
            {course.Price > 0 && (
              <div className="absolute -top-3 -right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-[10px]">
                20% تخفیف
              </div>
            )}
            <span className="font-bold text-lg">
              {course.Price > -1
                ? `${(
                  Math.floor(Math.random() * 8) * 500000 +
                  1000000
                ).toLocaleString("fa-IR")} تومان`
                : "رایگان"}
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

export default ModernCoursesPage;

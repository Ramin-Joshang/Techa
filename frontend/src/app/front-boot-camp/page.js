"use client";

import {
  Calendar1,
  ChevronDown,
  LifeBuoy,
  RefreshCw,
  Users,
  Briefcase,
  BookOpen,
  Code,
  Network,
  Award,
  Rocket,
  MessageCircleHeart,
  User,
  Mail,
  PenLine,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { addToCart } from "../../features/cart/cartSlice";

const Accordion = ({ title, content, isOpen, onClick }) => {
  return (
    <div
      className="border-b border-[#D0DDD1] py-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-normal text-[#042A1B] ">{title}</p>
        <span
          className={`text-[#7AE36A] transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        >
          <ChevronDown />
        </span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-screen" : "max-h-0"
          }`}
      >
        <div className="mt-5 pr-5 pl-10">
          <p className="text-[16px] font-medium text-[#042A1B]  leading-7 text-justify">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(0);

  const dispatch = useDispatch();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = () => {
    const targetDate = new Date("2025-01-31T23:59:59"); // تاریخ هدف
    const now = new Date();
    const difference = targetDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? -1 : index);
  };

  const accordionContent = [
    {
      title: "آیا برای شرکت در این دوره نیاز به پیش‌نیاز خاصی دارم؟",
      content:
        "خیر، این دوره از سطح مقدماتی شروع می‌شود و تمام مفاهیم لازم را به شما آموزش می‌دهد. تنها چیزی که نیاز دارید علاقه و انگیزه کافی برای یادگیری است.",
    },
    {
      title: "چقدر زمان باید روزانه برای این دوره اختصاص دهم؟",
      content:
        "پیشنهاد می‌شود حداقل ۲ تا ۳ ساعت در روز را به یادگیری و تمرین اختصاص دهید. البته این زمان بستگی به سرعت یادگیری شما دارد.",
    },
    {
      title: "آیا پس از پایان دوره، گواهی معتبر دریافت می‌کنم؟",
      content:
        "بله، پس از اتمام موفقیت‌آمیز دوره، یک گواهی معتبر به شما اعطا می‌شود که می‌توانید از آن در رزومه خود استفاده کنید.",
    },
    {
      title: "آیا این دوره شامل پروژه‌های عملی است؟",
      content:
        "بله، این دوره شامل چندین پروژه عملی است که به شما کمک می‌کند تا دانش خود را در دنیای واقعی به کار بگیرید.",
    },
    {
      title: "چگونه می‌توانم از پشتیبانی دوره استفاده کنم؟",
      content:
        "شما می‌توانید از طریق پنل کاربری خود سوالات خود را مطرح کنید و یا در جلسات رفع اشکال شرکت کنید. پشتیبان‌های دوره همیشه آماده کمک به شما هستند.",
    },
    {
      title: "آیا این دوره برای افراد مبتدی مناسب است؟",
      content:
        "بله، این دوره به گونه‌ای طراحی شده است که افراد مبتدی نیز بتوانند به راحتی مفاهیم را یاد بگیرند و پیشرفت کنند.",
    },
    {
      title: "چگونه می‌توانم در پایان دوره شغل پیدا کنم؟",
      content:
        "این دوره شامل بخش‌هایی مانند راهنمایی برای ساخت رزومه، آمادگی برای مصاحبه‌های شغلی و معرفی به شرکت‌های معتبر است که به شما در یافتن شغل کمک می‌کند.",
    },
    {
      title: "آیا محتوای دوره به‌روز است؟",
      content:
        "بله، محتوای دوره به‌طور مداوم به‌روزرسانی می‌شود تا مطابق با آخرین تکنولوژی‌ها و استانداردهای صنعت باشد.",
    },
    {
      title: "آیا می‌توانم بعد از اتمام دوره، به‌صورت فریلنسر کار کنم؟",
      content:
        "بله، این دوره شما را برای کار به‌صورت فریلنسر نیز آماده می‌کند و مهارت‌های لازم برای مدیریت پروژه‌های مستقل را به شما آموزش می‌دهد.",
    },
    {
      title: "آیا امکان پرداخت اقساطی برای این دوره وجود دارد؟",
      content:
        "بله، امکان پرداخت اقساطی برای این دوره وجود دارد. برای اطلاعات بیشتر می‌توانید با پشتیبانی تماس بگیرید.",
    },
  ];

  const courseOutline = [
    {
      id: 0,
      title: "HTML",
      icon: "/images/html.png", // مسیر عکس HTML
      content: [
        "ساختار پایه‌ای HTML",
        "تگ‌های اصلی (head, body, title, etc.)",
        "فرم‌ها و ورودی‌ها",
        "معرفی Semantic HTML",
        "کار با لیست‌ها و جداول",
        "ایجاد لینک‌ها و تصاویر",
        "معرفی HTML5 و ویژگی‌های جدید",
      ],
    },
    {
      id: 1,
      title: "CSS",
      icon: "/images/css.png", // مسیر عکس CSS
      content: [
        "استایل‌دهی پایه‌ای",
        "Flexbox و Grid",
        "انیمیشن‌ها و ترنزیشن‌ها",
        "رسپانسیو کردن وب‌سایت",
        "کار با Media Queries",
        "معرفی CSS Variables",
        "استفاده از Preprocessors مانند SASS",
      ],
    },
    {
      id: 2,
      title: "Tailwind CSS",
      icon: "/images/tailwind.png", // مسیر عکس Tailwind CSS
      content: [
        "معرفی Tailwind CSS",
        "Utility-First Approach",
        "سفارشی‌سازی تنظیمات",
        "استفاده از کامپوننت‌ها",
        "کار با پلاگین‌ها",
        "بهینه‌سازی برای تولید",
        "ایجاد تم‌های سفارشی",
      ],
    },
    {
      id: 3,
      title: "JavaScript",
      icon: "/images/js.png", // مسیر عکس JavaScript
      content: [
        "معرفی جاوااسکریپت",
        "DOM Manipulation",
        "Event Handling",
        "کار با API ها",
        "معرفی ES6+ Features",
        "کار با Async/Await",
        "معرفی Webpack و Babel",
      ],
    },
    {
      id: 4,
      title: "React",
      icon: "/images/react.png", // مسیر عکس React
      content: [
        "معرفی React و JSX",
        "کامپوننت‌ها و Props",
        "مدیریت State و Hooks",
        "راستینگ با React Router",
        "کار با Context API",
        "معرفی Redux و Zustand",
        "بهینه‌سازی عملکرد React",
      ],
    },
    // {
    //   id: 5,
    //   title: "Git",
    //   icon: "/images/git.png", // مسیر عکس Git
    //   content: [
    //     "معرفی Git و GitHub",
    //     "کار با Branch ها",
    //     "ادغام و حل تعارضات",
    //     "Deploy پروژه‌ها",
    //     "کار با Git Hooks",
    //     "معرفی CI/CD Pipelines",
    //     "بهینه‌سازی Workflow",
    //   ],
    // },
  ];

  return (
    <section className="pt-32">
      <div className="container px-5 xl:px-20 mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="text-[#042A1B]">
            <h1 className="text-[28px] sm:text-5xl font-extrabold sm:leading-[60px]">
              بوت کمپ برنامه نویسی فرانت اند <br />
              از مقدماتی تا حرفه ای{" "}
            </h1>
            <p className="text-[17px] text-justify font-normal leading-7 my-4">
              مداد رنگی ها مشغول بودند به جز مداد سفید، هیچکس به او کار نمیداد،
              همه میگفتند : تو به هیچ دردی نمیخوری، یک شب که مداد رنگی ها تو
              سیاهی شب گم شده بودند، مداد سفید تا صبح ماه کشید مهتاب کشید و
              انقدر ستاره کشید که کوچک و کوچکتر شد صبح توی جعبه مداد رنگی جای
              خالی او با هیچ رنگی پر نشد، به یاد هم باشیم شاید فردا ما هم در
              کنار هم نباشیم…
            </p>
            <Link
              className="bg-[#7AE36A] px-5 py-2 rounded-full font-semibold  mt-2 inline-block hover:text-white transition-all duration-300"
              href="#pre-registration"
            >
              پیش ثبت نام
            </Link>
          </div>
          <div className="relative w-full pb-[60%] lg:mt-0">
            <Image
              src="/images/bootcamp.jpg"
              className="rounded-3xl"
              layout="fill"
              objectFit="cover"
              alt="banner"
            />
          </div>
        </div>
        {/* Features */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 2xl:gap-10 mt-20 sm:px-20">
          <div className="bg-[#D0DDD140] rounded-3xl py-5 px-5 flex flex-col items-center">
            <span className="text-[#042A1B]">
              <svg
                width="50"
                height="50"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2.5V6.25"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 2.5V6.25"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.375 11.3625H25.625"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M26.25 10.625V21.25C26.25 25 24.375 27.5 20 27.5H10C5.625 27.5 3.75 25 3.75 21.25V10.625C3.75 6.875 5.625 4.375 10 4.375H20C24.375 4.375 26.25 6.875 26.25 10.625Z"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.9944 17.125H15.0056"
                  stroke="#7AE36A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.3679 17.125H10.3791"
                  stroke="#7AE36A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.3679 20.875H10.3791"
                  stroke="#7AE36A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[#042A1B7F] font-normal my-5">مدت زمان دوره</p>
            <h4 className="text-[#042A1B] font-extrabold text-xl sm:text-2xl">
              98 ساعت
            </h4>
          </div>
          <div className="bg-[#D0DDD140] rounded-3xl py-5 px-5 flex flex-col items-center">
            <span>
              <svg
                width="46"
                height="46"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.5 14C26.5 20.9 20.9 26.5 14 26.5C7.1 26.5 1.5 20.9 1.5 14C1.5 7.1 7.1 1.5 14 1.5C20.9 1.5 26.5 7.1 26.5 14Z"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.6375 17.975L14.7625 15.6625C14.0875 15.2625 13.5375 14.3 13.5375 13.5125V8.38751"
                  stroke="#7AE36A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[#042A1B7F] font-normal my-5">آخرین بروزرسانی</p>
            <h4 className="text-[#042A1B] font-extrabold text-xl sm:text-2xl">
              04 خرداد 1403
            </h4>
          </div>
          <div className="bg-[#D0DDD140] rounded-3xl py-5 px-5 flex flex-col items-center">
            <span>
              <svg
                width="44"
                height="44"
                viewBox="0 0 26 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 26.5H18C23.025 26.5 23.925 24.4875 24.1875 22.0375L25.125 12.0375C25.4625 8.9875 24.5875 6.5 19.25 6.5H6.75C1.4125 6.5 0.537497 8.9875 0.874997 12.0375L1.8125 22.0375C2.075 24.4875 2.975 26.5 8 26.5Z"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6.5V5.5C8 3.2875 8 1.5 12 1.5H14C18 1.5 18 3.2875 18 5.5V6.5"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 15.25V16.5C15.5 16.5125 15.5 16.5125 15.5 16.525C15.5 17.8875 15.4875 19 13 19C10.525 19 10.5 17.9 10.5 16.5375V15.25C10.5 14 10.5 14 11.75 14H14.25C15.5 14 15.5 14 15.5 15.25Z"
                  stroke="#7AE36A"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.0625 12.75C22.175 14.85 18.875 16.1 15.5 16.525"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.27499 13.0875C4.08749 15.0125 7.26249 16.175 10.5 16.5375"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[#042A1B7F] font-normal my-5">پیش نیاز</p>
            <h4 className="text-[#042A1B] font-extrabold text-xl sm:text-2xl">
              عشق و علاقه
            </h4>
          </div>
          <div className="bg-[#D0DDD140] rounded-3xl py-5 px-5 flex flex-col items-center">
            <span>
              <svg
                width="42"
                height="42"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.5 17.75V10.25C26.5 4 24 1.5 17.75 1.5H10.25C4 1.5 1.5 4 1.5 10.25V17.75C1.5 24 4 26.5 10.25 26.5H17.75C24 26.5 26.5 24 26.5 17.75Z"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.14999 7.88751H25.85"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.64999 1.63751V7.71251"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.35 1.63751V7.15001"
                  stroke="#042A1B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.1875 17.0625V15.5625C11.1875 13.6375 12.55 12.85 14.2125 13.8125L15.5125 14.5625L16.8125 15.3125C18.475 16.275 18.475 17.85 16.8125 18.8125L15.5125 19.5625L14.2125 20.3125C12.55 21.275 11.1875 20.4875 11.1875 18.5625V17.0625V17.0625Z"
                  stroke="#7AE36A"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-[#042A1B7F] font-normal my-5">نوع مشاهده</p>
            <h4 className="text-[#042A1B] font-extrabold text-xl sm:text-2xl">
              دانلودی/آنلاین
            </h4>
          </div>
        </div>
        {/* Teacher */}
        <div className="mt-32">
          <div className="text-[#042A1B] text-center">
            <h1 className="font-extrabold text-4xl ">
              مدرس{" "}
              <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">
                دوره
              </span>
            </h1>
          </div>
          <div className="grid lg:grid-cols-2 gap-20 items-center mt-20">
            <div className="text-[#042A1B]">
              <h1 className="text-[28px] sm:text-5xl font-extrabold sm:leading-[60px]">
                مهندس رامین جوشنگ
              </h1>
              <p className="text-[17px] text-justify font-normal leading-7 my-4">
                **رامین جوشنگ** یک ستاره درخشان در دنیای برنامه‌نویسی است که
                تمام جنبه‌های توسعه وب را با تسلط کامل انجام می‌دهد. با تجربه‌ی
                گسترده در هر دو بخش فرانت‌اند و بک‌اند، او توانسته است پروژه‌های
                شگفت‌انگیزی را به سرانجام برساند. رامین با روحیه‌ای پرشور و
                مهارتی خارق‌العاده، دانش و تجربه‌اش را در بوت‌کمپ‌ها و
                کارگاه‌های آموزشی به اشتراک می‌گذارد و دانشجویان را به
                موفقیت‌های بزرگ می‌رساند. او همیشه آماده است تا با روش‌های
                نوآورانه، تجربه‌های کاربری بی‌نظیر و زیبا خلق کند.
              </p>
              <Link
                className="px-5 py-2 text-[#7AE36A] rounded-xl font-semibold border border-[#7AE36A] mt-2 inline-block hover:text-white hover:bg-[#7AE36A] hover:scale-110 transition-all duration-300"
                href="https://Joshang.ir"
              >
                مشاهده روزمه
              </Link>
            </div>
            <div className="relative w-full sm:w-2/3 pb-[80%] sm:pb-[60%] lg:mt-0 mx-auto">
              <Image
                src="/images/teacher.jpeg"
                className="rounded-3xl"
                layout="fill"
                objectFit="cover"
                alt="banner"
              />
            </div>
          </div>
        </div>
        {/* Sylabues */}
        <div className="mt-32">
          <div className="text-[#042A1B] text-center">
            <h1 className="font-extrabold text-4xl ">
              سرفصل های{" "}
              <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">
                دوره
              </span>
            </h1>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 mt-20">
            <div className="space-y-4">
              {courseOutline.map((tab) => (
                <motion.div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${activeTab === tab.id
                    ? "bg-[#7AE36A] text-white shadow-lg"
                    : "bg-[#D0DDD140] hover:bg-[#7AE36A50] hover:shadow-md"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src={tab.icon}
                      layout="fill"
                      objectFit="contain"
                      alt={tab.title}
                    />
                  </div>
                  <h2 className="text-lg font-semibold mr-3">{tab.title}</h2>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#D0DDD140] p-8 rounded-xl shadow-lg"
              >
                <h2 className="text-2xl font-extrabold text-[#042A1B] mb-6">
                  {courseOutline[activeTab].title}
                </h2>
                <ul className="list-disc list-inside space-y-3">
                  {courseOutline[activeTab].content.map((item, index) => (
                    <motion.li
                      key={index}
                      className="text-[#042A1B] text-lg transition-all duration-300 ease-in-out hover:pl-2"
                      whileHover={{ x: 10 }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Why this course */}
        <div className="mt-32">
          <div className="text-[#042A1B] text-center">
            <h1 className="font-extrabold text-4xl ">
              چرا این{" "}
              <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">
                دوره
              </span>
              ؟
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
            {/* مورد ۱ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <LifeBuoy className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  همراهی پشتیبان
                </h3>
                <p className="text-[#042A1B] text-sm">
                  پشتیبانی کامل در طول دوره و بعد از آن.
                </p>
              </div>
            </div>

            {/* مورد ۲ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <RefreshCw className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  بروزرسانی مداوم
                </h3>
                <p className="text-[#042A1B] text-sm">
                  آموزش‌ها همیشه به‌روز و مطابق با تکنولوژی‌های جدید.
                </p>
              </div>
            </div>

            {/* مورد ۳ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <Users className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  کار تیمی
                </h3>
                <p className="text-[#042A1B] text-sm">
                  آموزش مهارت‌های کار تیمی و همکاری مؤثر.
                </p>
              </div>
            </div>

            {/* مورد ۴ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <Briefcase className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  کمک به استخدام
                </h3>
                <p className="text-[#042A1B] text-sm">
                  ارائه راهنمایی برای استخدام در شرکت‌های برتر.
                </p>
              </div>
            </div>

            {/* مورد ۵ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <BookOpen className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  منتورینگ
                </h3>
                <p className="text-[#042A1B] text-sm">
                  جلسات رفع اشکال و راهنمایی توسط اساتید مجرب.
                </p>
              </div>
            </div>

            {/* مورد ۶ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <Code className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  پروژه‌های کاربردی
                </h3>
                <p className="text-[#042A1B] text-sm">
                  تمرین و پروژه‌های عملی برای یادگیری بهتر.
                </p>
              </div>
            </div>

            {/* مورد ۷ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <Network className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  شبکه‌سازی
                </h3>
                <p className="text-[#042A1B] text-sm">
                  فرصت شبکه‌سازی با اساتید و دانش‌پذیران.
                </p>
              </div>
            </div>

            {/* مورد ۸ */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <Award className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  گواهی پایان دوره
                </h3>
                <p className="text-[#042A1B] text-sm">
                  ارائه گواهی معتبر پس از اتمام دوره.
                </p>
              </div>
            </div>

            {/* مورد جدید (۹) */}
            <div className="flex items-center p-6 bg-[#D0DDD140] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 flex items-center justify-center bg-[#7AE36A] rounded-full">
                <Rocket className="text-white" size={24} />
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-[#042A1B]">
                  پیشرفت سریع
                </h3>
                <p className="text-[#042A1B] text-sm">
                  یادگیری سریع و مؤثر با روش‌های مدرن.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Register */}
        <div className="mt-20 bg-gradient-to-br from-[#031A12] via-[#042A1B] to-[#0A4D3C] px-5 py-10 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden" id="pre-registration">
          {/* افکت نورپردازی */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#7AE36A10_0%,transparent_70%)]" />

          <div className="text-center relative z-10">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7AE36A] to-[#B2FF9E]">
              قیمت و پیش ثبت نام
            </h2>
            <p className="text-lg text-[#D0DDD1] mt-4">
              فرصت باقی مانده برای ثبت نام با{" "}
              <span className="font-bold text-[#7AE36A]">۲۰٪ تخفیف</span>
            </p>

            {/* تایمر پیشرفته */}
            <div className="flex flex-row-reverse justify-evenly items-center  sm:px-5 py-10 rounded-3xl ">
              <div className="text-center mx-4">
                <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">
                  {timeLeft.days.toString().padStart(2, "0")}
                </div>
                <div className="text-lg text-white mt-2">روز</div>
              </div>
              {/* <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">:</div> */}
              <div className="text-center mx-4">
                <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </div>
                <div className="text-lg text-white mt-2">ساعت</div>
              </div>
              {/* <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">:</div> */}
              <div className="text-center mx-4">
                <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </div>
                <div className="text-lg text-white mt-2">دقیقه</div>
              </div>
              {/* <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">:</div> */}
              <div className="text-center mx-4">
                <div className="text-4xl sm:text-6xl font-bold text-[#7AE36A]">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </div>
                <div className="text-lg text-white mt-2">ثانیه</div>
              </div>
            </div>
          </div>

          {/* کارتهای قیمت */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* کارت قیمت اصلی */}
            <div className="bg-[#7AE36A10] p-8 rounded-2xl border border-[#7AE36A30] backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-[#D0DDD1]">قیمت اصلی</h3>
              <div className="mt-4">
                <p className="text-3xl font-bold text-[#7AE36A] line-through">
                  ۱۲,۰۰۰,۰۰۰ تومان
                </p>
                <p className="text-[#D0DDD1] mt-2">
                  دسترسی به تمام محتوای دوره
                </p>
              </div>
            </div>

            {/* کارت قیمت تخفیف‌دار */}
            <div className="bg-gradient-to-br from-[#7AE36A] to-[#5ACD4A] p-8 rounded-2xl shadow-lg relative">
              <h3 className="text-2xl font-bold text-[#042A1B]">
                پیش ثبت نام ویژه
              </h3>
              <div className="mt-4">
                <p className="text-4xl font-bold text-[#042A1B]">
                  ۹,۶۰۰,۰۰۰ تومان
                </p>
                <p className="text-[#042A1B] mt-2">
                  + هدیه رایگان راهنمای استخدام
                </p>
              </div>
              <button
                className="mt-6 w-full bg-[#042A1B] text-white py-3 rounded-xl font-semibold hover:bg-[#031A12] transition-all duration-300 cursor-pointer"
                onClick={() => dispatch(addToCart({ id: nanoid(), title: "بوت کمپ برنامه نویسی فرانت اند", image: "/images/bootcamp.jpg", price: 8000000 }))}

              >
                پیش ثبت نام
              </button>
            </div>
          </div>

          {/* متن پرداخت اقساطی */}
          <div className="text-center mt-8">
            <p className="text-[#D0DDD1] text-sm">
              <span className="text-[#7AE36A]">✨ امکان پرداخت ۶ ماهه</span> |
              پشتیبانی ۲۴/۷
            </p>
          </div>
        </div>
        {/* Support */}
        <div className="mt-32 bg-[#F8FCF9] py-10 px-5 sm:p-10 rounded-2xl shadow-sm border border-[#D0DDD1]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#042A1B] flex justify-center items-center gap-3">
              <span>درخواست پشتیبانی</span>
              <MessageCircleHeart className="text-[#7AE36A] w-8 h-8" />
            </h1>
            <p className="mt-2 text-[#042A1B]/80">
              برای دریافت اطلاعات بیشتر درباره بوت‌کمپ یا پشتیبانی، فرم زیر را
              پر کنید.
            </p>
          </div>

          <form className="mt-20 grid gap-5 lg:w-2/3 mx-auto">
            {/* فیلدهای نام و ایمیل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام کامل"
                  className="w-full p-3.5 bg-white rounded-lg border border-[#D0DDD1] 
                             focus:border-[#7AE36A] focus:outline-none focus:ring-1 focus:ring-[#7AE36A] 
                             placeholder:text-[#042A1B]/50"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#042A1B]/40" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="پست الکترونیک"
                  className="w-full p-3.5 bg-white rounded-lg border border-[#D0DDD1] 
                             focus:border-[#7AE36A] focus:outline-none focus:ring-1 focus:ring-[#7AE36A] 
                             placeholder:text-[#042A1B]/50"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#042A1B]/40" />
              </div>
            </div>

            {/* فیلد پیام */}
            <div className="relative">
              <textarea
                placeholder="پیام شما"
                rows="4"
                className="w-full p-3.5 bg-white rounded-lg border border-[#D0DDD1] 
                         focus:border-[#7AE36A] focus:outline-none focus:ring-1 focus:ring-[#7AE36A] 
                         placeholder:text-[#042A1B]/50"
              ></textarea>
              <PenLine className="absolute left-3 top-4 text-[#042A1B]/40" />
            </div>

            {/* دکمه ارسال */}
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#7AE36A] text-[#042A1B] 
                     px-6 py-3.5 rounded-lg font-medium hover:bg-[#6ACD5A] 
                     transition-colors w-fit ml-auto"
            >
              <Send className="w-4 h-4 rotate-[-45deg]" />
              ارسال درخواست
            </button>
          </form>
        </div>
        {/* FAQs */}
        <div className="mt-32">
          <div className="text-[#042A1B] text-center">
            <h1 className="font-extrabold text-4xl ">
              سوالات{" "}
              <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">
                متداول
              </span>
            </h1>
          </div>
          <div className="mt-20 lg:px-20">
            {accordionContent.map((accordion, index) => (
              <Accordion
                key={index}
                title={accordion.title}
                content={accordion.content}
                isOpen={openAccordion === index}
                onClick={() => toggleAccordion(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

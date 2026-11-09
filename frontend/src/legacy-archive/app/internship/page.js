"use client";

import {
  ChevronDown,
  Users,
  Briefcase,
  GitBranch,
  ClipboardList,
  Clock,
  BarChart2,
  Trophy,
  PenLine,
  Send,
  Mail,
  User,
  MessageCircleHeart,
  Rocket,
  Award,
  Network,
  Code,
  BookOpen,
  RefreshCw,
  LifeBuoy,

} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { addToCart } from "../../features/cart/cartSlice";

const ProcessTimeline = () => {
  const steps = [
    {
      title: "ارزیابی اولیه",
      icon: <ClipboardList size={24} />,
      content: "بررسی رزومه و انجام مصاحبه فنی برای سنجش سطح مهارت‌ها"
    },
    {
      title: "انتخاب تیم",
      icon: <Users size={24} />,
      content: "انتساب به یکی از تیم‌های توسعه بر اساس مهارت و علاقه‌مندی"
    },
    {
      title: "تعیین پروژه",
      icon: <GitBranch size={24} />,
      content: "دریافت پروژه واقعی مطابق با نیازهای شرکت"
    },
    {
      title: "برنامه‌ریزی اسپرینت",
      icon: <Clock size={24} />,
      content: "شرکت در جلسات برنامه‌ریزی و تعیین وظایف هفتگی"
    },
    {
      title: "توسعه و همکاری",
      icon: <BarChart2 size={24} />,
      content: "همکاری با تیم و توسعه پروژه تحت نظارت منتور ارشد"
    },
    {
      title: "تحویل نهایی",
      icon: <Trophy size={24} />,
      content: "ارائه پروژه و دریافت گواهی پایان دوره"
    }
  ];



  return (
    <div className="relative mt-20">
      <div className="hidden lg:block absolute left-1/2 top-0 h-full w-1 bg-[#D0DDD1] transform -translate-x-1/2" />

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="relative lg:even:mt-20 lg:odd:mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#D0DDD1]">
              <div className="w-12 h-12 mb-4 bg-[#7AE36A] rounded-full flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-[#042A1B] mb-2">{step.title}</h3>
              <p className="text-[#042A1B]/80">{step.content}</p>
            </div>

            {/* Connectors for mobile */}
            {index !== steps.length - 1 && (
              <div className="lg:hidden absolute -bottom-10 left-1/2 h-10 w-1 bg-[#D0DDD1] transform -translate-x-1/2" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function InternshipProgram() {
  const [activeTab, setActiveTab] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(0);
  const dispatch = useDispatch();

  const accordionContent = [
    {
      title: "شرایط پذیرش در برنامه کارآموزی چیست؟",
      content: "دانش پایه برنامه‌نویسی، آشنایی با Git و انگیزه بالا برای یادگیری"
    },
    {
      title: "مدت زمان دوره کارآموزی چقدر است؟",
      content: "بین 3 تا 6 ماه بسته به پیشرفت فردی و پیچیدگی پروژه"
    },
    {
      title: "آیا پس از پایان دوره امکان استخدام وجود دارد؟",
      content: "بهترین افراد پس از ارزیابی نهایی به تیم اصلی اضافه می‌شوند"
    }
  ];

  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 0,
    minutes: 0,
    seconds: 5,
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


  const courseOutline = [
    {
      id: 0,
      title: "Git و GitHub",
      icon: "/images/git.png", // مسیر عکس Git
      content: [
        "معرفی Git و مفاهیم پایه",
        "کار با Branch ها و Merge",
        "حل تعارضات (Conflict Resolution)",
        "استفاده از GitHub برای همکاری تیمی",
        "کار با Pull Requests و Code Reviews",
        "ادغام CI/CD با GitHub Actions",
        "بهینه‌سازی Workflow با Git Hooks",
      ],
    },
    {
      id: 1,
      title: "مدیریت پروژه با Scrum",
      icon: "/images/scrum.png", // مسیر عکس Scrum
      content: [
        "معرفی Agile و Scrum",
        "نقش‌ها در تیم Scrum (Product Owner, Scrum Master, Developer)",
        "برنامه‌ریزی اسپرینت‌ها (Sprint Planning)",
        "جلسات روزانه (Daily Standups)",
        "بررسی و بازبینی اسپرینت (Sprint Review)",
        "بازتاب اسپرینت (Sprint Retrospective)",
        "مدیریت Backlog و Prioritization",
      ],
    },
    {
      id: 2,
      title: "همکاری تیمی",
      icon: "/images/teamwork.png", // مسیر عکس Teamwork
      content: [
        "اصول همکاری مؤثر در تیم‌های توسعه",
        "برقراری ارتباط مؤثر با هم‌تیمی‌ها",
        "مدیریت تعارضات در تیم",
        "نحوه ارائه بازخورد سازنده",
        "کار با ابزارهای هم‌نویسی کد (Pair Programming)",
        "مشارکت در پروژه‌های Open Source",
        "نحوه ارائه و دفاع از ایده‌ها",
      ],
    },
    {
      id: 3,
      title: "تست‌نویسی",
      icon: "/images/testing.png", // مسیر عکس Testing
      content: [
        "معرفی تست‌نویسی و انواع تست‌ها (Unit, Integration, E2E)",
        "نوشتن تست‌های Unit با Jest",
        "تست‌نویسی برای کامپوننت‌های React با React Testing Library",
        "تست‌نویسی End-to-End با Cypress",
        "ادغام تست‌ها در CI/CD Pipeline",
        "نوشتن تست‌های Mock و Stub",
        "بهینه‌سازی Coverage و گزارش‌گیری",
      ],
    },
    {
      id: 4,
      title: "توسعه حرفه‌ای",
      icon: "/images/professional.png", // مسیر عکس Professional Development
      content: [
        "نوشتن کد تمیز و قابل نگهداری (Clean Code)",
        "اصول SOLID و Design Patterns",
        "بهینه‌سازی عملکرد و Load Time",
        "کار با ابزارهای Debugging و Profiling",
        "مدیریت وابستگی‌ها با npm/yarn",
        "معرفی Webpack و Babel",
        "نحوه مستندسازی کد و پروژه‌ها",
      ],
    },
  ];

  return (
    <section className="pt-32">
      <div className="container px-5 xl:px-20 mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="text-[#042A1B]">
            <h1 className="text-4xl font-extrabold leading-[50px]">
              دوره کارآموزی حرفه‌ای
              <span className="bg-[#7AE36A] px-3 rounded-xl"> فرانت‌اند</span>
            </h1>
            <p className="text-lg text-justify font-normal leading-7 my-6">

              مداد رنگی ها مشغول بودند به جز مداد سفید، هیچکس به او کار نمیداد،
              همه میگفتند : تو به هیچ دردی نمیخوری، یک شب که مداد رنگی ها تو
              سیاهی شب گم شده بودند، مداد سفید تا صبح ماه کشید مهتاب کشید و
              انقدر ستاره کشید که کوچک و کوچکتر شد صبح توی جعبه مداد رنگی جای
              خالی او با هیچ رنگی پر نشد، به یاد هم باشیم شاید فردا ما هم در
              کنار هم نباشیم…
            </p>
            <Link
              className="bg-[#7AE36A] px-6 py-3 rounded-full font-semibold hover:bg-[#6ACD5A] transition-all"
              href="#pre-registration">
              ثبت نام
            </Link>
          </div>
          <div className="relative w-full pb-[60%]">
            <Image
              src="/images/internship-image.png"
              className="rounded-3xl"
              layout="fill"
              objectFit="cover"
              alt="Internship"
            />
          </div>
        </div>
        {/* Features */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mt-20">
          <div className="bg-[#D0DDD140] rounded-2xl p-6 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-[#042A1B]" />
            <h3 className="text-2xl font-bold mt-4">پروژه واقعی</h3>
            <p className="text-[#042A1B]/80 mt-2">تجربه کار روی محصولات واقعی</p>
          </div>

          <div className="bg-[#D0DDD140] rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 mx-auto text-[#042A1B]" />
            <h3 className="text-2xl font-bold mt-4">همکاری تیمی</h3>
            <p className="text-[#042A1B]/80 mt-2">کار در قالب تیم‌های استارتاپی</p>
          </div>

          <div className="bg-[#D0DDD140] rounded-2xl p-6 text-center">
            <GitBranch className="w-12 h-12 mx-auto text-[#042A1B]" />
            <h3 className="text-2xl font-bold mt-4">Workflow حرفه‌ای</h3>
            <p className="text-[#042A1B]/80 mt-2">آشنایی با فرایندهای Agile</p>
          </div>

          <div className="bg-[#D0DDD140] rounded-2xl p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto text-[#042A1B]" />
            <h3 className="text-2xl font-bold mt-4">گواهی معتبر</h3>
            <p className="text-[#042A1B]/80 mt-2">مدرک پایان دوره با تأیید شرکتی</p>
          </div>
        </div>
        {/* Teacher */}
        <div className="mt-32">
          <div className="text-[#042A1B] text-center">
            <h1 className="font-extrabold text-4xl ">
              منتور {" "}
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
        {/* Progress */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center">
            فرایند <span className="bg-[#7AE36A] px-3 rounded-xl">کارآموزی</span>
          </h2>
          <ProcessTimeline />
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
                className="mt-6 w-full bg-[#042A1B] text-white py-3 rounded-xl font-semibold hover:bg-[#031A12] transition-all duration-300"
                onClick={() => dispatch(addToCart({ id: nanoid(), title: "دوره حرفه ای کارآموزی فرانت اند", image: "/images/internship-image.png", price: 9000000 }))}

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
                             focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A]/30 
                             placeholder:text-[#042A1B]/50 transition-all"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#042A1B]/40" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="پست الکترونیک"
                  className="w-full p-3.5 bg-white rounded-lg border border-[#D0DDD1] 
                             focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A]/30 
                             placeholder:text-[#042A1B]/50 transition-all"
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
                         focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A]/30 
                         placeholder:text-[#042A1B]/50 transition-all"
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

        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-20">
            سوالات <span className="bg-[#7AE36A] px-3 rounded-xl">متداول</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            {accordionContent.map((item, index) => (
              <div
                key={index}
                className="border-b border-[#D0DDD1] py-5 cursor-pointer"
                onClick={() => setOpenAccordion(openAccordion === index ? -1 : index)}
              >
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium">{item.title}</p>
                  <ChevronDown className={`transform transition-transform ${openAccordion === index ? "rotate-180" : ""
                    }`} />
                </div>
                <AnimatePresence>
                  {openAccordion === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-[#042A1B]/80">{item.content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, PhoneCall } from 'lucide-react';
import FaqAccordion, { FaqItem } from '../../components/faq/FaqAccordion';

export const metadata = {
  title: 'پرسش‌های متداول و قوانین استفاده | TECHA',
  description:
    'پاسخ به سوالات پرتکرار دانشجویان درباره نحوه مطالعه مستندات، مسیر کارآموزی، ثبت‌نام، پیش‌نیاز دوره‌ها و قوانین پلتفرم تکا.',
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'start-learning',
    category: 'شروع یادگیری',
    question: 'اگر هیچ پیش‌زمینه‌ای در برنامه‌نویسی ندارم از کجا شروع کنم؟',
    answer:
      'پیشنهاد می‌کنیم ابتدا صفحه نقشه راه تکا را بررسی کنید و سپس از دوره‌های سطح مقدماتی در بخش مستندات آغاز کنید. تمام سرفصل‌های پایه به ترتیب منطقی از HTML/CSS و مفاهیم اصلی جاوااسکریپت چیده شده‌اند تا بدون ابهام به مراحل بعدی برسید.',
  },
  {
    id: 'access-docs',
    category: 'ساختار مستندات',
    question: 'آیا برای مطالعه دوره‌ها و مستندات عمومی نیاز به پرداخت هزینه یا ثبت‌نام است؟',
    answer:
      'مطالعه مستندات و درس‌های منتشرشده در کاتالوگ عمومی تکا به صورت رایگان در دسترس همه دانشجویان و علاقه‌مندان قرار دارد. ساخت حساب کاربری به شما امکان دسترسی به امکانات اختصاصی حساب و پیگیری پیشرفت در پلتفرم را می‌دهد.',
  },
  {
    id: 'blocks-system',
    category: 'ساختار مستندات',
    question: 'ساختار ۱۳ بلوکی درس‌های تکا چیست و چه مزیتی دارد؟',
    answer:
      'در تکا هر درس از ترکیب ساختارمند ۱۳ نوع بلوک محتوایی شامل متن غنی، قطعه کد تفکیک‌شده، جعبه هشدار، جدول مقایسه، چک‌لیست اجرایی، گام‌های ترتیبی، تصویر و آزمایشگاه زنده کد ساخته می‌شود تا تمرکز مطالعه بالا برود و مفاهیم پیچیده سریع‌تر درک شوند.',
  },
  {
    id: 'internship-path',
    category: 'کارآموزی و بازار کار',
    question: 'شرایط ورود به برنامه‌های کارآموزی و پروژه‌های تیمی تکا چیست؟',
    answer:
      'پس از گذراندن گام‌های فرانت‌اند یا بک‌اند مطابق نقشه راه و تکمیل تمرین‌های عملی، می‌توانید از طریق صفحه تماس با ما درخواست ارزیابی فنی خود را ثبت کنید تا پس از مصاحبه کوتاه علمی، وارد تیم‌های پروژه شوید.',
  },
  {
    id: 'account-auth',
    category: 'حساب کاربری',
    question: 'چگونه می‌توانم با شماره موبایل در تکا ثبت‌نام و ورود کنم؟',
    answer:
      'از دکمه «ورود / ثبت‌نام» در بالای صفحه استفاده کنید. ثبت‌نام با شماره موبایل استاندارد ایران (09xxxxxxxxx) و تعیین رمز عبور امن انجام می‌شود و نشست شما از طریق کوکی‌های رمزنگاری‌شده امن (HttpOnly) محافظت می‌گردد.',
  },
  {
    id: 'terms-usage',
    category: 'قوانین و حریم خصوصی',
    question: 'شرایط بازنشر یا استفاده آموزشی از مستندات تکا چگونه است؟',
    answer:
      'تمامی محتوای آموزشی و کدهای نمونه در راستای ارتقای دانش مهندسی نرم‌افزار در کشور تهیه شده‌اند. استفاده شخصی و کلاسی در محیط‌های دانشگاهی با ذکر منبع تکا بلامانع است، اما کپی‌برداری تجاری بدون هماهنگی رسمی مجاز نیست.',
  },
];

export default function FaqPage() {
  return (
    <div className="w-full bg-slate-50 text-gray-900">
      {/* Header Band */}
      <section className="bg-[#042A1B] text-white py-12 sm:py-16 border-b border-[#7AE36A]/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
            <HelpCircle className="h-4 w-4" />
            <span>راهنمای پلتفرم و پاسخ به پرسش‌ها</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            پرسش‌های متداول و قوانین استفاده
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            پاسخ شفاف به سوالات رایج درباره روش مطالعه مستندات، مسیر کارآموزی، ثبت‌نام و استانداردهای استفاده از سامانه تکا.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          <FaqAccordion items={FAQ_ITEMS} />

          {/* Still Need Help Card */}
          <div className="bg-[#042A1B] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#7AE36A]/20">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-black text-white">
                پاسخ سوال خود را پیدا نکردید؟
              </h2>
              <p className="text-xs sm:text-sm text-white/75">
                پرسش خود را از طریق فرم تماس ارسال کنید یا با شماره پشتیبانی تکا تماس بگیرید.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7AE36A] text-[#042A1B] font-bold text-xs sm:text-sm rounded-xl hover:bg-[#6acf5a] transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                <span>تماس با ما</span>
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors"
              >
                <span>بازگشت به دوره‌ها</span>
                <ArrowLeft className="h-4 w-4 text-[#7AE36A]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

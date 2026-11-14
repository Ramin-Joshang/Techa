'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  PhoneCall,
  Mail,
  MapPin,
  CheckCircle2,
  Send,
  GraduationCap,
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#042A1B] text-white relative pt-20 pb-10 border-t border-[#7AE36A]/20 overflow-hidden">
      {/* Decorative Wave Banner at top of footer */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/20 to-transparent" />

      <div className="container mx-auto px-5 xl:px-20 relative z-10">
        {/* Top Newsletter Card (Authentic #7AE36A Green Banner) */}
        <div className="rounded-3xl bg-[#7AE36A] text-[#042A1B] p-6 sm:p-10 mb-16 shadow-2xl shadow-black/40 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-right max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black mb-1 text-[#042A1B]">
              عضویت در خبرنامه آموزشی تکا
            </h3>
            <p className="text-sm sm:text-base font-medium text-[#042A1B]/80">
              از انتشار دوره‌های جدید، به‌روزرسانی مستندات فنی و رویدادهای تخصصی مطلع شوید.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex flex-wrap items-center gap-2 bg-[#042A1B] text-white px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md">
                <CheckCircle2 className="h-5 w-5 text-[#7AE36A] shrink-0" />
                <span>با تشکر! عضویت شما در خبرنامه با موفقیت ثبت شد.</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row items-center gap-2 bg-white/95 p-1.5 rounded-2xl shadow-inner w-full lg:w-[420px] max-w-full"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل خود را وارد کنید..."
                  required
                  className="w-full px-4 py-2.5 text-[#042A1B] text-sm font-medium placeholder-gray-400 bg-transparent focus:outline-none"
                  style={{ direction: 'ltr' }}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#042A1B] text-white hover:bg-[#073d27] rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0"
                >
                  <Send className="h-4 w-4 text-[#7AE36A]" />
                  <span>عضویت</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main 4-Column Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-44 h-12">
                <Image
                  src="/images/logo-light.svg"
                  alt="تکا - سامانه آموزشی برنامه‌نویسی"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-white/70 text-xs sm:text-sm leading-7 text-right">
              پلتفرم توانمندسازی و مهارت‌افزایی تکا، بستری سریع و ساختاریافته برای دانشجویان و علاقه‌مندان فراهم نموده تا بتوانند مسیر حرفه‌ای خود را در عرصه توسعه نرم‌افزار و سامانه‌های مدرن وب با استانداردهای واقعی بسازند.
            </p>
          </div>

          {/* Column 2: Educational Documentation */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#7AE36A] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>مستندات و دوره‌ها</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/75">
              <li>
                <Link href="/" className="hover:text-[#7AE36A] transition-colors">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-[#7AE36A] transition-colors">
                  کاتالوگ کامل دوره‌ها
                </Link>
              </li>
              <li>
                <Link href="/docs?level=beginner" className="hover:text-[#7AE36A] transition-colors">
                  دوره‌های سطح مقدماتی
                </Link>
              </li>
              <li>
                <Link href="/docs?level=intermediate" className="hover:text-[#7AE36A] transition-colors">
                  دوره‌های سطح متوسط
                </Link>
              </li>
              <li>
                <Link href="/docs?level=advanced" className="hover:text-[#7AE36A] transition-colors">
                  دوره‌های پیشرفته مهندسی نرم‌افزار
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Student & Educational Guide */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#7AE36A] uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>راهنمای دانشجویان</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/75">
              <li>
                <Link href="/roadmap" className="hover:text-[#7AE36A] transition-colors">
                  نقشه راه مهندسی نرم‌افزار
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#7AE36A] transition-colors">
                  درباره آکادمی و ماموریت تکا
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#7AE36A] transition-colors">
                  پرسش‌های متداول و راهنما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#7AE36A] transition-colors">
                  تماس با ما و مشاوره آموزشی
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-[#7AE36A] transition-colors">
                  فهرست مستندات ساختاریافته
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#7AE36A] uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              <span>ارتباط با تکا</span>
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <PhoneCall className="h-4 w-4 text-[#7AE36A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-white/50">شماره تماس ثابت:</span>
                  <a
                    href="tel:02182800003"
                    className="font-bold text-white hover:text-[#7AE36A] tracking-wider"
                    style={{ direction: 'ltr' }}
                  >
                    021-82800003
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#7AE36A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-white/50">پست الکترونیکی:</span>
                  <a
                    href="mailto:info@techa.ir"
                    className="font-mono text-white hover:text-[#7AE36A]"
                  >
                    info@techa.ir
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#7AE36A] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] text-white/50">آدرس:</span>
                  <span>تهران، خیابان آزادی، مجموعه دانشگاهی و شتابدهنده تکا</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>
            تمامی حقوق مادی و معنوی این سامانه متعلق به <strong className="text-white">تکا (TECHA)</strong> می‌باشد.
          </p>
          <div className="flex items-center gap-2 text-white/50">
            <span>توسعه یافته بر پایه استانداردهای مدرن وب ایران</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

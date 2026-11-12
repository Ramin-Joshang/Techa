import React from 'react';
import Link from 'next/link';
import { Clock, Mail, MapPin, PhoneCall, HelpCircle, ArrowLeft } from 'lucide-react';
import ContactForm from '../../components/contact/ContactForm';

export const metadata = {
  title: 'تماس با ما | پلتفرم آموزشی تکا',
  description:
    'راه‌های ارتباطی رسمی با پلتفرم آموزشی تکا، شماره تلفن پشتیبانی، پست الکترونیکی، نشانی مجموعه دانشگاهی و فرم ارسال مستقیم پیام.',
};

export default function ContactPage() {
  return (
    <div className="w-full bg-slate-50 text-gray-900">
      {/* Header Band */}
      <section className="bg-[#042A1B] text-white py-12 sm:py-16 border-b border-[#7AE36A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
            <PhoneCall className="h-4 w-4" />
            <span>ارتباط مستقیم با تیم تکا</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            تماس با ما و پشتیبانی آموزشی
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            برای دریافت مشاوره انتخاب دوره، طرح پیشنهادهای همکاری دانشگاهی یا پیگیری موضوعات فنی، از کانال‌های رسمی زیر یا فرم مستقیم تماس استفاده کنید.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Contact Channels Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 space-y-6 shadow-xs">
                <h2 className="text-lg font-black text-gray-950 border-b border-gray-100 pb-3">
                  اطلاعات تماس رسمی
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <PhoneCall className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">تلفن پشتیبانی و مشاوره</p>
                      <a
                        href="tel:02182800003"
                        dir="ltr"
                        className="text-base font-black text-gray-950 hover:text-emerald-700 transition-colors font-mono inline-block mt-0.5"
                      >
                        021-82800003
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">پست الکترونیکی رسمی</p>
                      <a
                        href="mailto:info@techa.ir"
                        className="text-base font-bold text-gray-950 hover:text-emerald-700 transition-colors font-mono inline-block mt-0.5"
                      >
                        info@techa.ir
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">نشانی دفتر مرکزی و شتابدهنده</p>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed mt-0.5">
                        تهران، خیابان آزادی، مجموعه دانشگاهی و شتابدهنده تکا
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">ساعات پاسخگویی</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        شنبه تا چهارشنبه: ۹:۰۰ تا ۱۷:۰۰
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Help Card */}
              <div className="bg-[#042A1B] text-white rounded-3xl p-6 space-y-3 border border-[#7AE36A]/20">
                <div className="flex items-center gap-2 text-[#7AE36A] text-xs font-bold">
                  <HelpCircle className="h-4 w-4" />
                  <span>پاسخ سریع‌تر می‌خواهید؟</span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  بسیاری از پرسش‌ها درباره نحوه شروع یادگیری، پیش‌نیاز دوره‌ها و ثبت‌نام در بخش سوالات متداول پاسخ داده شده‌اند.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7AE36A] hover:underline pt-1"
                >
                  <span>مشاهده سوالات متداول</span>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Form Column */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

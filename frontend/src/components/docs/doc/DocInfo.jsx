import React, { useState } from 'react';
import { CalendarClock, Timer, ChevronDown, BarChart, Users, Layers } from 'lucide-react';
import { useSelector } from 'react-redux';
import { formatDuration } from "../../../helper";

// در صورت نیاز ایمپورت اسکلتون‌ها را بررسی و تنظیم کنید
import DocDescriptionSkeleton from './DocDescriptionSkeleton';
import DocInfoCardSkeleton from './DocInfoCardSkeleton';

// ==========================================
// 1. کامپوننت توضیحات مستند (Modernized)
// ==========================================
const ModernDocDescription = ({ description }) => {
    const [showFull, setShowFull] = useState(false);

    // جداسازی پاراگراف‌ها بر اساس \r\n (اینتر) موجود در دیتای جدید
    const formatted = description
        ?.split(/\r?\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p class="mb-4 text-justify leading-relaxed">${p}</p>`)
        .join('');

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-emerald-500 rounded-full inline-block"></span>
                درباره این مستند
            </h2>

            <div className="relative">
                <div
                    className={`overflow-hidden transition-all duration-700 ease-in-out text-gray-600 font-medium text-[16px] md:text-[17px] ${showFull ? 'max-h-[2000px]' : 'max-h-[140px]'
                        }`}
                >
                    <div dangerouslySetInnerHTML={{ __html: formatted || description }} />
                </div>

                {/* گرادیان محو کننده متن برای حالت بسته بودن */}
                {!showFull && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                )}
            </div>

            <button
                onClick={() => setShowFull(!showFull)}
                className="mt-4 flex items-center justify-center w-full md:w-auto font-bold gap-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-6 py-2.5 rounded-xl transition-colors duration-300 mx-auto md:mx-0"
            >
                {showFull ? 'بستن توضیحات' : 'مشاهده کامل توضیحات'}
                <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${showFull ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
};

// ==========================================
// 2. کامپوننت کارت اطلاعات (Modernized)
// ==========================================
const ModernDocInfoCard = ({ icon, label, value }) => {
    return (
        <div className="group bg-gradient-to-br from-[#f2fcf4] to-[#e6f8ea] border border-[#d0edd5] rounded-3xl py-6 px-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1 overflow-hidden relative">
            {/* افکت نوری پس‌زمینه */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl group-hover:bg-emerald-300/50 transition-colors duration-500"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="bg-white p-3.5 rounded-2xl shadow-sm text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {icon}
                </div>
                <div>
                    <p className="text-emerald-800/60 text-sm font-semibold mb-1">{label}</p>
                    <h4 className="text-gray-900 font-black text-xl">{value}</h4>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. کامپوننت اطلاعات تکمیلی (مخاطبین و پیش‌نیازها)
// ==========================================
const ExtraInfoSection = ({ targetAudience, prerequisites }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* مخاطبین هدف */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">مخاطبین این دوره</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed text-justify font-medium">
                    {targetAudience || 'اطلاعاتی ثبت نشده است.'}
                </p>
            </div>

            {/* پیش‌نیازها */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500">
                        <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">پیش‌نیازها</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed text-justify font-medium">
                    {prerequisites ? prerequisites : 'این دوره پیش‌نیازی ندارد و از پایه آموزش داده می‌شود.'}
                </p>
            </div>
        </div>
    );
};

// ==========================================
// 4. کامپوننت اصلی (DocInfo)
// ==========================================
const DocInfo = ({ docDetails }) => {
    const { loading } = useSelector(state => state.docs);

    // مدیریت تاریخ جلالی
    const gregorianDate = docDetails?.LastContentModifiedDate;
    const faDate = gregorianDate
        ? new Date(gregorianDate).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'نامشخص';

    // ترجمه سطح دوره
    const translateLevel = (level) => {
        const levels = {
            'Beginner': 'مبتدی',
            'Intermediate': 'متوسط',
            'Advanced': 'پیشرفته'
        };
        return levels[level] || level || 'نامشخص';
    };

    // حالت بارگذاری
    if (loading || !docDetails) {
        return (
            <div className="animate-pulse space-y-6">
                <DocDescriptionSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, index) => (
                        <DocInfoCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* توضیحات مستند */}
            <ModernDocDescription description={docDetails?.Description} />

            {/* کارت‌های اطلاعات کلیدی (به ۳ ستون تغییر یافت) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <ModernDocInfoCard
                    icon={<Timer className='w-8 h-8' strokeWidth={2.5} />}
                    label="مدت زمان مطالعه"
                    value={formatDuration(docDetails?.Duration)}
                />
                <ModernDocInfoCard
                    icon={<BarChart className='w-8 h-8' strokeWidth={2.5} />}
                    label="سطح دوره"
                    value={translateLevel(docDetails?.Level)}
                />
                <ModernDocInfoCard
                    icon={<CalendarClock className='w-8 h-8' strokeWidth={2.5} />}
                    label="آخرین بروزرسانی"
                    value={faDate}
                />
            </div>

            {/* بخش مخاطبین هدف و پیش‌نیازها */}
            <ExtraInfoSection
                targetAudience={docDetails?.targetAudience}
                prerequisites={docDetails?.Prerequisites}
            />
        </div>
    );
};

export default DocInfo;

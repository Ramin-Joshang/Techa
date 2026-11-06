// src/components/DocCard.jsx
import React from 'react';
import Link from 'next/link';

// src/components/IconProvider.jsx
import * as RiIcons from 'react-icons/ri';

// آیکون پیش‌فرض برای مواردی که آیکون مشخص نشده یا پیدا نمی‌شود
const DefaultIcon = RiIcons.RiBook2Line;

const IconProvider = ({ name, ...props }) => {
    // اگر نام آیکون در لیست آیکون‌های react-icons/ri وجود داشت، آن را برمی‌گردانیم
    const IconComponent = RiIcons[name];

    if (IconComponent) {
        return <IconComponent {...props} />;
    }

    // در غیر این صورت، آیکون پیش‌فرض را نمایش می‌دهیم
    return <DefaultIcon {...props} />;
};



// آبجکت برای ترجمه و استایل‌دهی سطوح
const levelConfig = {
    Beginner: {
        text: 'مبتدی',
        styles: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    Advanced: {
        text: 'پیشرفته',
        styles: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    Intermediate: {
        text: 'متوسط',
        styles: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    Unknown: {
        text: 'نامشخص',
        styles: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    },
};

const DocCard = ({ doc }) => {
    const levelInfo = levelConfig[doc?.Level] || levelConfig.Unknown;

    return (
        <Link href={`/docs/${doc?.Slug}`} className="block h-full">
            <div className="group relative flex flex-col h-full p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/20 via-white dark:from-emerald-900/10 dark:via-slate-800/50">

                {/* شماره ترتیب (Sort Index) */}
                <div className="absolute top-5 left-0 text-7xl font-black font-mono text-slate-100 dark:text-slate-900/40 select-none -z-0 transform -translate-y-2 translate-x-4">
                    {doc?.SortIndex}
                </div>

                {/* هدر کارت: آیکون و عنوان */}
                <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <IconProvider name={doc?.Icon} size={30} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">
                        {doc?.Title}
                    </h3>
                </div>

                {/* بدنه کارت: خلاصه توضیحات */}
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 flex-grow relative z-10 leading-relaxed">
                    {doc?.Summary}
                </p>

                {/* فوتر کارت: سطح و دکمه مطالعه */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${levelInfo.styles}`}>
                        {levelInfo.text}
                    </span>

                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
                        شروع یادگیری
                        <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default DocCard;

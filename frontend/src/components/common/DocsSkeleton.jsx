import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DocsSkeleton = () => {
    return (
        /* کانتینر اصلی گرید هماهنگ با صفحه Docs */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                    {/* بخش هدر کارت (آیکون و سطح) */}
                    <div className="p-6 pb-0">
                        <div className="flex justify-between items-start">
                            {/* جایگزین آیکون (IconProvider) */}
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                                <Skeleton width={40} height={40} borderRadius="0.75rem" baseColor="#ecfdf5" highlightColor="#d1fae5" />
                            </div>

                            {/* جایگزین بج سطح (Level Badge) */}
                            <Skeleton width={70} height={24} borderRadius="999px" baseColor="#f3f4f6" />
                        </div>

                        {/* جایگزین عنوان (Title) */}
                        <div className="mt-6">
                            <Skeleton height={24} width="80%" />
                        </div>
                    </div>

                    {/* بخش بدنه (Summary) */}
                    <div className="p-6 flex-grow">
                        <div className="space-y-2">
                            <Skeleton count={2} height={14} width="100%" />
                            {/* <Skeleton height={14} width="60%" /> */}
                        </div>
                    </div>

                    {/* بخش فوتر (Action Button) */}
                    <div className="p-6 pt-0 mt-auto border-t border-gray-50 flex items-center justify-between">
                        {/* شبیه‌سازی متن "مشاهده مستندات" */}
                        <Skeleton width={100} height={16} />

                        {/* دکمه دایره‌ای یا فلش کنار دکمه */}
                        <Skeleton circle width={32} height={32} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocsSkeleton;

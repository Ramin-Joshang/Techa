// components/common/LoadingSpinner.tsx
"use client";



export default function LoadingSpinner({
    text = "در حال بارگذاری...",
    fullScreen = false,
}) {
    const container = fullScreen
        ? "fixed inset-0 bg-white/70 backdrop-blur-sm z-[9999] flex items-center justify-center"
        : "flex items-center justify-center py-12";

    return (
        <div className={container}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                    {/* نقطه مرکزی برای زیبایی بیشتر */}
                    <div className="absolute w-4 h-4 bg-primary-600 rounded-full animate-pulse"></div>
                </div>

                {text && (
                    <p className="text-gray-600 font-medium tracking-wide">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}
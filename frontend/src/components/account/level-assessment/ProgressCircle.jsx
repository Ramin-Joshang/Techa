const ProgressCircle = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = 'stroke-emerald-500',
    className = ''
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative group ${className}`} style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="stroke-emerald-100/80 fill-transparent"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className={`${color} fill-transparent transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]`}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="text-3xl font-bold text-emerald-600 drop-shadow-sm">
                    {Math.round(progress)}%
                </span>
                <span className="text-xs font-medium text-emerald-500/80 tracking-wide">
                    تکمیل شده
                </span>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl group-hover:opacity-40 opacity-0 transition-opacity duration-300" />
        </div>
    );
};

export default ProgressCircle;
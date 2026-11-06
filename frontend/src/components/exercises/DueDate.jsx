// components/DueDate.js
"use client";

const DueDate = ({ utcDate }) => {
    if (!utcDate) return <span>—</span>;

    const date = new Date(utcDate);

    // تبدیل به ساعت ایران و فرمت فارسی
    const formatter = new Intl.DateTimeFormat("fa-IR", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

    const formatted = formatter.format(date);

    // محاسبه وضعیت مهلت
    const now = new Date();
    const iranOffset = 3.5 * 60; // دقیقه
    const localOffset = now.getTimezoneOffset();
    const diff = iranOffset + localOffset;
    const nowIran = new Date(now.getTime() + diff * 60 * 1000);

    const diffDays = (date - nowIran) / (1000 * 60 * 60 * 24);

    let status = "";
    let color = "text-gray-800";

    if (diffDays < 0) {
        status = "مهلت گذشته";
        color = "text-red-600";
    } else if (diffDays <= 2) {
        status = "نزدیک به اتمام";
        color = "text-orange-500";
    } else {
        status = "فعال";
        color = "text-green-600";
    }

    return (
        <div className="flex flex-col">
            {/* <span className={color}>{status}</span> */}
            <span className={`text-sm text-gray-500 ${color}`}>{formatted}</span>
        </div>
    );
};

export default DueDate;

"use client";
import { motion } from 'framer-motion';

const persianLabels = {
    maritalStatus: "وضعیت تأهل",
    birthDate: "تاریخ تولد",
    phone: "شماره تماس",
    city: "شهر",
    militaryStatus: "وضعیت نظام وظیفه",
    address: "آدرس",
    startDate: "تاریخ شروع فعالیت",
    workExperience: "سابقه کار",
    residenceStatus: "وضعیت اقامت",
    jobStatus: "وضعیت اشتغال"
};

const PersonalInfoSection = ({ personalInfo, handleChange }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 p-8 rounded-2xl mb-8 shadow-lg border-2 border-emerald-100"
    >
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">
            <span className="mr-2">👤</span>
            اطلاعات شخصی
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(personalInfo).map((key) => (
                <motion.div
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative group"
                >
                    <label className="block text-sm font-medium text-emerald-600 mb-2">
                        {persianLabels[key]}
                    </label>

                    <div className="relative">
                        <motion.input
                            type="text"
                            name={key}
                            value={personalInfo[key]}
                            onChange={(e) => handleChange(e, 'personalInfo')}
                            className="w-full p-3 pr-10 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            whileFocus={{ scale: 1.02 }}
                        />

                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
                            {getIconForField(key)}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

const getIconForField = (field) => {
    const icons = {
        maritalStatus: '💍',
        birthDate: '🎂',
        phone: '📱',
        city: '🏙️',
        militaryStatus: '🎖️',
        address: '🏠',
        startDate: '📅',
        workExperience: '💼',
        residenceStatus: '🌍',
        jobStatus: '👔'
    };
    return icons[field] || '📝';
};

export default PersonalInfoSection;
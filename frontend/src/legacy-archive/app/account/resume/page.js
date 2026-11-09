"use client";
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import Link from 'next/link';
import {
    User, Briefcase, GraduationCap, Code, Award,
    FileText, Globe, Layers, Eye, Save, ChevronRight,
    LayoutDashboard, CheckCircle2, Menu, X
} from 'lucide-react';

// ایمپورت کامپوننت‌های شما (فرض بر این است که این‌ها وجود دارند)
import LanguagesSection from "../../../components/account/resume/LanguagesSection";
import PersonalInfoSection from "../../../components/account/resume/PersonalInfoSection";
import AchievementsSection from "../../../components/account/resume/AchievementsSection";
import CertificatesSection from "../../../components/account/resume/CertificatesSection";
import ProjectsSection from "../../../components/account/resume/ProjectsSection";
import SkillsSection from "../../../components/account/resume/SkillsSection";

// --- تنظیمات منو ---
const menuItems = [
    { id: 'info', label: 'اطلاعات پایه', icon: User, description: 'مشخصات فردی و تماس' },
    { id: 'about', label: 'درباره من', icon: FileText, description: 'خلاصه حرفه‌ای' },
    { id: 'skills', label: 'مهارت‌ها', icon: Code, description: 'تکنولوژی‌ها و زبان‌ها' },
    { id: 'experiences', label: 'سوابق شغلی', icon: Briefcase, description: 'تجربیات کاری' },
    { id: 'education', label: 'تحصیلات', icon: GraduationCap, description: 'دانشگاه و مدارک' },
    { id: 'projects', label: 'پروژه‌ها', icon: Layers, description: 'نمونه کارها' },
    { id: 'achievements', label: 'افتخارات', icon: Award, description: 'جوایز و گواهینامه‌ها' },
    { id: 'social', label: 'شبکه‌های اجتماعی', icon: Globe, description: 'لینکدین، گیت‌هاب...' },
];

const DashboardResume = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [completionRate, setCompletionRate] = useState(0);

    const [profile, setProfile] = useState({
        name: "رامین جوشنگ",
        title: "توسعه دهنده فول استک",
        image: "/images/teacher.jpeg",
        email: "",
        linkedin: "",
        github: "",
        website: "",
        about: "",
        languages: ["فارسی", "انگلیسی"],
        personalInfo: {
            maritalStatus: "",
            birthDate: "",
            phone: "",
            city: "",
            address: "",
        },
        education: [],
        certificatesData: [],
        skills: [],
        experiences: [],
        projects: [],
        achievements: [],
    });

    // محاسبه درصد تکمیل پروفایل (ساده شده)
    useEffect(() => {
        let score = 0;
        if (profile.name) score += 10;
        if (profile.title) score += 10;
        if (profile.about) score += 10;
        if (profile.skills.length > 0) score += 20;
        if (profile.experiences.length > 0) score += 20;
        if (profile.education.length > 0) score += 15;
        if (profile.projects.length > 0) score += 15;
        setCompletionRate(Math.min(score, 100));
    }, [profile]);

    // هندلر عمومی تغییرات
    const handleChange = (e, section, index, nestedKey) => {
        const { name, value } = e.target;
        // منطق هندل کردن استیت (مشابه کد قبلی شما، اینجا خلاصه شده برای تمرکز بر UI)
        // ... (کد هندلر استیت شما اینجا قرار می‌گیرد)
        // برای دمو فقط لاگ می‌گیریم
        console.log(`Updating ${section || name}: ${value}`);
    };

    // توابع کمکی افزودن/حذف (مشابه کد شما)
    const addItem = (section, initialData) => {
        setProfile(prev => ({
            ...prev,
            [section]: [...prev[section], initialData]
        }));
    };

    const deleteItem = (section, index) => {
        setProfile(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">

            {/* --- Header --- */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 text-white p-2 rounded-xl">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">رزومه ساز حرفه‌ای</h1>
                            <p className="text-xs text-slate-500">ویرایشگر نسخه ۲.۰</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-xs text-slate-500 mb-1">تکمیل پروفایل: {completionRate}%</span>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                        <Link href="/resume" className="hidden sm:flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm">
                            <Eye size={18} />
                            پیش‌نمایش
                        </Link>
                        <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-95 font-medium text-sm">
                            <Save size={18} />
                            ذخیره تغییرات
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">

                    {/* --- Sidebar Navigation --- */}
                    <aside className={`col-span-12 md:col-span-3 lg:col-span-3 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <img src={profile.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-sm truncate">{profile.name}</h3>
                                        <p className="text-xs text-slate-500 truncate">{profile.title}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="p-2 space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-right ${activeTab === item.id
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <item.icon size={20} className={activeTab === item.id ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-500'} />
                                        <div className="flex-1">
                                            <span className="block text-sm font-medium">{item.label}</span>
                                            {activeTab === item.id && (
                                                <span className="block text-[10px] text-indigo-200 mt-0.5 opacity-90">{item.description}</span>
                                            )}
                                        </div>
                                        {activeTab === item.id && <ChevronRight size={16} className="opacity-50" />}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* --- Main Content Area --- */}
                    <div className="col-span-12 md:col-span-9 lg:col-span-9">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl shadow-sm border border-slate-200 min-h-[600px] relative overflow-hidden"
                            >
                                {/* Background decoration */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                <div className="p-6 lg:p-10">
                                    <div className="mb-8 pb-4 border-b border-slate-100 flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                                {menuItems.find(i => i.id === activeTab)?.icon && (
                                                    <span className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                                        {(() => {
                                                            const Icon = menuItems.find(i => i.id === activeTab).icon;
                                                            return <Icon size={24} />;
                                                        })()}
                                                    </span>
                                                )}
                                                {menuItems.find(i => i.id === activeTab)?.label}
                                            </h2>
                                            <p className="text-slate-500 mt-2 text-sm">
                                                اطلاعات مربوط به {menuItems.find(i => i.id === activeTab)?.label} خود را در این بخش مدیریت کنید.
                                            </p>
                                        </div>
                                        <div className="hidden sm:block text-slate-300">
                                            <CheckCircle2 size={48} className="opacity-20" />
                                        </div>
                                    </div>

                                    {/* --- Dynamic Content Render --- */}
                                    <div className="space-y-6">

                                        {activeTab === 'info' && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="col-span-full flex justify-center mb-4">
                                                        <div className="relative group cursor-pointer">
                                                            <img src={profile.image} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-md transition-transform group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-white text-xs font-bold">تغییر تصویر</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <InputField label="نام و نام خانوادگی" value={profile.name} name="name" onChange={handleChange} />
                                                    <InputField label="عنوان شغلی" value={profile.title} name="title" onChange={handleChange} />
                                                    <PersonalInfoSection personalInfo={profile.personalInfo} handleChange={handleChange} />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'about' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">درباره من</label>
                                                <textarea
                                                    className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 leading-relaxed"
                                                    placeholder="خلاصه‌ای از تجربیات و اهداف خود بنویسید..."
                                                    value={profile.about}
                                                    onChange={(e) => handleChange(e, 'about')}
                                                ></textarea>
                                                <p className="text-xs text-slate-400 mt-2 text-left">حداقل ۲۰۰ کاراکتر توصیه می‌شود</p>
                                            </div>
                                        )}

                                        {activeTab === 'skills' && (
                                            <>
                                                <div className="bg-indigo-50 p-4 rounded-xl mb-6 flex items-center gap-3 text-indigo-800 text-sm">
                                                    <Code size={20} />
                                                    مهارت‌ها قلب رزومه شما هستند. مهم‌ترین‌ها را در ابتدا قرار دهید.
                                                </div>
                                                <SkillsSection
                                                    skills={profile.skills}
                                                    handleChange={handleChange}
                                                    addSkill={() => addItem('skills', { name: "", level: 50 })}
                                                    deleteSkill={(idx) => deleteItem('skills', idx)}
                                                />
                                                <LanguagesSection
                                                    languages={profile.languages}
                                                    handleChange={handleChange}
                                                    addLanguage={() => addItem('languages', "")}
                                                    deleteLanguage={(idx) => deleteItem('languages', idx)}
                                                />
                                            </>
                                        )}

                                        {activeTab === 'experiences' && (
                                            <ProjectsSection // Assuming ProjectsSection structure can be reused or this is the placeholder for Experiences
                                                projects={profile.experiences}
                                                title="سوابق شغلی"
                                                handleChange={handleChange}
                                                addProject={() => addItem('experiences', { position: "", company: "", year: "" })}
                                                deleteProject={(idx) => deleteItem('experiences', idx)}
                                            />
                                        )}

                                        {activeTab === 'projects' && (
                                            <ProjectsSection
                                                projects={profile.projects}
                                                title="پروژه‌های انجام شده"
                                                handleChange={handleChange}
                                                addProject={() => addItem('projects', { title: "", role: "" })}
                                                deleteProject={(idx) => deleteItem('projects', idx)}
                                            />
                                        )}

                                        {activeTab === 'education' && (
                                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                                                {/* Placeholder for Education Component */}
                                                <GraduationCap size={48} className="mx-auto mb-4 opacity-20" />
                                                <p>بخش تحصیلات (از کامپوننت مربوطه استفاده کنید)</p>
                                                {/* <EducationSection ... /> */}
                                            </div>
                                        )}

                                        {activeTab === 'achievements' && (
                                            <>
                                                <CertificatesSection
                                                    certificatesData={profile.certificatesData}
                                                    handleChange={handleChange}
                                                    addCertificate={() => addItem('certificatesData', { title: "" })}
                                                    deleteCertificate={(idx) => deleteItem('certificatesData', idx)}
                                                />
                                                <div className="my-8 border-t border-slate-100"></div>
                                                <AchievementsSection
                                                    achievements={profile.achievements}
                                                    handleChange={handleChange}
                                                    addAchievement={() => addItem('achievements', { title: "" })}
                                                    deleteAchievement={(idx) => deleteItem('achievements', idx)}
                                                />
                                            </>
                                        )}

                                        {activeTab === 'social' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField icon={<Globe size={18} />} label="وبسایت شخصی" value={profile.website} name="website" onChange={handleChange} dir="ltr" />
                                                <InputField icon={<span className="font-bold">in</span>} label="لینکدین" value={profile.linkedin} name="linkedin" onChange={handleChange} dir="ltr" />
                                                <InputField icon={<span className="font-bold">Gh</span>} label="گیت‌هاب" value={profile.github} name="github" onChange={handleChange} dir="ltr" />
                                            </div>
                                        )}

                                    </div>

                                    {/* --- Bottom Actions --- */}
                                    <div className="mt-12 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                        <button className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                                            انصراف
                                        </button>
                                        <button className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-medium flex items-center gap-2">
                                            <Save size={18} />
                                            ذخیره این بخش
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- کامپوننت‌های کمکی UI ---

const InputField = ({ label, value, name, onChange, type = "text", dir = "rtl", icon }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                dir={dir}
                className={`w-full p-3 ${icon ? 'pl-10' : ''} rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white text-slate-800`}
            />
        </div>
    </div>
);

export default DashboardResume;
"use client"
import React, { useEffect, useState, useMemo } from 'react';
import {
    GraduationCap, Code2, Layout, FileJson, Palette, Atom,
    ClipboardCheck, Target, Briefcase, Github, Users, Terminal,
    GitPullRequest, Compass, TestTube, Activity, Magnet,
    Rocket, FileText, TrendingUp, Building, Trophy,
    X, ChevronLeft, Info
} from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoadmap } from '../../../features/account/roadmap/roadmapActions';
import MilestoneCard from "../../../components/account/MilestoneCard"
// نقشه آیکون‌ها برای تبدیل String به Component
const ICON_MAP = {
    GraduationCap, Code2, Layout, FileJson, Palette, Atom,
    ClipboardCheck, Target, Briefcase, Github, Users, Terminal,
    GitPullRequest, Compass, TestTube, Activity, Magnet,
    Rocket, FileText, TrendingUp, Building, Trophy
};

const App = () => {

    const dispatch = useDispatch();
    const { milestones, loading, progressPercentage, currentStep } = useSelector(state => state.roadmap);
    console.log(milestones)

    // State های مودال
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    useEffect(() => {
        dispatch(fetchUserRoadmap());
    }, [dispatch]);

    // ۱. تبدیل داده‌های Flat به ساختار درختی (Phases)
    const phases = useMemo(() => {
        if (!milestones || milestones.length === 0) return [];

        const grouped = milestones.reduce((acc, item) => {
            const phaseId = item.PhaseID;
            if (!acc[phaseId]) {
                acc[phaseId] = {
                    id: phaseId,
                    title: item.PhaseTitle,
                    color: item.Color || 'from-emerald-400 to-emerald-600',
                    // آیکون فاز را بر اساس اولین آیتم یا منطق دلخواه ست می‌کنیم
                    icon: phaseId === 1 ? GraduationCap : phaseId === 2 ? Briefcase : phaseId === 3 ? Compass : Rocket,
                    milestones: []
                };
            }
            acc[phaseId].milestones.push({
                ...item,
                id: item.MilestoneID, // هماهنگی با پروپ‌های قبلی
                icon: ICON_MAP[item.IconName] || Info, // تبدیل رشته به کامپوننت
                description: item.Description || "توضیحاتی برای این مرحله ثبت نشده است." // در خروجی دیتابیس شما نبود، اضافه شد
            });
            return acc;
        }, {});

        return Object.values(grouped);
    }, [milestones]);

    // پیدا کردن اطلاعات مرحله فعلی برای هدر
    const currentMilestoneInfo = useMemo(() =>
        milestones.find(m => m.MilestoneID === currentStep),
        [milestones, currentStep]);

    const handleMilestoneClick = (milestone) => {
        setSelectedMilestone(milestone);
        setIsModalOpen(true);
    };

    if (loading && milestones.length === 0) {
        return <div className="flex justify-center items-center h-screen font-bold">در حال بارگذاری مسیر...</div>;
    }

    return (
        <div className="bg-gray-50/50 selection:bg-teal-100 selection:text-teal-900 relative">

            {/* Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-80 h-80 bg-lime-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm -mt-10 relative z-10">
                <div className="mx-auto px-4 sm:px-6 py-2">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3 group">
                            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all">
                                <Trophy className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-gray-800">مسیر فرانت‌اند</h1>
                                <p className="text-[11px] text-gray-500 font-bold">بر اساس پیشرفت شما</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-sm hidden sm:block">
                            <div className="bg-white/50 border border-white/60 p-3 rounded-2xl shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-600">پیشرفت کلی</span>
                                    <span className="text-sm font-black text-emerald-600">{progressPercentage}٪</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-1000"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 sm:px-6 py-12 relative z-10">
                {/* Mobile Stats */}
                <div className="sm:hidden mb-10 p-5 bg-white rounded-3xl border border-emerald-100 shadow-xl">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">مرحله فعلی</span>
                    <span className="text-sm font-black text-gray-800">{currentMilestoneInfo?.Title || '---'}</span>
                    <div className="h-2 w-full bg-gray-100 rounded-full mt-3">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className="relative">
                    {/* Vertical Lines */}
                    <div className="absolute right-4 md:right-[2rem] top-6 bottom-0 w-1.5 bg-gray-200/60 rounded-full hidden md:block"></div>
                    <div
                        className="absolute right-4 md:right-[2rem] top-6 w-1.5 bg-gradient-to-b from-emerald-500 to-transparent rounded-full hidden md:block transition-all duration-1000"
                        style={{ height: `${progressPercentage}%` }}
                    ></div>

                    <div className="space-y-12">
                        {phases.map((phase, phaseIndex) => {
                            const PhaseIcon = phase.icon;
                            // بررسی فعال بودن فاز (اگر اولین مرحله فاز تکمیل شده یا در حال انجام باشد)
                            const isPhaseActive = phase.milestones.some(m => m.Status === 'COMPLETED' || m.Status === 'IN_PROGRESS');

                            return (
                                <div key={phase.id} className="relative md:pr-28 group/phase">
                                    {/* Desktop Node */}
                                    <div className={`hidden md:flex absolute right-0 top-0 w-[4.5rem] h-[4.5rem] rounded-[1.25rem] items-center justify-center z-10 border-[6px] border-gray-50 transition-all duration-500 shadow-xl
                                        ${isPhaseActive ? `bg-gradient-to-br ${phase.color} text-white` : 'bg-gray-100 text-gray-300'}`}>
                                        <PhaseIcon size={32} />
                                    </div>

                                    <div>
                                        <h2 className={`text-3xl font-black mb-8 ${isPhaseActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {phase.title}
                                        </h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                                            {phase.milestones.map((milestone) => (
                                                <MilestoneCard
                                                    key={milestone.id}
                                                    milestone={milestone}
                                                    // تبدیل وضعیت دیتابیس به وضعیت مورد نیاز کامپوننت
                                                    status={milestone.Status === 'COMPLETED' ? 'COMPLETED' :
                                                        milestone.IsCurrent ? 'CURRENT' : 'LOCKED'}
                                                    onClick={() => handleMilestoneClick(milestone)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && selectedMilestone && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                        <div className="p-6 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <selectedMilestone.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800">{selectedMilestone.Title}</h3>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        {selectedMilestone.Status === 'COMPLETED' ? 'تکمیل شده' : 'در دست اقدام'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-sm text-gray-700">
                                <Info className="text-blue-500 shrink-0" size={20} />
                                {selectedMilestone.description}
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">متوجه شدم</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
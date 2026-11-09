"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
    PanelRightOpen,
    PanelLeftClose,
    BookOpen,
    Circle,
    Check,
    ChevronRight,
    LayoutDashboard,
    ClipboardList // آیکون جدید برای آزمون/تمرین‌های فصل
} from "lucide-react";
import { fetchContentsWithExercises } from "../../features/main/exercises/exercisesActions";
import SidebarSkeleton from "../common/SidebarSkeleton";

export const SidebarContext = React.createContext({
    isDesktopOpen: true,
    toggleDesktop: () => { },
});

const ExercisesSidebar = () => {
    const { slug, lessonId } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const { contents, loading, error } = useSelector((state) => state.exercises);

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);
    const [openChapterId, setOpenChapterId] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(
        lessonId ? parseInt(lessonId) : null
    );

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileOpen]);

    useEffect(() => {
        dispatch(
            fetchContentsWithExercises({
                Slug: slug,
            })
        );
    }, [dispatch, slug]);

    // گروه‌بندی و مرتب‌سازی بر اساس دیتای جدید
    const groupedChapters = useMemo(() => {
        if (!contents || contents.length === 0) return [];

        const chaptersMap = new Map();
        const sessionsMap = new Map();

        contents.forEach((item) => {
            if (!item.ParentId) {
                // فصل اصلی
                chaptersMap.set(item.Id, { ...item, Sessions: [] });
            } else {
                // زیرمجموعه‌ها (جلسات یا آزمون‌ها)
                if (!sessionsMap.has(item.ParentId)) {
                    sessionsMap.set(item.ParentId, []);
                }
                sessionsMap.get(item.ParentId).push(item);
            }
        });

        sessionsMap.forEach((sessions, parentId) => {
            const chapter = chaptersMap.get(parentId);
            if (chapter) {
                // مرتب‌سازی جلسات: اولویت با SortIndex است. 
                // اگر SortIndex برابر بود، آیتمی که IsExercise=1 است را پایین‌تر می‌بریم.
                chapter.Sessions = sessions.sort((a, b) => {
                    if (a.SortIndex === b.SortIndex) {
                        return a.IsExercise - b.IsExercise;
                    }
                    return a.SortIndex - b.SortIndex;
                });
            }
        });

        // مرتب‌سازی فصل‌ها
        return Array.from(chaptersMap.values()).sort(
            (a, b) => a.SortIndex - b.SortIndex
        );
    }, [contents]);

    useEffect(() => {
        if (groupedChapters.length > 0 && lessonId) {
            const foundChapter = groupedChapters.find((chapter) =>
                chapter.Sessions.some((s) => s.Id === parseInt(lessonId))
            );
            if (foundChapter) setOpenChapterId(foundChapter.Id);
        } else if (groupedChapters.length > 0 && !openChapterId) {
            setOpenChapterId(groupedChapters[0].Id);
        }
    }, [groupedChapters, lessonId]);

    const handleToggleChapter = (chapterId) => {
        setOpenChapterId((prev) => (prev === chapterId ? null : chapterId));
    };
    console.log(contents)
    const handleSelectSession = (sessionId, chapterId, isExercise) => {
        setSelectedSessionId(sessionId);
        setOpenChapterId(chapterId);
        if (isExercise)
            router.push(`/docs/${slug}/exercises/quiz/${sessionId}`);
        else
            router.push(`/docs/${slug}/exercises/${sessionId}`);
        if (isMobileOpen) setIsMobileOpen(false);
    };

    const toggleDesktop = () => setIsDesktopOpen((prev) => !prev);

    // دریافت آیکون وضعیت جلسه (با در نظر گرفتن IsExercise)
    const getSessionIcon = (status, isExercise) => {
        // اگر ماهیت آیتم کلا آزمون/تمرین فصل است
        if (isExercise === 1) {
            if (status === 3) return <Check className="text-emerald-500 w-5 h-5" />;
            return <ClipboardList className="text-purple-400 lg:text-purple-500 w-5 h-5" />;
        }

        switch (status) {
            case 3:
                return <Check className="text-emerald-500 w-5 h-5" />;
            case 2:
                return <BookOpen className="text-yellow-400 w-5 h-5" />;
            default:
                return <Circle className="text-slate-400 lg:text-slate-300 w-5 h-5" />;
        }
    };

    const getChapterIcon = (chapter) => {
        // در دیتای جدید ChapterCompletionPercent وجود دارد
        const { ExerciseStatus: status, ChapterCompletionPercent: progress } = chapter;
        if (status === 3 || progress === 100) {
            return (
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 lg:bg-emerald-100 rounded-full shrink-0">
                    <Check className="text-emerald-400 lg:text-emerald-600 w-6 h-6" strokeWidth={3} />
                </div>
            );
        }
        return (
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                        className="text-white/10 lg:text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="text-emerald-500"
                        strokeDasharray={`${progress || 0}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                </svg>
                <span className="absolute text-[10px] font-bold text-white lg:text-gray-700">
                    {progress || 0}%
                </span>
            </div>
        );
    };

    const mobileButton = isMobile && !isMobileOpen &&
        createPortal(
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 bg-[#042A1B] text-white px-5 py-3 rounded-full shadow-xl shadow-emerald-900/30 hover:scale-105 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-white/10"
            >
                <PanelRightOpen size={20} />
                <span className="font-bold text-sm">فهرست تمرینات</span>
            </button>,
            document.body
        );

    const mobileBackdrop = isMobile && isMobileOpen &&
        createPortal(
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] transition-opacity duration-300"
                onClick={() => setIsMobileOpen(false)}
            />,
            document.body
        );

    return (
        <>
            {mobileButton}
            {mobileBackdrop}

            <aside
                className={`
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          bg-[#042A1B] border-l-0 text-white
          fixed inset-y-0 right-0 z-[60] shadow-2xl
          w-[350px] sm:w-[350px]
          ${isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          lg:bg-transparent lg:text-gray-900 lg:border-l lg:border-gray-200 lg:shadow-none
          lg:static lg:sticky lg:top-24 lg:h-[calc(100vh-100px)]
          ${isDesktopOpen ? "lg:w-[350px] xl:w-[400px]" : "lg:w-0 lg:overflow-visible"}
        `}
            >
                <button
                    onClick={toggleDesktop}
                    className={`
            hidden lg:flex items-center justify-center
            absolute top-0 -left-8 z-50
            w-8 h-8 rounded-lg
            bg-white border border-gray-200 shadow-sm text-gray-500
            hover:text-emerald-600 hover:border-emerald-300 hover:shadow-md
            transition-all duration-300
          `}
                    title={isDesktopOpen ? "بستن منو" : "باز کردن منو"}
                >
                    {isDesktopOpen ? <ChevronRight size={18} /> : <LayoutDashboard size={18} />}
                </button>

                <div className={`
          h-full flex flex-col
          ${!isDesktopOpen && "lg:hidden"}
        `}>
                    <div className="flex items-center justify-between p-5 lg:p-4 mb-2 lg:bg-white/60 lg:backdrop-blur-md lg:rounded-2xl lg:border border-gray-100 border-b border-white/10 lg:border-b-0 shrink-0">
                        <div className="flex items-center gap-2 text-white lg:text-[#042A1B]">
                            <LayoutDashboard className="w-5 h-5" />
                            <h1 className="font-bold text-lg">تمرینات دوره</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/docs/${slug}`}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors duration-200 lg:bg-emerald-500 lg:hover:bg-emerald-600"
                            >
                                برگشت
                            </Link>

                            {isMobile && (
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="lg:hidden p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <PanelLeftClose size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 lg:px-2 pb-20 lg:pb-0 custom-scrollbar">
                        {loading ? (
                            <SidebarSkeleton />
                        ) : error ? (
                            <div className="text-center py-10">
                                <p className="text-red-400">خطا در دریافت داده‌ها</p>
                                <button
                                    onClick={() =>
                                        dispatch(
                                            fetchContentsWithExercises({
                                                Slug: slug,
                                            })
                                        )
                                    }
                                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                >
                                    تلاش مجدد
                                </button>
                            </div>
                        ) : groupedChapters.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {groupedChapters.map((chapter, index) => {
                                    const isOpen = openChapterId === chapter.Id;
                                    return (
                                        <div key={chapter.Id} className="rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => handleToggleChapter(chapter.Id)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 lg:hover:bg-gray-100"
                                            >
                                                {getChapterIcon(chapter)}
                                                <div className="flex-1 text-right">
                                                    <p className="text-sm text-white/60 lg:text-gray-500">فصل {index + 1}</p>
                                                    <p className="font-medium line-clamp-1">{chapter.Title}</p>
                                                </div>
                                                <ChevronRight
                                                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90" : ""
                                                        }`}
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="mt-2 mr-4 pr-3 border-r-2 border-white/20 lg:border-emerald-100">
                                                    {chapter.Sessions.map((session) => {
                                                        const isActive = session.Id === selectedSessionId;
                                                        // استایل متفاوت برای آزمون‌ها (IsExercise = 1)
                                                        const isExam = session.IsExercise === 1;

                                                        return (
                                                            <button
                                                                key={session.Id}
                                                                onClick={() => handleSelectSession(session.Id, chapter.Id, session.IsExercise)}
                                                                className={`
                                  w-full flex items-center justify-between gap-2 py-3 px-3 rounded-xl transition-all duration-200 text-sm mb-1
                                  ${isActive
                                                                        ? "bg-emerald-500/20 text-emerald-300 lg:bg-emerald-50 lg:text-emerald-800 font-bold border border-emerald-500/30 lg:border-emerald-100 shadow-sm"
                                                                        : isExam
                                                                            ? "text-purple-300 lg:text-purple-700 hover:bg-purple-500/10 lg:hover:bg-purple-50"
                                                                            : "text-gray-300 lg:text-gray-600 hover:bg-white/5 lg:hover:bg-gray-100 hover:text-white lg:hover:text-gray-900"
                                                                    }
                                `}
                                                            >
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <span className="shrink-0">{getSessionIcon(session.ExerciseStatus, session.IsExercise)}</span>
                                                                    <p className="truncate leading-relaxed">{session.Title}</p>
                                                                </div>
                                                                <span
                                                                    className={`
                                    text-[11px] whitespace-nowrap px-1.5 py-0.5 rounded border shrink-0
                                    ${isActive
                                                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 lg:bg-white lg:text-emerald-600 lg:border-emerald-100"
                                                                            : isExam
                                                                                ? "bg-purple-500/10 text-purple-300 border-purple-500/20 lg:bg-white lg:text-purple-600 lg:border-purple-100"
                                                                                : "bg-white/5 text-gray-400 border-white/10 lg:bg-white lg:text-gray-400 lg:border-gray-100"
                                                                        }
                                  `}
                                                                >
                                                                    {isExam ? session.QuestionCount + " سوال" : session.ExerciseCount + " تمرین"}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 lg:text-gray-500">
                                هیچ تمرینی یافت نشد
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ExercisesSidebar;

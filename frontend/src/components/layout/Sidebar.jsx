"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  PanelRightOpen,
  PanelLeftClose,
  BookOpen,
  Circle,
  Check,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { useParams } from "next/navigation";
import Accordion from "../../components/sidebar/Accordion";
import SidebarSkeleton from "../../components/common/SidebarSkeleton";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchContents } from "../../features/main/contents/contentsActions";

const Sidebar = () => {
  const [openAccordion, setOpenAccordion] = useState(-1);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  const params = useParams();
  const { slug, lessonId } = params;

  const { loading, contents } = useSelector(state => state.contents);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchContents({ "Take": 1000, "Slug": slug }));
  }, []);

  // قفل اسکرول در موبایل
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileOpen]);

  // گروه‌بندی دیتا
  const groupedArray = useMemo(() => {
    if (!contents) return [];
    const groupedContents = new Map();
    contents.forEach(content => {
      if (!content.ParentId) groupedContents.set(content.Id, { ...content, children: [] });
    });
    contents.forEach(content => {
      if (content.ParentId && groupedContents.has(content.ParentId)) {
        groupedContents.get(content.ParentId).children.push(content);
      }
    });
    return Array.from(groupedContents.values());
  }, [contents]);

  // باز کردن آکاردئون فعال
  useEffect(() => {
    if (groupedArray.length > 0 && lessonId) {
      const parentIndex = groupedArray.findIndex(content =>
        content.children.some(child => String(child.Id) === String(lessonId))
      );
      if (parentIndex !== -1) setOpenAccordion(parentIndex);
    }
  }, [groupedArray, lessonId]);

  const toggleAccordion = (index) => setOpenAccordion(openAccordion === index ? -1 : index);

  // آیکون‌ها
  const getSessionIcon = (status) => {
    switch (status) {
      case 3: return <Check className="text-emerald-500 w-5 h-5" />;
      case 2: return <BookOpen className="text-yellow-400 w-5 h-5" />;
      default: return <Circle className="text-slate-400 lg:text-slate-300 w-5 h-5" />;
    }
  };

  const getChapterIcon = (chapter) => {
    const { Status: status, ProgressPercent: progress } = chapter;
    if (status === 3) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-white/10 lg:bg-emerald-100 rounded-full">
          <Check className="text-emerald-400 lg:text-emerald-600 w-6 h-6" strokeWidth={3} />
        </div>
      );
    }
    return (
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-white/10 lg:text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          <path className="text-emerald-500" strokeDasharray={`${progress || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
        <span className="absolute text-[10px] font-bold text-white lg:text-gray-700">{progress}%</span>
      </div>
    );
  };

  return (
    <>
      {/* دکمه شناور موبایل */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[60] flex items-center gap-2 bg-[#042A1B] text-white px-5 py-3 rounded-full shadow-xl shadow-emerald-900/30 hover:scale-105 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-white/10"
        >
          <PanelRightOpen size={20} />
          <span className="font-bold text-sm">سرفصل‌ها</span>
        </button>
      )}

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          
          /* --- استایل موبایل (تیره) --- */
          bg-[#042A1B] border-l-0 text-white
          fixed inset-y-0 right-0 z-[60] shadow-2xl
          w-[350px] sm:w-[350px]
          ${isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}

          /* --- استایل دسکتاپ (روشن/شفاف) --- */
          lg:bg-transparent lg:text-gray-900 lg:border-l lg:border-gray-200 lg:shadow-none
          lg:static lg:sticky lg:top-24 lg:h-[calc(100vh-100px)]
          ${isDesktopOpen ? "lg:w-[350px] xl:w-[400px]" : "lg:w-0 lg:overflow-visible"}
        `}
      >

        {/* دکمه تاشو دسکتاپ */}
        <button
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
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

        {/* محتوای داخلی */}
        <div className={`
            h-full flex flex-col 
            ${!isDesktopOpen && "lg:hidden"}
        `}>

          {/* هدر سایدبار */}
          <div className="flex items-center justify-between p-5 lg:p-4 mb-2 lg:bg-white/60 lg:backdrop-blur-md lg:rounded-2xl lg:border border-gray-100 border-b border-white/10 lg:border-b-0">
            <div className="flex items-center gap-2 text-white lg:text-[#042A1B]">
              <LayoutDashboard className="w-5 h-5" />
              <h1 className="font-bold text-lg">سرفصل‌های دوره</h1>
            </div>

            {/* دکمه بستن موبایل */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>

          {/* لیست */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-2 pb-20 lg:pb-0 custom-scrollbar">
            {loading ? (
              <SidebarSkeleton />
            ) : (
              <div className="flex flex-col gap-3">
                {groupedArray.map((content, index) => (
                  <Accordion
                    key={content.Id}
                    title={`فصل ${index + 1}`}
                    subtitle={content.Title}
                    icon={getChapterIcon(content)}
                    isOpen={openAccordion === index}
                    onClick={() => toggleAccordion(index)}
                    // نکته: رنگ متن‌ها در آکاردئون باید هندل شود
                    className="text-white lg:text-gray-900"
                    content={
                      <ul className="flex flex-col gap-1 mt-2 border-r-2 border-white/20 lg:border-emerald-100 pr-3 mr-3">
                        {content.children.map((child) => {
                          const isActive = String(child.Id) === String(lessonId);
                          return (
                            <li key={child.Id}>
                              <Link
                                href={`/docs/${slug}/${child.Id}`}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                  flex items-center justify-between gap-2 py-3 px-3 rounded-xl transition-all duration-200 text-sm
                                  
                                  /* حالت فعال */
                                  ${isActive
                                    ? "bg-emerald-500/20 text-emerald-300 lg:bg-emerald-50 lg:text-emerald-800 font-bold border border-emerald-500/30 lg:border-emerald-100 shadow-sm"
                                    : "text-gray-300 lg:text-gray-600 hover:bg-white/5 lg:hover:bg-gray-100 hover:text-white lg:hover:text-gray-900"}
                                `}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <span className="shrink-0">{getSessionIcon(child.Status)}</span>
                                  <p className="truncate leading-relaxed">{child.Title}</p>
                                </div>
                                <span className={`text-[11px] whitespace-nowrap px-1.5 py-0.5 rounded border 
                                  ${isActive
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 lg:bg-white lg:text-emerald-600 lg:border-emerald-100"
                                    : "bg-white/5 text-gray-400 border-white/10 lg:bg-white lg:text-gray-400 lg:border-gray-100"
                                  }`}>
                                  {child.EstimatedReadTime} دقیقه
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
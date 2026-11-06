"use client"
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard, BarChart3, UserCircle, KeyRound,
    BookOpen, PencilRuler, FileCheck, Target,
    Award, ShoppingBag, MessageSquare, Menu, X, ChevronLeft,
    Map
} from 'lucide-react';

export const sidebarItems = [
    { name: 'داشبورد', href: '/account', icon: LayoutDashboard },
    { name: 'نقشه راه من', href: '/account/roadmap', icon: Map },
    { name: 'پروفایل من', href: '/account/profile', icon: UserCircle },
    { name: 'دوره‌های من', href: '/account/courses', icon: BookOpen },
    { name: 'تمرین‌ها', href: '/account/exercises', icon: PencilRuler },
    { name: 'آزمون‌ها', href: '/account/quiz', icon: FileCheck },
    // { name: 'تعیین سطح هوشمند', href: '/account/level-assessment', icon: Target },
    { name: 'مدارک من', href: '/account/certificates', icon: Award },
    // { name: 'لایسنس‌های من', href: '/account/license', icon: KeyRound },
    { name: 'خریدها', href: '/account/purchase', icon: ShoppingBag },
    { name: 'تیکت‌ها', href: '/account/tickets', icon: MessageSquare },
];

export default function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [topPosition, setTopPosition] = useState(72)

    useEffect(() => {
        const handleScroll = () => setTopPosition(window.scrollY > 50 ? 60 : 72)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            {/* Overlay با افکت Blur شدید */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 z-[45] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <nav
                className={`fixed h-[calc(100vh-2rem)] w-[280px] rounded-l-[2.5rem] bg-[#042A1B]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) z-50 lg:right-0 ${isOpen ? 'right-0' : '-right-[320px]'
                    }`}
                style={{ top: `${topPosition}px` }}
            >
                {/* نورهای پس‌زمینه متحرک داخل سایدبار */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-[80px]"
                    />
                </div>

                <div className="h-full flex flex-col relative z-10">
                    {/* Header با استایل شیشه‌ای */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-green-500 blur-md opacity-50" />
                                <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-xl">🚀</span>
                                </div>
                            </motion.div>
                            <div>
                                <h2 className="text-white font-bold text-sm leading-tight">پلتفرم یادگیری</h2>
                                <span className="text-green-500 text-[10px] font-mono tracking-tighter uppercase opacity-80">Premium Access</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <ul className="flex-1 overflow-y-auto py-4 px-4 space-y-2 no-scrollbar">
                        {sidebarItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.li
                                    key={item.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`group relative flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-transparent' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                <item.icon size={18} className={`${isActive ? 'text-green-400' : ''}`} />
                                            </div>
                                            <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                                        </div>

                                        {isActive && (
                                            <motion.div layoutId="arrow">
                                                <ChevronLeft size={14} className="text-green-400" />
                                            </motion.div>
                                        )}

                                        {/* Background Active Glow */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute inset-0 bg-gradient-to-l from-green-500/20 via-green-500/5 to-transparent border-r-2 border-green-400 rounded-2xl"
                                                transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                                            />
                                        )}

                                        {/* Hover Effect */}
                                        {!isActive && (
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-2xl transition-all duration-300" />
                                        )}
                                    </Link>
                                </motion.li>
                            )
                        })}
                    </ul>


                </div>

                {/* Floating Toggle Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    style={isOpen ? { left: -56 } : { left: -96 }}
                    className="absolute top-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-[#021a11] border border-white/10 shadow-2xl text-white lg:hidden"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.button>
            </nav>
        </>
    )
}
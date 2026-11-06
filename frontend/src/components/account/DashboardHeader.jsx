// components/dashboard/Header.tsx
'use client'

import { motion } from 'framer-motion'
import { Bell, Search, ChevronDown } from 'lucide-react'

export default function DashboardHeader() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="sticky top-0 z-10 bg-green-50/80 backdrop-blur-md border-b border-green-200"
        >
            <div className="flex items-center justify-between px-8 py-4">
                {/* جستجو */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center bg-white rounded-full shadow-sm px-4 py-2 w-96"
                >
                    <Search className="w-5 h-5 text-green-600" />
                    <input
                        type="text"
                        placeholder="جستجو در داشبورد..."
                        className="mr-2 bg-transparent outline-none placeholder-green-400 text-green-800"
                    />
                </motion.div>

                {/* نوار سمت چپ */}
                <div className="flex items-center gap-6">
                    {/* نوتیفیکیشن */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative p-2 rounded-full bg-green-100 text-green-700"
                    >
                        <Bell className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            3
                        </span>
                    </motion.button>

                    {/* پروفایل کاربر */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2 shadow-sm cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                            ی
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-green-800">رامین جوشنگ</p>
                            <p className="text-sm text-green-600">سطح طلایی</p>
                        </div>
                        <ChevronDown className="text-green-600" />
                    </motion.div>
                </div>
            </div>
        </motion.header>
    )
}
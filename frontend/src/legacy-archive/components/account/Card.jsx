// components/dashboard/Card.tsx
'use client'

import { motion } from 'framer-motion'

export default function DashboardCard({
    title,
    count,
    color,
    icon: Icon,
    progress,
    trend,
}) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-300`}
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    <Icon className="w-8 h-8 text-white/80" />
                    <h3 className="text-lg font-semibold text-white/90">{title}</h3>
                    <p className="text-4xl font-bold text-white">{count}</p>
                </div>

                {trend && (
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <span className={`text-sm ${trend.value > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </span>
                        <trend.icon className={`w-4 h-4 ${trend.value > 0 ? 'text-green-200' : 'text-red-200'
                            }`} />
                    </div>
                )}
            </div>

            <div className="mt-6 relative">
                <div className="flex justify-between text-sm mb-2 text-white/80">
                    <span>پیشرفت</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, type: 'spring' }}
                        className="h-full bg-emerald-200 rounded-full shadow-progress"
                    />
                </div>
            </div>

            <div className="absolute -bottom-4 -right-4 opacity-10">
                <Icon className="w-24 h-24 text-white" />
            </div>
        </motion.div>
    )
}
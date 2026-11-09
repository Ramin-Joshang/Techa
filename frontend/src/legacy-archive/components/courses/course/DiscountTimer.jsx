'use client'

import { motion, useMotionTemplate, useTransform } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

const DiscountTimer = ({ days, hours, minutes }) => {
    const [time, setTime] = useState({ days, hours, minutes })
    const [isCritical, setIsCritical] = useState(false)

    const totalMinutes = (time.days * 1440) + (time.hours * 60) + time.minutes
    const radius = useTransform(() => Math.min(totalMinutes * 2, 200))
    const strokeDasharray = useMotionTemplate`${radius} ${2 * Math.PI * radius}`

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prev => {
                let newDays = prev.days
                let newHours = prev.hours
                let newMinutes = prev.minutes - 1

                if (newMinutes < 0) {
                    newMinutes = 59
                    newHours -= 1
                }

                if (newHours < 0) {
                    newHours = 23
                    newDays -= 1
                }

                return { days: newDays, hours: newHours, minutes: newMinutes }
            })
        }, 60000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        setIsCritical(totalMinutes < 180) // کمتر از 3 ساعت
    }, [totalMinutes])

    return (
        <motion.div
            className={`p-4 rounded-xl relative overflow-hidden group ${isCritical ? 'bg-red-500/20' : 'bg-emerald-500/20'
                }`}
            animate={{
                border: isCritical
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(16, 185, 129, 0.3)'
            }}
        >
            {/* افکت استروک انیمیشنی */}
            <motion.div
                className="absolute inset-0"
                style={{
                    strokeDasharray,
                    stroke: isCritical ? '#ef4444' : '#10b981',
                    strokeWidth: 2,
                }}
                animate={{
                    pathLength: [0, 1, 0],
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />

            <div className="flex items-center gap-4 z-10 relative">
                <motion.div
                    animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    {isCritical ? (
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    ) : (
                        <Clock className="w-8 h-8 text-emerald-500" />
                    )}
                </motion.div>

                <div className="flex-1">
                    <div className="text-sm mb-1">زمان باقیمانده تا پایان تخفیف:</div>
                    <div className="flex gap-2 font-mono text-xl">
                        <motion.span
                            className="px-3 py-1 rounded bg-black/20"
                            animate={isCritical ? { x: [-2, 2, -2] } : {}}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                        >
                            {time.days} روز
                        </motion.span>
                        :
                        <span className="px-3 py-1 rounded bg-black/20">{time.hours} ساعت</span>:
                        <motion.span
                            className="px-3 py-1 rounded bg-black/20"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            {time.minutes} دقیقه
                        </motion.span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(totalMinutes / (days * 1440 + hours * 60 + minutes)) * 100}%` }}
                    transition={{ duration: 60, ease: 'linear' }}
                />
            </div>
        </motion.div>
    )
}

export default DiscountTimer
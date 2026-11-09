'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Star, Medal, Rocket } from 'lucide-react'

const RatingSection = ({ rating, reviews }) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const rotateX = useSpring(useTransform(mouseY, [0, 300], [-5, 5]));
    const rotateY = useSpring(useTransform(mouseX, [0, 600], [5, -5]))

    return (
        <motion.div
            className="flex items-center gap-4 bg-white/10 p-4 rounded-xl relative overflow-hidden group"
            style={{ rotateX, rotateY }}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                mouseX.set(e.clientX - rect.left)
                mouseY.set(e.clientY - rect.top)
            }}
            onMouseLeave={() => {
                rotateX.set(0)
                rotateY.set(0)
            }}
        >
            {/* افکت پس‌زمینه */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-2 z-10">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ scale: rating >= i + 1 ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                        <Star className={`w-6 h-6 ${i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-gray-400'}`} />
                    </motion.div>
                ))}
                <div className="flex items-center gap-2 ml-2">
                    <span className="font-bold text-xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        {rating}
                    </span>
                    <span className="text-gray-300">({reviews.toLocaleString()} نظر)</span>
                </div>
            </div>

            <div className="h-8 w-px bg-white/20 mx-4" />

            <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
            >
                <Medal className="w-6 h-6 text-blue-400 animate-pulse" />
                {/* <Rocket className="w-6 h-6 text-pink-500 animate-bounce" /> */}
                <span className="bg-gradient-to-r text-white bg-clip-text text-transparent font-bold">
                    پرفروش ترین دوره ۱۴۰۳
                </span>
            </motion.div>
        </motion.div>
    )
}

export default RatingSection
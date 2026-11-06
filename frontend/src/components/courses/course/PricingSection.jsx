'use client'

import { motion, useTransform, useSpring } from 'framer-motion'
import { Zap, BadgePercent } from 'lucide-react'

const PricingSection = ({ price, discountPrice = 10 }) => {
    // const calculateDiscount = () => {
    //     const original = parseInt(price.replace(/\D/g, ''))
    //     const discounted = parseInt(discountPrice.replace(/\D/g, ''))
    //     return Math.round(((original - discounted) / original) * 100)
    // }

    const discount = 30
    const scale = useSpring(1, { stiffness: 300, damping: 20 })
    const rotate = useSpring(0, { stiffness: 100, damping: 15 })
    const shadow = useTransform(scale, [1, 1.2], ['0px 0px 0px rgba(0,0,0,0)', '0px 8px 25px rgba(220, 38, 38, 0.3)'])

    return (
        <motion.div
            className="space-y-4 relative"

        >
            <motion.div
                className="flex items-center gap-4"
                style={{
                    scale,
                    rotate,
                    boxShadow: shadow
                }}
            >
                <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                        {discountPrice}
                    </div>
                </div>

                <div className="text-xl line-through text-gray-300">{price}</div>

                <motion.div
                    className="px-3 py-1 bg-red-500 rounded-full text-sm flex items-center gap-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <BadgePercent className="w-4 h-4" />
                    <span>{discount}%</span>
                </motion.div>
            </motion.div>

            {/* نمودار درصد تخفیف */}
            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="absolute h-full bg-gradient-to-r from-red-500 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${discount}%` }}
                    transition={{ duration: 1, type: 'spring' }}
                />
            </div>
        </motion.div>
    )
}

export default PricingSection
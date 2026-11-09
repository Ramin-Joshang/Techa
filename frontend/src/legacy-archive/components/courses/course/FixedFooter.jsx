import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'

const FixedFooter = ({ price, originalPrice }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* محتوای پاورقی */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-3"
                >
                    <BookOpen className="w-5 h-5" />
                    ثبت نام در دوره
                </motion.button>
            </div>
        </div>
    )
}

export default FixedFooter
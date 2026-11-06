"use client"
import { motion } from 'framer-motion'
import { Search, Filter, X, ChevronDown, Clock, Flame, Calendar } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const categories = [
    { id: 1, name: 'همه دسته‌ها' },
    { id: 2, name: 'تکنولوژی' },
    { id: 3, name: 'برنامه‌نویسی' },
    { id: 4, name: 'هوش مصنوعی' },
]

const sortOptions = [
    { id: 'newest', label: 'جدیدترین', icon: <Calendar className="w-4 h-4" /> },
    { id: 'oldest', label: 'قدیمی‌ترین', icon: <Clock className="w-4 h-4" /> },
    { id: 'most-viewed', label: 'پربازدیدترین', icon: <Flame className="w-4 h-4" /> },
]

export const SearchAndFilter = () => {
    const [selectedCategory, setSelectedCategory] = useState(categories[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [activeSort, setActiveSort] = useState('newest')
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (category) => {
        setSelectedCategory(category)
        setIsOpen(false)
    }

    return (
        <motion.div
            className="flex flex-col lg:flex-row gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            {/* Search Input */}
            <div className="relative flex-1 group">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none bg-white
                    focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400
                    transition-all duration-200 shadow-sm
                    placeholder:text-gray-400 text-gray-700 text-sm"
                />
                <motion.button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X className="w-4 h-4" />
                </motion.button>
                <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full lg:w-48" ref={dropdownRef}>
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 
                    bg-white hover:bg-gray-50 transition-colors text-sm text-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span>{selectedCategory.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-20"
                    >
                        {categories.map((category) => (
                            <motion.li
                                key={category.id}
                                onClick={() => handleSelect(category)}
                                className={`px-3 py-2 cursor-pointer text-sm transition-colors
                                    ${category.id === selectedCategory.id
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                whileHover={{ x: 3 }}
                            >
                                {category.name}
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </div>

            {/* Sorting Filters */}
            <div className="flex items-center gap-2">
                {sortOptions.map((option) => (
                    <motion.button
                        key={option.id}
                        onClick={() => setActiveSort(option.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-sm
                            ${activeSort === option.id
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                            }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {option.icon}
                        <span>{option.label}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    )
}
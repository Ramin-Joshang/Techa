'use client'

import { motion } from 'framer-motion'
import { Clock, Users, CircleCheck, Heart, Scale, Rocket, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const statusConfig = {
    analysis: {
        label: 'تحلیل و طراحی',
        color: 'bg-purple-500',
        icon: <BookOpen size={16} />
    },
    active: {
        label: 'در حال توسعه',
        color: 'bg-green-500',
        icon: <Rocket size={16} />
    },
    completed: {
        label: 'تکمیل شده',
        color: 'bg-yellow-500',
        icon: <CircleCheck size={16} />
    }
}

const categoryIcons = {
    fashion: <Heart size={18} className="text-pink-500" />,
    legal: <Scale size={18} className="text-blue-500" />,
    industry: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.033-.4.067-.61.1-.626.025-1.26.037-1.9.037-1.914 0-3.747-.127-5.488-.372-1.245-.105-2.248-1.152-2.248-2.402v-.497c0-1.197.918-2.185 2.091-2.204a46.39 46.39 0 0 1 5.422-.049 2 2 0 0 1 1.906 1.499l.523 2.638c.1.499.507.85.998.85h.5" />
    </svg>
}

export default function ProjectCard({ project }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative group rounded-2xl shadow-xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300"
        >
            <Link href={`/projects/${project.id}`} className="block">
                {/* Image Section */}
                <div className="relative aspect-video">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm text-white flex items-center gap-2 ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].icon}
                        {statusConfig[project.status].label}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4">
                    {/* Title and Category */}
                    <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{project.title}</h3>
                        {categoryIcons[project.category]}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {project.shortDescription}
                    </p>

                    {/* Stats */}
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">پیشرفت پروژه</span>
                                <span className="font-semibold text-gray-800">{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-blue-400 to-green-400"
                                />
                            </div>
                        </div>

                        {/* Interns Info */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Users size={18} className="text-purple-500" />
                                <span>
                                    {project.currentInterns}/
                                    <span className="text-gray-500">{project.requiredInterns}</span>
                                </span>
                            </div>


                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
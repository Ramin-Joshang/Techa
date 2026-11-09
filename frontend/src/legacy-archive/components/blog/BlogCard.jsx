"use client"
import { motion } from 'framer-motion'
import { Bookmark, Share2, Clock, User, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const BlogCard = ({ post, index }) => {
    return (
        <motion.article
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.15,
                type: "spring",
                stiffness: 120
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 overflow-hidden"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0 }}
                />

                <Image
                    src={post.ThumbnailUrl}
                    alt={post.Title}
                    fill
                    className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index < 3}
                />

                {/* Category Badge */}
                <motion.div
                    className="absolute top-4 right-4"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="bg-emerald-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        {post.CategoryName}
                    </span>
                </motion.div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-5">
                {/* Metadata */}
                <div className="flex items-center justify-between text-emerald-500">
                    <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 stroke-2" />
                            <span className="font-medium">{post.Author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <div className="w-1 h-1 bg-current rounded-full" /> */}
                            <Clock className="w-5 h-5" />
                            <span>
                                {new Date(post.PublishedAt).toLocaleDateString('fa-IR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <motion.h3
                    className="text-2xl font-bold text-slate-800 dark:text-white hover:text-emerald-500 transition-colors"
                    whileHover={{ x: 5 }}
                >
                    {post.Title}
                </motion.h3>

                {/* Excerpt */}
                <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {post.Summary}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-5">
                    <Link
                        href={`https://blog.techa.ir/blog/${post.Slug}`}

                    >
                        <motion.button
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-2 text-emerald-500 font-semibold group/button"
                        >
                            ادامه مطلب
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover/button:translate-x-1" />
                        </motion.button>
                    </Link>
                    <div className="flex gap-3">
                        <motion.button
                            className="p-2 rounded-full hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Bookmark className="w-6 h-6 text-emerald-500" />
                        </motion.button>
                        <motion.button
                            className="p-2 rounded-full hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Share2 className="w-6 h-6 text-emerald-500" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-transparent blur-xl" />
            </div>
        </motion.article>
    )
}
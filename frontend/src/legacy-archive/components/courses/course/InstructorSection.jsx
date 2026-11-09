import Image from 'next/image'
import { motion } from 'framer-motion'
import { Globe, Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react'
import React, { cloneElement } from 'react'

const InstructorSection = ({ instructor }) => {
    const socialConfig = {
        website: { icon: <Globe />, color: '#10b981' },
        github: { icon: <Github />, color: '#333' },
        linkedin: { icon: <Linkedin />, color: '#0a66c2' },
        email: { icon: <Mail />, color: '#ea4335' }
    }

    return (
        <section className="py-24 bg-gradient-to-b from-emerald-50/30 to-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="group bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative isolate"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-white/0 -z-10" />

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Animated Image Section */}


                        {/* Interactive Content */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ staggerChildren: 0.1 }}
                            >
                                <motion.span
                                    className="inline-block mb-6 text-emerald-600 font-semibold text-sm uppercase tracking-widest"
                                    initial={{ x: -20 }}
                                    whileInView={{ x: 0 }}
                                >
                                    🎓 مدرس دوره
                                </motion.span>

                                <motion.h3
                                    className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                >
                                    {instructor.name}
                                </motion.h3>

                                <motion.p
                                    className="text-lg text-gray-600 mb-8 leading-relaxed relative"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {instructor.bio}
                                    <span className="absolute -bottom-4 right-0 text-6xl text-emerald-100/50 font-bold -z-10">
                                        ”
                                    </span>
                                </motion.p>

                                {/* Dynamic Social Links */}
                                <motion.div
                                    className="grid grid-cols-2 gap-3"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {Object.entries(instructor.social).map(([platform, url]) => (
                                        <motion.a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-100 transition-all flex items-center gap-3 group relative overflow-hidden"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: socialConfig[platform]?.color + '15' }}
                                            >
                                                {/* {cloneElement(socialConfig[platform]?.icon, {
                                                    className: "w-5 h-5",
                                                    style: { color: socialConfig[platform]?.color }
                                                })} */}
                                            </div>
                                            <div className="flex-1">
                                                <span className="block text-sm font-medium text-gray-600">
                                                    {platform === 'email' ? 'Email' : platform}
                                                </span>
                                                <span className="block text-xs text-gray-400 truncate">
                                                    {url.replace(/^https?:\/\//, '')}
                                                </span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                        </motion.a>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </div>


                        <motion.div
                            className="relative h-[500px] overflow-hidden"
                            initial={{ scale: 0.98 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Image
                                src={instructor.avatar}
                                alt={instructor.name}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-fill transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                            {/* Floating Badges */}
                            <div className="absolute bottom-6 left-6 flex gap-3">
                                {instructor.badges?.map((badge, i) => (
                                    <motion.div
                                        key={badge}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
                                    >
                                        <span className="text-sm font-medium text-emerald-600">{badge}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-8 right-8 flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-emerald-400/30"
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{
                                    duration: 1.5 + i,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default InstructorSection
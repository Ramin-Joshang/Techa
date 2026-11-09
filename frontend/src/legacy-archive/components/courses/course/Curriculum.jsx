'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const Curriculum = ({ curriculum }) => {
    const [openedModule, setOpenedModule] = useState(null)

    const toggleModule = (index) => {
        setOpenedModule(openedModule === index ? null : index)
    }

    const moduleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100 }
        }
    }

    const listItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1 }
        })
    }

    return (
        <section className="py-16">
            <div className="">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold mb-12 text-emerald-900 text-center"
                >
                    سرفصل دوره
                </motion.h2>

                <div className="space-y-6">
                    {curriculum.map((module, index) => (
                        <motion.div
                            key={index}
                            variants={moduleVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="border border-emerald-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleModule(index)}
                            >
                                <div className="flex items-center gap-5">
                                    <motion.div
                                        className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center font-bold shadow-md"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {module.module}
                                    </motion.div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {module.title}
                                    </h3>
                                </div>
                                <motion.div
                                    animate={{ rotate: openedModule === index ? 180 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <ChevronDown className="w-7 h-7 text-white" />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {openedModule === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{
                                            opacity: 1,
                                            height: 'auto',
                                            transition: { type: 'spring', bounce: 0.2 }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            height: 0,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 bg-white space-y-4">
                                            <ul className="space-y-3">
                                                {module.lessons.map((lesson, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        custom={idx}
                                                        initial="hidden"
                                                        animate="visible"
                                                        variants={listItemVariants}
                                                        className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <div className="w-7 h-7 bg-emerald-600 text-white rounded-md flex items-center justify-center text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-emerald-900 font-medium">
                                                            {lesson.title}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Curriculum
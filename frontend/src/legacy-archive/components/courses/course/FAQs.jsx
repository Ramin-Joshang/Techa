'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQs = ({ faqs }) => {
    const [openedIndex, setOpenedIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenedIndex(openedIndex === index ? null : index)
    }

    return (
        <section className="py-16 bg-white">
            <div className="">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold mb-8 text-emerald-600"
                >
                    سوالات متداول
                </motion.h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="w-full">
                                <div
                                    onClick={() => toggleFAQ(index)}
                                    className="flex items-center justify-between p-6 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                    <h3 className="text-lg font-semibold text-right">
                                        {faq.question}
                                    </h3>
                                    <ChevronDown
                                        className={`w-6 h-6 text-emerald-600 transition-transform ${openedIndex === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>

                                {openedIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-6 bg-white border-b border-x border-emerald-100 rounded-b-xl"
                                    >
                                        <p className="text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FAQs
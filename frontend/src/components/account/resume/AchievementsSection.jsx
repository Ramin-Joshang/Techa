"use client";
import { motion, AnimatePresence } from 'framer-motion';

const AchievementsSection = ({ achievements, handleChange, addAchievement, deleteAchievement }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 p-8 rounded-2xl mb-8 shadow-lg border-2 border-emerald-100"
    >
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">
                <span className="mr-2">🏆</span>
                افتخارات و جوایز
            </h2>
            <motion.button
                onClick={addAchievement}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                افزودن افتخار
            </motion.button>
        </div>

        <AnimatePresence>
            {achievements.map((ach, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="group relative mb-4"
                >
                    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-emerald-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-emerald-600 mb-2">عنوان افتخار</label>
                                <motion.input
                                    type="text"
                                    value={ach.title}
                                    onChange={(e) => handleChange(e, 'achievements', index, 'title')}
                                    className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    placeholder="مثال: برترین استارتاپ سال"
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-emerald-600 mb-2">سازمان اعطاکننده</label>
                                <motion.input
                                    type="text"
                                    value={ach.organization}
                                    onChange={(e) => handleChange(e, 'achievements', index, 'organization')}
                                    className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    placeholder="مثال: وزارت فناوری اطلاعات"
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t-2 border-emerald-50 pt-4">
                            <motion.button
                                onClick={() => deleteAchievement(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-red-500 hover:text-red-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>حذف افتخار</span>
                            </motion.button>

                            <div className="flex items-center gap-2 text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>سطح ملی</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>

        {achievements.length === 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-emerald-600"
            >
                <span className="text-2xl">🎖️</span>
                <p className="mt-2">هنوز افتخاری ثبت نشده است!</p>
            </motion.div>
        )}
    </motion.div>
);

export default AchievementsSection;
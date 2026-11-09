"use client";
import { motion, AnimatePresence } from 'framer-motion';

const ProjectsSection = ({ projects, handleChange, addProject, deleteProject }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 p-8 rounded-2xl mb-8 shadow-lg border-2 border-emerald-100"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-emerald-800">
                    <span className="mr-2">🚀</span>
                    پروژه‌های انجام شده
                </h2>
                <motion.button
                    onClick={addProject}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    پروژه جدید
                </motion.button>
            </div>

            <AnimatePresence>
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="group relative mb-6"
                    >
                        <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-emerald-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-600 mb-2">عنوان پروژه</label>
                                    <motion.input
                                        type="text"
                                        value={project.title}
                                        onChange={(e) => handleChange(e, 'projects', index, 'title')}
                                        className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                        placeholder="مثال: سیستم مدیریت محتوا"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-emerald-600 mb-2">مدت زمان</label>
                                    <motion.input
                                        type="text"
                                        value={project.duration}
                                        onChange={(e) => handleChange(e, 'projects', index, 'duration')}
                                        className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                        placeholder="مثال: ۶ ماه"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-emerald-600 mb-2">توضیحات پروژه</label>
                                <motion.textarea
                                    value={project.description}
                                    onChange={(e) => handleChange(e, 'projects', index, 'description')}
                                    className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 h-32"
                                    placeholder="شرح کامل پروژه..."
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>

                            <div className="flex items-center justify-between border-t-2 border-emerald-50 pt-4">
                                <motion.button
                                    onClick={() => deleteProject(index)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>حذف پروژه</span>
                                </motion.button>

                                <div className="flex items-center gap-2 text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span>آخرین بروزرسانی: اکنون</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {projects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6 text-emerald-600"
                >
                    <span className="text-2xl">📂</span>
                    <p className="mt-2">هنوز پروژه‌ای ثبت نشده است!</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ProjectsSection;
"use client";
import { motion, AnimatePresence } from 'framer-motion';

const CertificatesSection = ({ certificatesData, handleChange, addCertificate, deleteCertificate }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 p-8 rounded-2xl mb-8 shadow-lg border-2 border-emerald-100"
    >
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">
                <span className="mr-2">🏅</span>
                گواهینامه‌ها و مدارک
            </h2>
            <motion.button
                onClick={addCertificate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.094a1 1 0 00-.367-1.367l-.724-.372a1 1 0 00-.927 1.774l.746.383a1 1 0 001.272-.418zM15.721 8.58a1 1 0 00.418-1.272l-.383-.746a1 1 0 10-1.774.927l.372.724a1 1 0 001.367.367zM17 8a5 5 0 11-10 0 5 5 0 0110 0z" clipRule="evenodd" />
                </svg>
                افزودن مدرک
            </motion.button>
        </div>

        <AnimatePresence>
            {certificatesData.map((cert, index) => (
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
                                <label className="block text-sm font-medium text-emerald-600 mb-2">عنوان مدرک</label>
                                <motion.input
                                    type="text"
                                    value={cert.title}
                                    onChange={(e) => handleChange(e, 'certificatesData', index, 'title')}
                                    className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    placeholder="مثال: توسعه دهنده React حرفه‌ای"
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-emerald-600 mb-2">مرجع صدور</label>
                                <motion.input
                                    type="text"
                                    value={cert.issuer}
                                    onChange={(e) => handleChange(e, 'certificatesData', index, 'issuer')}
                                    className="w-full p-3 border-2 border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    placeholder="مثال: دانشگاه تهران"
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t-2 border-emerald-50 pt-4">
                            <motion.button
                                onClick={() => deleteCertificate(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-red-500 hover:text-red-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>حذف مدرک</span>
                            </motion.button>

                            <div className="flex items-center gap-2 text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>تایید شده</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>

        {certificatesData.length === 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-emerald-600"
            >
                <span className="text-2xl">📜</span>
                <p className="mt-2">هنوز مدرکی ثبت نشده است!</p>
            </motion.div>
        )}
    </motion.div>
);

export default CertificatesSection;
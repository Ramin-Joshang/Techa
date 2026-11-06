import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage = 1, totalPages = 5, onPageChange }) => {
    return (
        <motion.div
            className="flex items-center justify-center gap-1 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg flex items-center border border-emerald-100 hover:border-emerald-200 
                    ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <ChevronRight className="w-5 h-5 text-emerald-600" />
            </motion.button>

            {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;

                return (
                    <motion.button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                            ${isActive
                                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-100'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {page}
                    </motion.button>
                );
            })}

            <motion.button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg flex items-center border border-emerald-100 hover:border-emerald-200 
                    ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <ChevronLeft className="w-5 h-5 text-emerald-600" />
            </motion.button>
        </motion.div>
    );
};
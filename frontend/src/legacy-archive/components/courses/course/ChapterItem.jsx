"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SessionItem from "./SessionItem";

const ChapterItem = ({ chapter, index, selectedSessionId, isOpen, onToggle, onSelectSession }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="mb-6"
        >
            {/* عنوان فصل */}
            <div
                className={`bg-white p-4 rounded-xl cursor-pointer shadow-sm border-2 transition-all duration-300 ${isOpen
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 hover:border-emerald-400"
                    }`}
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${isOpen
                                    ? "bg-emerald-100 text-emerald-700 font-bold"
                                    : "bg-emerald-50 text-emerald-600 font-bold"
                                }`}
                        >
                            <span className="text-xl">{index}</span>
                        </div>
                        <h2
                            className={`text-xl font-semibold ${isOpen ? "text-emerald-700" : "text-gray-800"
                                }`}
                        >
                            {chapter.Title}
                        </h2>
                    </div>
                    <ChevronDown
                        className={`transform transition-transform duration-300 text-gray-600 ${isOpen ? "rotate-180" : ""
                            }`}
                        size={28}
                    />
                </div>
            </div>

            {/* لیست جلسات */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2 pr-4 overflow-hidden"
                    >
                        {chapter.Sessions.map((session, sessionIndex) => (
                            <SessionItem
                                key={session.Id}
                                session={session}
                                sessionIndex={sessionIndex}
                                isSelected={selectedSessionId === session.Id}
                                onClick={() => onSelectSession(session.Id)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChapterItem;

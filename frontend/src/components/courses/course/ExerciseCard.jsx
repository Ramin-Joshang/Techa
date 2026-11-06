// components/ExerciseCard.js
"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { CheckCircle, AlertCircle, Circle, Zap, XCircle, Clock } from "lucide-react";

const ExerciseCard = ({ exercise, onClick, isSelected }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const radius = useMotionValue(0);
    const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, var(--${exercise.status}-hover) 0%, transparent 65%)`;

    const statusConfig = {
        completed: {
            color: "emerald",
            icon: <CheckCircle className="text-emerald-500" size={24} />,
            progress: 100,
        },
        pending: {
            color: "amber",
            icon: <AlertCircle className="text-amber-500 animate-pulse" size={24} />,
            progress: 50,
        },
        rejected: {
            color: "rose",
            icon: <XCircle className="text-rose-500" size={24} />,
            progress: 100,
        },
        unfinished: {
            color: "gray",
            icon: <Clock className="text-gray-500" size={24} />,
            progress: 0,
        },
        default: {
            color: "sky",
            icon: (
                <div className="relative">
                    <Circle className="text-gray-400" size={24} />
                    <Zap className="absolute top-0 left-0 text-sky-500 animate-ping" size={16} />
                </div>
            ),
            progress: 0,
        },
    };

    const { color, icon, progress } = statusConfig[exercise.status] || statusConfig.default;

    const handleMouseMove = (e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
        radius.set(e.currentTarget.offsetWidth * 1.5);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`group relative p-6 rounded-xl cursor-pointer transition-all
        ${isSelected
                    ? `border-2 border-${color}-500/50 bg-gradient-to-br from-${color}-500/10 to-${color}-500/5`
                    : "border border-gray-200/50 hover:border-emerald-300/30 bg-white"
                }`}
            style={{
                boxShadow: isSelected
                    ? `0 10px 30px -10px rgba(var(--${color}-500-rgb), 0.3)`
                    : "0 4px 20px -6px rgba(0, 0, 0, 0.1)",
            }}
        >
            {/* Hover Gradient Effect */}
            {!isSelected && (
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background,
                        "--completed-hover": "rgba(16, 185, 129, 0.03)",
                        "--pending-hover": "rgba(245, 158, 11, 0.03)",
                        "--rejected-hover": "rgba(244, 63, 94, 0.03)",
                        "--unfinished-hover": "rgba(107, 114, 128, 0.03)",
                    }}
                />
            )}

            {/* Animated Border */}
            {isSelected && (
                <motion.div
                    className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        borderColor: [
                            `var(--${color}-500)`,
                            `var(--${color}-200)`,
                            `var(--${color}-500)`,
                        ],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                    style={{
                        borderImage: `linear-gradient(120deg, var(--${color}-500) 0%, var(--${color}-200) 50%, var(--${color}-500) 100%) 1`,
                    }}
                />
            )}

            <div className="flex items-center justify-between relative z-10 gap-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected
                                ? `bg-${color}-500 text-white`
                                : `bg-${color}-50 text-${color}-500`
                                }`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="font-bold text-xl">#{exercise.id}</span>
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {exercise.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {exercise.description}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className={`h-2 rounded-full bg-${color}-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, type: "spring" }}
                        />
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span
                            className={`px-3 py-1 rounded-full bg-${color}-100 text-${color}-700`}
                        >
                            {exercise.difficulty}
                        </span>
                        <span className="text-gray-500">
                            {exercise.status === "rejected" ? (
                                <span className="text-rose-600">❌ رد شده</span>
                            ) : (
                                `⏳ مهلت: ${exercise.deadline}`
                            )}
                        </span>
                    </div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {icon}
                </motion.div>
            </div>

            {/* Floating Particles */}
            {isSelected && (
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-1 h-1 bg-${color}-400 rounded-full`}
                            initial={{
                                opacity: 0,
                                x: Math.random() * 100 - 50,
                                y: Math.random() * 100 - 50,
                            }}
                            animate={{
                                opacity: [0, 0.4, 0],
                                x: Math.random() * 100 - 50,
                                y: Math.random() * 100 - 50,
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ExerciseCard;
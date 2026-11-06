import { motion } from "framer-motion";
import { BookOpen, Lock, CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CourseGrid = () => {
    const router = useRouter();

    const technologies = [
        {
            name: "HTML/CSS",
            levels: [
                {
                    name: "مقدماتی",
                    status: "completed",
                    progress: 100,
                    startDate: "1403/02/15",
                    endDate: "1403/03/30",
                    exercises: "20 از 20"
                },
                {
                    name: "متوسط",
                    status: "in-progress",
                    progress: 65,
                    startDate: "1403/03/01",
                    endDate: "1403/04/15",
                    exercises: "13 از 20"
                },
                {
                    name: "پیشرفته",
                    status: "locked",
                    requiresPurchase: true
                }
            ]
        },
        {
            name: "Tailwind",
            levels: [
                {
                    name: "مقدماتی",
                    status: "locked",
                },
                {
                    name: "متوسط",
                    status: "locked",

                },
                {
                    name: "پیشرفته",
                    status: "locked",
                }
            ]
        },
        {
            name: "Javascript",
            levels: [
                {
                    name: "مقدماتی",
                    status: "locked",
                },
                {
                    name: "متوسط",
                    status: "locked",

                },
                {
                    name: "پیشرفته",
                    status: "locked",
                }
            ]
        },
        {
            name: "React",
            levels: [
                {
                    name: "مقدماتی",
                    status: "locked",
                },
                {
                    name: "متوسط",
                    status: "locked",

                },
                {
                    name: "پیشرفته",
                    status: "locked",
                }
            ]
        },
    ];

    const handleCellClick = (level) => {
        if (level.status === "locked") {
            if (level.requiresPurchase) {
                router.push("/account/purchase");
            } else {
                toast.warning("لطفا فصل قبلی را تکمیل کنید!");
            }
        }
    };

    const StatusCell = ({ level }) => {
        const baseClasses = "rounded-xl p-6 border-2 relative overflow-hidden cursor-pointer transition-all h-full";
        const cardVariants = {
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                    type: "spring",
                    stiffness: 120,
                    damping: 10
                }
            },
            hover: { scale: 1.02 }
        };

        if (level.status === "completed") {
            return (
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    className={`${baseClasses} bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg`}
                >
                    <motion.div
                        className="flex flex-col gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                                <h3 className="text-xl font-bold text-blue-800">{level.name}</h3>
                            </div>
                            <span className=" bg-blue-500 text-white px-3 py-1 rounded-full text-xs shadow-md">
                                تکمیل شده
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-blue-600">
                                <span>شروع دوره :</span>
                                <span className="text-blue-700">{level.startDate}</span>
                            </div>
                            <div className="flex justify-between text-sm text-blue-600">
                                <span>پایان دوره :</span>
                                <span className="text-blue-700">{level.endDate}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <ProgressBar progress={level.progress} color="blue" />
                            <div className="flex justify-between text-sm text-blue-600">
                                <span>تمرینات:</span>
                                <span className="text-blue-700 font-medium">{level.exercises}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            );
        }

        if (level.status === "in-progress") {
            return (
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    className={`${baseClasses} bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg`}
                >

                    <motion.div
                        className="flex flex-col gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-purple-600" />
                                <h3 className="text-xl font-bold text-purple-800">{level.name}</h3>
                            </div>
                            <span className=" bg-purple-500 text-white px-3 py-1 rounded-full text-xs shadow-md">
                                درحال برگزاری                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-purple-600">
                                <span>شروع دوره :</span>
                                <span className="text-purple-700">{level.startDate}</span>
                            </div>
                            <div className="flex justify-between text-sm text-purple-600">
                                <span>پایان دوره :</span>
                                <span className="text-purple-700">{level.endDate}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <ProgressBar progress={level.progress} color="purple" />
                            <div className="flex justify-between text-sm text-purple-600">
                                <span>تمرینات:</span>
                                <span className="text-purple-700 font-medium">{level.exercises}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            );
        }

        return (
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                whileHover="hover"
                className={`${baseClasses} flex items-center justify-center bg-gradient-to-br from-orange-50/80 to-orange-100/50 border-dashed border-orange-300 shadow-lg py-5`}
                onClick={() => handleCellClick(level)}
            >
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                >
                    <Lock className="w-12 h-12 text-orange-400" />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-orange-700">{level.name}</h3>
                        {level.requiresPurchase ? (
                            <motion.div
                                className="mt-2 flex items-center gap-1 text-orange-600"
                                whileHover={{ scale: 1.05 }}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>نیاز به خرید دوره</span>
                            </motion.div>
                        ) : (
                            <p className="text-orange-600 text-sm mt-2">تکمیل فصل قبل نیاز است</p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="pt-10 px-4">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                        type: "spring",
                        stiffness: 120,
                        delay: 0.3
                    }
                }}
                className="text-3xl md:text-4xl font-bold mb-8 relative"
            >
                <div className="inline-block relative">
                    <span className="text-[#042A1B]">
                        مسیر یادگیری حرفه‌ای
                    </span>


                </div>

            </motion.h1>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-10"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.15,
                            delayChildren: 0.2
                        }
                    }
                }}
            >
                {technologies.map((tech) => (
                    <motion.div
                        key={tech.name}
                        className="flex flex-col gap-6"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                        }}
                    >
                        <motion.h2
                            className="text-2xl font-bold text-gray-800 border-r-4 border-green-500 pr-2"
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ type: "spring" }}
                        >
                            {tech.name}
                        </motion.h2>
                        <div className="grid grid-rows-3 gap-6 flex-1">
                            {tech.levels.map((level) => (
                                <StatusCell key={level.name} level={level} />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

const ProgressBar = ({ progress, color }) => {
    const colorGradients = {
        purple: "from-purple-400 to-purple-500",
        blue: "from-blue-400 to-blue-500",
        orange: "from-orange-400 to-orange-500",
    };

    return (
        <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`bg-gradient-to-r ${colorGradients[color]} h-2 rounded-full shadow-md`}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    );
};

export default CourseGrid;
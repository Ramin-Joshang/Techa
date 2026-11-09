import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import { BookOpen, CheckCircle, Play, Zap } from 'lucide-react'

const HeroSection = ({ data, onVideoClick }) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const radius = useMotionValue(0)
    const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.1), transparent 80%)`

    const handleMouseMove = (e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - left)
        mouseY.set(e.clientY - top)
        radius.set(800)
    }

    data = {
        title: "آموزش React.js پروژه محور",
        excerpt: `این دوره به شما کمک می‌کند تا مهارت‌های خود را به سطح حرفه‌ای برسانید و در پروژه‌های واقعی بدرخشید؛ همچنین از تجربیات اساتید مجرب بهره‌مند شوید.`,
        image: "/images/blog-1.png",
        prerequisites: [
            "آشنایی مقدماتی با JavaScript",
            "مفاهیم پایه HTML و CSS",
            "آشنایی با ES6+",
            "تجربه کار با Git"
        ],
        details: {
            price: 1990000,
            discountPrice: 1490000,
            duration: "42 ساعت",
            level: "مبتدی تا پیشرفته",
            lastUpdate: "1403/02/15",
            instructor: {
                name: "رامین جوشنگ",
                avatar: "/images/teacher.jpg",
                resume: "/instructors/ramin-joshang"
            },
            features: [
                "پروژه‌محور و کاربردی",
                "پشتیبانی مستقیم مدرس",
                "به‌روزرسانی رایگان",
                "مدرک معتبر پایان دوره"
            ]
        },
        rating: 4.8,
        reviews: 124,
        videoPreview: "https://example.com/video-preview.mp4"
    };

    return (
        <header
            className="relative overflow-hidden bg-white"
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{ background }}
            />

            <div className="relative z-10">
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* عنوان و توضیحات */}


                    {/* ویدیوی معرفی */}
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="relative aspect-video rounded-2xl overflow-hidden border-2 border-emerald-100 cursor-pointer group"
                        onClick={onVideoClick}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/40 via-transparent to-emerald-100/40" />

                        <Image
                            src={data.image}
                            alt={data.title}
                            fill
                            className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                            placeholder="blur"
                            blurDataURL="/images/blur.jpeg"
                        />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="p-5 bg-emerald-600 rounded-full border-4 border-white shadow-lg"
                            >
                                <Play className="sm:w-12 w-6 sm:h-12 h-6 fill-current text-white" />
                            </motion.div>
                        </div>

                        <div className="absolute bottom-3 sm:bottom-6 right-6 left-6 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full text-emerald-600 backdrop-blur-sm">
                                <Zap className="w-5 h-5 animate-pulse" />
                                ویدئوی معرفی دوره
                            </span>
                            <span className="bg-white/90 px-4 py-2 rounded-full text-emerald-600 backdrop-blur-sm">
                                89 درس عملی
                            </span>
                        </div>
                    </motion.div>


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        {/* <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            {data.title}
                        </h1> */}

                        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-medium">
                            {data.excerpt}
                        </p>
                    </motion.div>

                    {/* پیش‌نیازها */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-3"
                    >
                        {data.prerequisites.map((req, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100"
                            >
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">{req}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </header>
    )
}

export default HeroSection
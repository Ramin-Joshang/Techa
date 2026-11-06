"use client"
import { motion } from 'framer-motion'
import { Clock, Users, Rocket, Code2, BrainCircuit, BadgeCheck, Linkedin, Twitter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProjectDetail({ params }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('description')

    const project = projects.find(project => project.id == params.id)

    if (!project) {
        return (
            <div className="text-center py-20 text-gray-500">
                پروژه مورد نظر یافت نشد
            </div>
        )
    }

    return (
        <div className="container mx-auto 2xl:px-20 px-5 pt-32">

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}

            >
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Gallery */}
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="grid gap-4 mb-8"
                        >
                            <div className="relative h-96 rounded-2xl overflow-hidden bg-emerald-50 border-4 border-emerald-100">
                                <img
                                    src={project.gallery[0]}
                                    className="w-full h-full object-cover"
                                    alt={project.title}
                                />
                                <div className="absolute bottom-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-full text-sm">
                                    🚀 پروژه فعال
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {project.gallery.slice(1).map((img, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        className="aspect-square rounded-xl overflow-hidden bg-emerald-50 border-2 border-emerald-100"
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="border-2 border-emerald-100 rounded-xl bg-white shadow-lg mb-8">
                            <div className="flex border-b-2 border-emerald-100">
                                {['description', 'requirements', 'timeline'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-4 text-sm font-bold relative transition-all ${activeTab === tab
                                            ? 'text-emerald-600 bg-emerald-50 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-emerald-500'
                                            : 'text-gray-600 hover:bg-emerald-50/50'
                                            }`}
                                    >
                                        {tab === 'description' && '📝 توضیحات پروژه'}
                                        {tab === 'requirements' && '🎯 نیازمندی‌ها'}
                                        {tab === 'timeline' && '⏳ زمانبندی'}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {activeTab === 'description' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="prose text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: project.description }}
                                    />
                                )}

                                {activeTab === 'requirements' && (
                                    <motion.ul
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        {project.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <BadgeCheck className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-emerald-800">{req.title}</h3>
                                                    <p className="text-gray-600 mt-1">{req.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}

                                {activeTab === 'timeline' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="relative pl-6 border-l-4 border-emerald-200"
                                    >
                                        {project.timeline.map((stage, i) => (
                                            <div key={i} className="relative mb-8 group">
                                                <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[10px] top-2 ring-4 ring-emerald-100" />
                                                <div className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all">
                                                    <h3 className="font-bold text-emerald-800 text-lg">{stage.title}</h3>
                                                    <div className="flex items-center gap-2 mt-2 text-emerald-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-sm">{stage.date}</span>
                                                    </div>
                                                    <p className="mt-2 text-gray-700">{stage.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-96 space-y-6">
                        {/* Project Status Card */}
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-emerald-800">{project.title}</h2>
                                <span className={`px-3 py-1 rounded-full text-sm ${project.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {project.status === 'active' ? '✅ فعال' : '🔄 در حال بررسی'}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2 text-emerald-700">
                                    <span>پیشرفت پروژه</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                        transition={{ duration: 0.8 }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <Users className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-emerald-600">ظرفیت</p>
                                            <p className="font-bold text-emerald-800">
                                                {project.currentInterns}/{project.requiredInterns}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <Code2 className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-emerald-600">سطح دشواری</p>
                                            <p className="font-bold text-emerald-800">{project.difficulty}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${project.currentInterns < project.requiredInterns
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                disabled={project.currentInterns >= project.requiredInterns}
                            >
                                {project.currentInterns < project.requiredInterns
                                    ? '✨ ارسال درخواست همکاری'
                                    : '⛔ ظرفیت تکمیل شده'}
                            </motion.button>
                        </motion.div>

                        {/* Team Card */}
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-100"
                        >
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-emerald-800">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <BrainCircuit className="w-6 h-6 text-emerald-600" />
                                </div>
                                تیم پروژه
                            </h3>
                            <div className="space-y-4">
                                {project.team.map((member, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-200">
                                            <img src={member.avatar} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-800">{member.name}</p>
                                            <p className="text-sm text-emerald-600">{member.role}</p>
                                            <div className="flex gap-2 mt-1">
                                                <button className="text-emerald-500 hover:text-emerald-700">
                                                    <Twitter className="w-4 h-4" />
                                                </button>
                                                <button className="text-emerald-500 hover:text-emerald-700">
                                                    <Linkedin className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


const projects = [
    {
        id: 1,
        title: "سامانه خدمات شهری",
        image: "/images/project.svg",
        status: "analysis",
        requiredInterns: 3,
        currentInterns: 1,
        progress: 45,
        difficulty: "متوسط",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>سامانه مدیریت پیمانکاران شهری</h2>
            <p>ویژگی‌های کلیدی:</p>
            <ul>
                <li>سیستم رهگیری هوشمند درخواست‌ها</li>
                <li>داشبورد مدیریتی پیشرفته</li>
                <li>یکپارچه‌سازی با سامانه‌های شهرداری</li>
                <li>یکپارچه‌سازی با سامانه‌های شهرداری</li>
            </ul>
        `,
        requirements: [
            {
                title: "تسلط به React & TypeScript",
                description: "حداقل 2 سال تجربه توسعه فرانت‌اند"
            },
            {
                title: "آشنایی با میکروسرویس‌ها",
                description: "تجربه کار با معماری‌های توزیع‌شده"
            }
        ],
        timeline: [
            {
                title: "فاز طراحی",
                date: "1403/01/15",
                description: "تکمیل وایرفریم‌ها و طراحی UI/UX"
            },
            {
                title: "توسعه اولیه",
                date: "1403/03/01",
                description: "پیاده‌سازی ماژول‌های اصلی"
            }
        ],
        team: [
            {
                name: "علی رضایی",
                role: "توسعه‌دهنده ارشد",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "فاطمه محمدی",
                role: "طراح رابط کاربری",
                avatar: "/images/teacher.jpeg"
            }
        ]
    },
    {
        id: 2,
        title: "پلتفرم فروش پوشاک دخترانه",
        image: "/images/project.svg",
        status: "active",
        requiredInterns: 2,
        currentInterns: 0,
        progress: 20,
        difficulty: "مبتدی",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>سیستم فروش آنلاین پوشاک</h2>
            <p>امکانات اصلی:</p>
            <ul>
                <li>نمایشگر سه بعدی محصولات</li>
                <li>سیستم پیشنهاد هوشمند</li>
                <li>پنل مدیریت پیشرفته</li>
            </ul>
        `,
        requirements: [
            {
                title: "تسلط به Vue.js",
                description: "تجربه کار با Vue 3 و Vite"
            },
            {
                title: "آشنایی با Three.js",
                description: "توانایی کار با گرافیک سه بعدی"
            }
        ],
        timeline: [
            {
                title: "تحلیل بازار",
                date: "1402/12/01",
                description: "بررسی نیازهای مشتریان و رقبا"
            }
        ],
        team: [
            {
                name: "سارا احمدی",
                role: "توسعه‌دهنده فول استک",
                avatar: "/images/teacher.jpeg"
            }
        ]
    },
    {
        id: 3,
        title: "سامانه مشاوره شغلی",
        image: "/images/project.svg",
        status: "active",
        requiredInterns: 2,
        currentInterns: 1,
        progress: 30,
        difficulty: "متوسط",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>سیستم راهنمایی شغلی هوشمند</h2>
            <p>قابلیت‌های اصلی:</p>
            <ul>
                <li>تست‌های شخصیت‌شناسی شغلی</li>
                <li>ارتباط با کارفرمایان</li>
                <li>دوره‌های آموزشی آنلاین</li>
            </ul>
        `,
        requirements: [
            {
                title: "تجربه کار با Node.js",
                description: "توسعه API های RESTful"
            },
            {
                title: "آشنایی با پایگاه داده MongoDB",
                description: "طراحی Schema و بهینه‌سازی کوئری‌ها"
            }
        ],
        timeline: [
            {
                title: "پژوهش اولیه",
                date: "1402/11/01",
                description: "جمع‌آوری داده‌های بازار کار"
            },
            {
                title: "توسعه هسته",
                date: "1403/02/01",
                description: "پیاده‌سازی الگوریتم‌های پیشنهاد شغلی"
            }
        ],
        team: [
            {
                name: "محمد حسینی",
                role: "توسعه‌دهنده بک‌اند",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "زهرا کریمی",
                role: "متخصص داده",
                avatar: "/images/teacher.jpeg"
            }
        ]
    },
    {
        id: 4,
        title: "پلتفرم باشگاه مشتریان",
        image: "/images/project.svg",
        status: "analysis",
        requiredInterns: 2,
        currentInterns: 2,
        progress: 85,
        difficulty: "پیشرفته",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>سیستم مدیریت ارتباط با مشتریان</h2>
            <p>ویژگی‌های کلیدی:</p>
            <ul>
                <li>پیگیری تعاملات مشتریان</li>
                <li>تحلیل رفتار مصرف‌کننده</li>
                <li>یکپارچه‌سازی با شبکه‌های اجتماعی</li>
            </ul>
        `,
        requirements: [
            {
                title: "تسلط به Python & Django",
                description: "تجربه ساخت سیستم‌های پیچیده"
            },
            {
                title: "آشنایی با یادگیری ماشین",
                description: "پیاده‌سازی مدل‌های پیش‌بینی"
            }
        ],
        timeline: [
            {
                title: "فاز آزمایشی",
                date: "1403/04/01",
                description: "راه‌اندازی نسخه بتا برای تست کاربران"
            }
        ],
        team: [
            {
                name: "رضا نوروزی",
                role: "معمار سیستم",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "نازنین صادقی",
                role: "توسعه‌دهنده هوش مصنوعی",
                avatar: "/images/teacher.jpeg"
            }
        ]
    },
    {
        id: 5,
        title: "پلتفرم قطعه‌سازان صنعتی",
        image: "/images/project.svg",
        status: "active",
        requiredInterns: 3,
        currentInterns: 0,
        progress: 15,
        difficulty: "پیشرفته",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>اکوسیستم ارتباط تولیدکنندگان</h2>
            <p>امکانات اصلی:</p>
            <ul>
                <li>مدیریت زنجیره تأمین</li>
                <li>سیستم حراج آنلاین</li>
                <li>پلتفرم همکاری مشترک</li>
            </ul>
        `,
        requirements: [
            {
                title: "تسلط به Java & Spring Boot",
                description: "تجربه توسعه سیستم‌های سازمانی"
            },
            {
                title: "آشنایی با سیستم‌های توزیع‌شده",
                description: "کار با Kafka و RabbitMQ"
            }
        ],
        timeline: [
            {
                title: "تحلیل نیازمندی‌ها",
                date: "1403/05/01",
                description: "جمع‌بندی نیازهای ذینفعان"
            }
        ],
        team: [
            {
                name: "امیرحسین محمودی",
                role: "توسعه‌دهنده بک‌اند",
                avatar: "/images/teacher.jpeg"
            }
        ]
    },
    {
        id: 6,
        title: "پلتفرم ارتباط صنعت و دانشگاه",
        image: "/images/project.svg",
        status: "analysis",
        requiredInterns: 4,
        currentInterns: 2,
        progress: 55,
        difficulty: "متوسط",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>سامانه همکاری دانشجویی</h2>
            <p>قابلیت‌های کلیدی:</p>
            <ul>
                <li>مدیریت پروژه‌های تحقیقاتی</li>
                <li>سیستم جستجوی پیشرفته</li>
                <li>پنل مدیریت چندسطحی</li>
            </ul>
        `,
        requirements: [
            {
                title: "تسلط به PHP & Laravel",
                description: "تجربه توسعه سیستم‌های تحت وب"
            },
            {
                title: "آشنایی با Elasticsearch",
                description: "پیاده‌سازی جستجوی پیشرفته"
            }
        ],
        timeline: [
            {
                title: "طراحی معماری",
                date: "1403/06/01",
                description: "تعیین ساختار کلی سیستم"
            },
            {
                title: "توسعه ماژول‌ها",
                date: "1403/07/01",
                description: "پیاده‌سازی بخش‌های اصلی"
            }
        ],
        team: [
            {
                name: "مریم اکبری",
                role: "توسعه‌دهنده فول استک",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "حسین رحیمی",
                role: "مدیر پروژه",
                avatar: "/images/teacher.jpeg"
            }
        ]
    },
    {
        id: 7,
        title: "پلتفرم آنالیز قراردادها",
        image: "/images/project.svg",
        status: "active",
        requiredInterns: 2,
        currentInterns: 1,
        progress: 25,
        difficulty: "متوسط",
        gallery: [
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg",
            "/images/project.svg"
        ],
        description: `
            <h2>سیستم تحلیل قراردادهای حقوقی</h2>
            <p>ویژگی‌های کلیدی:</p>
            <ul>
                <li>تحلیل خودکار قراردادها</li>
                <li>سیستم هشدار برای تاریخ‌های مهم</li>
                <li>گزارش‌گیری پیشرفته</li>
            </ul>
        `,
        requirements: [
            {
                title: "تسلط به C# & .NET",
                description: "تجربه کار با ASP.NET Core"
            },
            {
                title: "آشنایی با پایگاه داده SQL Server",
                description: "طراحی و بهینه‌سازی پایگاه داده"
            }
        ],
        timeline: [
            {
                title: "تحلیل نیازمندی‌ها",
                date: "1403/08/01",
                description: "جمع‌آوری نیازهای کاربران"
            },
            {
                title: "توسعه اولیه",
                date: "1403/09/01",
                description: "پیاده‌سازی ماژول‌های اصلی"
            }
        ],
        team: [
            {
                name: "علی نیکو",
                role: "توسعه‌دهنده ارشد",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "سعید حسینی",
                role: "تحلیل‌گر سیستم",
                avatar: "/images/teacher.jpeg"
            }
        ]
    }
];
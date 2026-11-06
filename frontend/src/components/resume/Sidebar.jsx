"use client";
import {
    Linkedin,
    Github,
    Mail,
    Download,
    Languages,
    User,
    Calendar,
    Phone,
    MapPin,
    Shield,
    Clipboard,
    Share2,
    QrCode,
    CheckCircle,
    Twitter,
    Send,
    Globe,
    Instagram,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";

const profile = {
    name: "رامین جوشنگ",
    title: "توسعه دهنده فول استک",
    image: "/images/teacher.jpeg",
    email: "example@domain.com",
    linkedin: "#",
    github: "#",
    instagram: "#",
    twitter: "#",
    about:
        "من رامین جوشنگ، توسعه‌دهنده فول استک با تجربه بالا در زمینه توسعه وب، موبایل و نرم‌افزارهای ابری هستم. علاقه‌مند به یادگیری فناوری‌های نوین و بهینه‌سازی تجربه کاربری. همیشه در جستجوی راه‌حل‌های نوآورانه برای چالش‌های پیچیده می‌باشم.",
    languages: ["فارسی", "انگلیسی"],
    personalInfo: {
        maritalStatus: "مجرد",
        birthDate: "۱۳۷۵/۰۵/۱۵",
        phone: "09195993264",
        city: "تهران",
        militaryStatus: "معافیت تحصیلی",
        // address: "ایران، تهران",
        startDate: "۱۴۰۰/۰۱/۰۱",
        // workExperience: "۳ سال",
        // residenceStatus: "اقامت دائم",
        jobStatus: "فعال",
    },
    projects: 42,
    certifications: 8,
    education: [
        {
            degree: "کارشناسی مهندسی کامپیوتر",
            institution: "دانشگاه تهران",
            year: "۱۳۹۹",
        },
        {
            degree: "کارشناسی ارشد مهندسی نرم‌افزار",
            institution: "دانشگاه علم و صنعت ایران",
            year: "۱۴۰۱",
        },
    ],
};

export default function Sidebar() {
    const params = useParams();
    const { id } = params;

    const [isCopied, setIsCopied] = useState(false);
    const [isQrVisible, setIsQrVisible] = useState(false);
    const [currentPlatform, setCurrentPlatform] = useState(null);
    const qrSize = 256;
    const resumeUrl = `https://techa.ir/r/${id}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(resumeUrl);
            setIsCopied(true);
            toast.success("لینک رزومه با موفقیت کپی شد!");
            setTimeout(() => {
                setIsCopied(false);
            }, 5500);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById("qr-canvas");
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `${profile.name}-resume-qrcode.png`;
        link.href = pngUrl;
        link.click();
    };

    const SocialIcon = ({ platform, className }) => {
        const iconConfig = {
            twitter: <Twitter className={className} />,
            linkedin: <Linkedin className={className} />,
            telegram: <Send className={className} />,
            whatsapp: <Phone className={className} />,
            email: <Mail className={className} />,
        };
        return iconConfig[platform.toLowerCase()] || <Globe className={className} />;
    };

    const QrModal = () => {
        return (

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setIsQrVisible(false)}
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-2xl p-8 shadow-2xl text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-6">
                        <QRCodeSVG
                            id="qr-canvas"
                            value={resumeUrl}
                            size={qrSize}
                            level="H"
                            includeMargin
                            imageSettings={{
                                src: profile.image,
                                excavate: true,
                                width: qrSize * 0.2,
                                height: qrSize * 0.2,
                            }}
                        />
                    </div>
                    <div className="flex gap-3 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownloadQR}
                            className="bg-green-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            دانلود QR
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsQrVisible(false)}
                            className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl"
                        >
                            بستن
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )
    };

    return (
        <div className="relative w-full md:max-w-96 min-h-screen p-5 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-l border-gray-200 overflow-hidden">
            {/* Profile Section */}
            <div className="flex flex-col items-center">
                <div className="relative p-1 rounded-full bg-gradient-to-br from-green-500 to-green-700 mb-6 shadow-lg">
                    <div className="p-1.5 bg-white rounded-full">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            src={profile.image}
                            alt="Profile"
                            className="w-36 h-36 rounded-full border-4 border-white object-cover cursor-pointer shadow-md"
                        />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
                <p className="text-gray-600 mt-2 text-center text-sm font-light">
                    {profile.title}
                </p>
            </div>

            {/* About Me Section */}
            <div className="my-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-500">
                    <User className="w-5 h-5" />
                    درباره من
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{profile.about}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 my-8">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="text-2xl font-bold text-green-500">
                        {profile.projects}+
                    </div>
                    <div className="text-xs text-gray-500 mt-1">پروژه انجام شده</div>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="text-2xl font-bold text-green-500">
                        {profile.certifications}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">گواهینامه</div>
                </motion.div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-8" />

            {/* Contact List */}
            <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-500">
                    <Mail className="w-5 h-5" />
                    راه‌های ارتباطی
                </h3>
                <ul className="space-y-3">
                    {[
                        { icon: Mail, text: profile.email, href: `mailto:${profile.email}` },
                        { icon: Linkedin, text: "LinkedIn", href: profile.linkedin },
                        { icon: Github, text: "GitHub", href: profile.github },
                        { icon: Instagram, text: "Instagram", href: profile.instagram },
                        { icon: Twitter, text: "Twitter", href: profile.twitter },
                    ].map((item, index) => (
                        <motion.li
                            key={index}
                            whileHover={{ x: 5 }}
                            className="flex items-center p-3 rounded-xl bg-white border border-gray-200 hover:border-green-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <item.icon className="w-5 h-5 ml-3 text-green-500" />
                            <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-700"
                            >
                                {item.text}
                            </a>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Languages Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-500">
                    <Languages className="w-5 h-5" />
                    تسلط زبان‌ها
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {profile.languages.map((lang, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="p-3 rounded-xl bg-white border border-gray-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
                        >
                            <span className="text-sm text-gray-700">{lang}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Personal Info Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-500">
                    <User className="w-5 h-5" />
                    اطلاعات فردی
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(profile.personalInfo).map(([key, value], index) => {
                        const icons = {
                            maritalStatus: <User className="w-5 h-5 ml-3 text-green-500" />,
                            birthDate: <Calendar className="w-5 h-5 ml-3 text-green-500" />,
                            phone: <Phone className="w-5 h-5 ml-3 text-green-500" />,
                            city: <MapPin className="w-5 h-5 ml-3 text-green-500" />,
                            militaryStatus: <Shield className="w-5 h-5 ml-3 text-green-500" />,
                            address: <MapPin className="w-5 h-5 ml-3 text-green-500" />,
                            startDate: <Calendar className="w-5 h-5 ml-3 text-green-500" />,
                            workExperience: <User className="w-5 h-5 ml-3 text-green-500" />,
                            residenceStatus: <Shield className="w-5 h-5 ml-3 text-green-500" />,
                            jobStatus: <User className="w-5 h-5 ml-3 text-green-500" />,
                        };

                        return (
                            <motion.div
                                key={index}
                                className="flex items-center p-3 rounded-xl bg-white border border-gray-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
                            >
                                {icons[key]}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">{value}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Education Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-500">
                    <Calendar className="w-5 h-5" />
                    تحصیلات
                </h3>
                <ul className="space-y-3">
                    {profile.education.map((edu, index) => (
                        <motion.li
                            key={index}
                            whileHover={{ x: 5 }}
                            className="flex flex-col p-3 rounded-xl bg-white border border-gray-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
                        >
                            <p className="text-sm text-gray-700 font-semibold">{edu.degree}</p>
                            <p className="text-xs text-gray-500">
                                {edu.institution} - {edu.year}
                            </p>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Share Section */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-50 to-white border-2 border-green-100 hover:border-green-200 transition-all shadow-lg hover:shadow-xl group">
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />

                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-green-600">
                    <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Share2 className="w-6 h-6 text-green-500 transform transition-transform group-hover:rotate-12" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        اشتراک‌گذاری هوشمند رزومه
                    </span>
                </h3>

                <div className="flex gap-3">
                    <motion.div
                        className="relative flex-1"
                        whileHover="hover"
                        variants={{
                            hover: { scale: 1.02 },
                        }}
                    >
                        <motion.button
                            onClick={handleCopy}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-noise opacity-10" />

                            <motion.span
                                key={isCopied ? "copied" : "copy"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 text-sm"
                            >
                                {isCopied ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-white animate-tick" />
                                        <span className="text-white font-medium tracking-tight">
                                            لینک کپی شد!
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Clipboard className="w-5 h-5 text-white" />
                                        <span className="text-white font-medium tracking-tight">
                                            {resumeUrl}
                                        </span>
                                    </>
                                )}
                            </motion.span>

                            {!isCopied && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0"
                                    variants={{
                                        hover: { opacity: 1 },
                                    }}
                                />
                            )}
                        </motion.button>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsQrVisible(true)}
                        className="p-1 rounded-xl bg-white border-2 border-emerald-100 hover:border-emerald-200 flex items-center justify-center shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <QrCode className="w-8 h-8 text-emerald-600" />
                        {/* <span className="text-sm text-emerald-600 mr-2"></span> */}
                    </motion.button>
                </div>

                {isCopied && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex justify-center gap-4"
                    >
                        {["twitter", "linkedin", "telegram", "whatsapp", "email"].map(
                            (platform) => (
                                <motion.button
                                    key={platform}
                                    whileHover={{ y: -3, scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onHoverStart={() => setCurrentPlatform(platform)}
                                    onHoverEnd={() => setCurrentPlatform(null)}
                                    className="p-2 rounded-lg bg-white border border-emerald-100 hover:border-emerald-200 shadow-xs relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <SocialIcon platform={platform} className="w-6 h-6 text-emerald-600" />
                                    {currentPlatform === platform && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap"
                                        >
                                            {platform}
                                        </motion.span>
                                    )}
                                </motion.button>
                            )
                        )}
                    </motion.div>
                )}
            </div>

            {/* Download Button */}
            {/* <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-5"
            >
                <button className="w-full bg-gradient-to-r from-green-500 to-green-700 p-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white hover:shadow-lg transition-all">
                    <Download className="w-5 h-5" />
                    دانلود رزومه
                </button>
            </motion.div> */}

            {isQrVisible && <QrModal />}
        </div>
    );
}
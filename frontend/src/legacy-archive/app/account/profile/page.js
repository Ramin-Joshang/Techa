'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, FileText, Camera, CheckCircle,
    Globe, Instagram, Twitter, Linkedin, Edit3,
    ShieldCheck, Lock, ChevronLeft, Save, Loader2, Send
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser, updateUserSocialMedia } from '../../../features/account/user/UserActions';
import { toast } from 'react-toastify';

// انیمیشن‌ها
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Profile() {
    const dispatch = useDispatch();
    const { user, loading: userLoading } = useSelector((state) => state.user);
    const userId = useSelector((state) => state.auth.user?.Id) || 9;

    const [imagePreview, setImagePreview] = useState(null);
    const [activeSection, setActiveSection] = useState('personal');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // وضعیت فرم اطلاعات شخصی
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Mobile: '',
        Email: '',
        NationalCode: '',
    });

    // وضعیت شبکه‌های اجتماعی
    const [socialMedia, setSocialMedia] = useState({
        Instagram: { enabled: false, value: '', icon: <Instagram />, color: 'text-pink-600', bg: 'bg-pink-50' },
        Twitter: { enabled: false, value: '', icon: <Twitter />, color: 'text-sky-500', bg: 'bg-sky-50' },
        Linkedin: { enabled: false, value: '', icon: <Linkedin />, color: 'text-blue-700', bg: 'bg-blue-50' },
        Telegram: { enabled: false, value: '', icon: <FaTelegram />, color: 'text-blue-500', bg: 'bg-blue-50' },
        Whatsapp: { enabled: false, value: '', icon: <FaWhatsapp />, color: 'text-green-500', bg: 'bg-green-50' },
        Website: { enabled: false, value: '', icon: <Globe />, color: 'text-slate-600', bg: 'bg-slate-50' }
    });

    // وضعیت تایید ایمیل
    const [emailVerification, setEmailVerification] = useState({
        verified: false,
        pending: false,
        code: ''
    });

    // بارگذاری اولیه اطلاعات
    useEffect(() => {
        console.log("hi")
        if (userId) {

            dispatch(fetchUserById({ "@Id": userId }));
        }
    }, [dispatch, userId]);

    // پر کردن فرم‌ها پس از دریافت اطلاعات کاربر
    useEffect(() => {
        if (user) {
            setFormData({
                FirstName: user.FirstName || '',
                LastName: user.LastName || '',
                Mobile: user.Mobile || '',
                Email: user.Email || '',
                NationalCode: user.NationalCode || '',
            });

            if (user.SocialNetworks) {
                try {
                    const savedNetworks = JSON.parse(user.SocialNetworks).reduce((acc, item) => {
                        acc[item.Platform] = { enabled: item.IsEnabled, value: item.UrlOrId };
                        return acc;
                    }, {});

                    setSocialMedia(prev => {
                        const newState = { ...prev };
                        Object.keys(newState).forEach(key => {
                            if (savedNetworks[key]) {
                                newState[key] = { ...newState[key], ...savedNetworks[key] };
                            }
                        });
                        return newState;
                    });
                } catch (e) {
                    console.error("Error parsing social networks", e);
                }
            }
        }
    }, [user]);

    // هندل تغییر عکس
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            // اینجا می‌توانید تابع آپلود عکس را صدا بزنید
        }
    };

    // ذخیره اطلاعات کاربری
    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!formData.FirstName || !formData.LastName || !formData.NationalCode) {
            toast.warn("لطفا نام، نام خانوادگی و کد ملی را وارد نمایید.");
            return;
        }

        setLoading(true);
        const data = {
            "@Id": userId,
            "@FirstName": formData.FirstName,
            "@LastName": formData.LastName,
            "@Email": formData.Email,
            "@Mobile": formData.Mobile,
            "@NationalCode": formData.NationalCode,
            "@IsActive": true,
        };

        try {
            await dispatch(updateUser(data)).unwrap();
            toast.success('اطلاعات با موفقیت بروزرسانی شد');
            dispatch(fetchUserById({ "@Id": userId }));
        } catch (error) {
            toast.error(`خطا: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ذخیره شبکه‌های اجتماعی
    const handleSaveSocialMedia = async () => {
        setLoading(true);
        try {
            const socialNetworksArray = Object.keys(socialMedia).map(key => ({
                Platform: key,
                UrlOrId: socialMedia[key].value,
                IsEnabled: socialMedia[key].enabled
            }));

            await dispatch(updateUserSocialMedia({
                Id: userId,
                SocialNetworks: JSON.stringify(socialNetworksArray)
            })).unwrap();
            toast.success('شبکه‌های اجتماعی ذخیره شدند');
            dispatch(fetchUserById({ "@Id": userId }));

        } catch (error) {
            toast.error('خطا در ذخیره سازی');
        } finally {
            setLoading(false);
        }
    };

    // شبیه‌سازی تایید ایمیل
    const handleVerifyEmail = () => {
        setEmailVerification(prev => ({ ...prev, pending: true }));
        toast.info("کد تایید ارسال شد");
        setTimeout(() => setEmailVerification(prev => ({ ...prev, pending: false })), 2000);
    };

    const navItems = [
        { id: 'personal', label: 'اطلاعات شخصی', icon: <User className="w-5 h-5" /> },
        { id: 'social', label: 'شبکه‌های اجتماعی', icon: <Globe className="w-5 h-5" /> },
        { id: 'security', label: 'امنیت و ایمیل', icon: <ShieldCheck className="w-5 h-5" /> },
    ];

    return (
        <div className=" pb-10" dir="rtl">

            {/* هدر پس‌زمینه */}

            <div className="max-w-7xl mx-auto ">

                {/* کارت اصلی پروفایل (خلاصه وضعیت) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6 border border-white/50"
                >
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-cyan-400">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white relative">
                                <Image
                                    src={imagePreview || "/images/user.png"}
                                    alt="Profile"
                                    width={128}
                                    height={128}
                                    className="object-cover w-full h-full"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                >
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    <div className="text-center md:text-right flex-1">
                        <h1 className="text-3xl font-bold text-slate-800 mb-1">
                            {user?.FirstName && user?.LastName ? `${user.FirstName} ${user.LastName}` : 'کاربر مهمان'}
                        </h1>
                        <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
                            <Phone className="w-4 h-4" /> {user?.Mobile || '---'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div
                            className={`text-center px-6 py-2 rounded-2xl border 
    ${user?.IsActive
                                    ? "bg-emerald-50 border-emerald-100"
                                    : "bg-red-50 border-red-100"}`}
                        >
                            <span
                                className={`block text-xl font-bold 
      ${user?.IsActive ? "text-emerald-600" : "text-red-600"}`}
                            >
                                {user?.IsActive ? "فعال" : "غیرفعال"}
                            </span>
                            <span
                                className={`text-xs 
      ${user?.IsActive ? "text-emerald-400" : "text-red-400"}`}
                            >
                                وضعیت حساب
                            </span>
                        </div>

                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* منوی کناری */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3 space-y-4"
                    >
                        <div className="bg-white rounded-3xl shadow-lg p-4 sticky top-8">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all duration-300 group ${activeSection === item.id
                                        ? 'bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${activeSection === item.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {activeSection === item.id && <ChevronLeft className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* محتوای اصلی */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode='wait'>

                            {/* --- بخش اطلاعات شخصی --- */}
                            {activeSection === 'personal' && (
                                <motion.div
                                    key="personal"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
                                >
                                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                            <Edit3 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">ویرایش اطلاعات شخصی</h2>
                                            <p className="text-sm text-slate-500">مشخصات فردی خود را بروز نگه دارید</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { id: 'FirstName', label: 'نام', icon: <User />, type: 'text' },
                                            { id: 'LastName', label: 'نام خانوادگی', icon: <User />, type: 'text' },
                                            { id: 'NationalCode', label: 'کد ملی', icon: <FileText />, type: 'text', dir: 'ltr' },
                                            { id: 'Mobile', label: 'شماره موبایل', icon: <Phone />, type: 'tel', disabled: true, dir: 'ltr' },
                                            { id: 'Email', label: 'ایمیل', icon: <Mail />, type: 'email', dir: 'ltr' },
                                        ].map((field, idx) => (
                                            <motion.div variants={itemVariants} key={field.id} className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 block">{field.label}</label>
                                                <div className="relative group">
                                                    <div className="absolute top-3 right-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                        {field.icon}
                                                    </div>
                                                    <input
                                                        type={field.type}
                                                        disabled={field.disabled}
                                                        dir={field.dir || 'rtl'}
                                                        value={formData[field.id]}
                                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                        className={`w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${field.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}

                                        <motion.div variants={itemVariants} className="md:col-span-2 pt-6">
                                            <button
                                                disabled={loading}
                                                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                                <span>ذخیره تغییرات</span>
                                            </button>
                                        </motion.div>
                                    </form>
                                </motion.div>
                            )}

                            {/* --- بخش شبکه‌های اجتماعی --- */}
                            {activeSection === 'social' && (
                                <motion.div
                                    key="social"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
                                >
                                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">شبکه‌های اجتماعی</h2>
                                            <p className="text-sm text-slate-500">لینک‌های ارتباطی خود را مدیریت کنید</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {Object.entries(socialMedia).map(([key, data], idx) => (
                                            <motion.div
                                                variants={itemVariants}
                                                key={key}
                                                className={`p-5 rounded-2xl border transition-all duration-300 ${data.enabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-white'}`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl ${data.bg} ${data.color}`}>
                                                            {data.icon}
                                                        </div>
                                                        <span className="font-bold text-slate-700 capitalize">{key}</span>
                                                    </div>

                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={data.enabled}
                                                            onChange={(e) => setSocialMedia(prev => ({
                                                                ...prev,
                                                                [key]: { ...prev[key], enabled: e.target.checked }
                                                            }))}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                </div>

                                                <AnimatePresence>
                                                    {data.enabled && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <input
                                                                dir="ltr"
                                                                type="text"
                                                                placeholder={`لینک یا آیدی ${key} خود را وارد کنید`}
                                                                value={data.value}
                                                                onChange={(e) => setSocialMedia(prev => ({
                                                                    ...prev,
                                                                    [key]: { ...prev[key], value: e.target.value }
                                                                }))}
                                                                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSaveSocialMedia}
                                            disabled={loading}
                                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                            ذخیره تنظیمات
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- بخش امنیت و ایمیل --- */}
                            {activeSection === 'security' && (
                                <motion.div
                                    key="security"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
                                >
                                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">امنیت حساب</h2>
                                            <p className="text-sm text-slate-500">تایید هویت و ایمیل</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6">
                                        <div className="flex justify-between items-center flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white p-3 rounded-full shadow-sm text-slate-600">
                                                    <Mail className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-700">وضعیت ایمیل</h3>
                                                    <p className="text-sm text-slate-500 font-mono mt-1">{formData.Email || 'ایمیلی ثبت نشده'}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${emailVerification.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {emailVerification.verified ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                {emailVerification.verified ? 'تایید شده' : 'تایید نشده'}
                                            </div>
                                        </div>

                                        {!emailVerification.verified && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-6 pt-6 border-t border-slate-200"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <button
                                                        onClick={handleVerifyEmail}
                                                        disabled={emailVerification.pending}
                                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {emailVerification.pending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-4 h-4" />}
                                                        ارسال کد تایید
                                                    </button>
                                                    <div className="flex-[2] relative">
                                                        <input
                                                            type="text"
                                                            placeholder="کد تایید را اینجا وارد کنید"
                                                            className="w-full h-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-center tracking-widest font-mono"
                                                            maxLength={6}
                                                        />
                                                    </div>
                                                    <button className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                                                        تایید نهایی
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm flex items-start gap-3">
                                        <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>جهت حفظ امنیت حساب کاربری خود، از به اشتراک گذاشتن کد تایید با دیگران جداً خودداری کنید. پشتیبانی سایت هرگز از شما کد تایید نمی‌خواهد.</p>
                                    </div>

                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
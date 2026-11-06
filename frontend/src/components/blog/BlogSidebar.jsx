import { motion } from 'framer-motion';
import { Folder, Bookmark, Flame, Send } from 'lucide-react';

export const BlogSidebar = () => {
    const categories = ['همه', 'تکنولوژی', 'برنامه‌نویسی', 'هوش مصنوعی', 'دیزاین'];
    const popularPosts = [
        { title: '۱۰ فریمورک برتر ۲۰۲۴', views: '۱۲k' },
        { title: 'آموزش Next.js 14', views: '۸.۵k' },
        { title: 'راهنمای TypeScript', views: '۶.۲k' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            {/* دسته‌بندی‌ها */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-50">
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-emerald-700">
                    <Folder className="w-6 h-6 text-emerald-500 stroke-[1.5]" />
                    دسته‌بندی‌ها
                </h3>
                <ul className="space-y-2">
                    {categories.map((cat, index) => (
                        <motion.li
                            key={index}
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                        >
                            <span className="text-emerald-800 group-hover:text-emerald-600">{cat}</span>
                            <span className="text-emerald-500 text-sm bg-emerald-100 px-2 py-1 rounded-full">
                                {Math.floor(Math.random() * 20)}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* مقالات محبوب */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-50">
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-emerald-700">
                    <Flame className="w-6 h-6 text-emerald-500 fill-emerald-100 stroke-[1.5]" />
                    پربازدیدترین‌ها
                </h3>
                <div className="space-y-4">
                    {popularPosts.map((post, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-3 group"
                        >
                            <span className="text-emerald-500 text-lg font-bold">0{index + 1}</span>
                            <div className="flex-1">
                                <h4 className="font-medium text-emerald-800 group-hover:text-emerald-600 transition-colors">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-emerald-200 rounded-full" />
                                    <p className="text-sm text-emerald-500">{post.views} بازدید</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* خبرنامه */}
            <motion.div
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl shadow-lg border border-emerald-100"
                whileHover={{ scale: 1.02 }}
            >
                <h3 className="text-xl font-bold mb-6 text-emerald-800">عضویت در خبرنامه</h3>
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="آدرس ایمیل"
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 bg-white/80 focus:ring-2 focus:ring-emerald-300 placeholder:text-emerald-400/60"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                    >
                        <Send className="w-5 h-5" />
                        عضویت رایگان
                    </motion.button>
                </div>
                <p className="text-sm text-emerald-600/80 mt-4 text-center">
                    هیچ اسپمی ارسال نمی‌کنیم!
                </p>
            </motion.div>

            {/* بخش جدید: تگ‌های محبوب */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-50">
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-emerald-700">
                    <Bookmark className="w-6 h-6 text-emerald-500 stroke-[1.5]" />
                    تگ‌های پرطرفدار
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'AI', 'TypeScript', 'UI/UX'].map((tag, index) => (
                        <motion.span
                            key={index}
                            whileHover={{ y: -2 }}
                            className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-full cursor-pointer hover:bg-emerald-200 transition-colors"
                        >
                            #{tag}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
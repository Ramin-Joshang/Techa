"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addToCart } from "../../../features/cart/cartSlice"
import { ShoppingCart } from "lucide-react"

const VideoCourseAdEnd = ({ doc }) => {
    const cartItems = useSelector(state => state.cart.items);
    const isInCart = cartItems.some(item => item.Id === doc.Id);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const dispatch = useDispatch()

    const handleAddToCart = () => {
        if (isInCart) return;
        setIsAddingToCart(true);
        setTimeout(() => {
            // ذخیره نسخه نهایی قیمت با تخفیف
            const finalPrice = doc.DiscountAmount
                ? Math.round(doc.Price * (1 - doc.DiscountAmount / 100))
                : doc.Price;
            dispatch(addToCart({ ...doc, FinalPrice: finalPrice }));
            setIsAddingToCart(false);
        }, 500); // شبیه‌سازی لودینگ
    };
    const features = [
        { icon: '🤖', title: 'هوش مصنوعی پیشرفته', subtitle: 'ادیتور هوشمند با قابلیت تحلیل کد' },
        { icon: '🎯', title: 'تمرینات تعاملی', subtitle: 'تمرین‌های عملی با نمره‌دهی خودکار' },
        { icon: '📝', title: 'آزمون‌های دوره', subtitle: 'سنجش دانش با بازخورد دقیق' },
        { icon: '👨‍🏫', title: 'پشتیبانی شخصی استاد', subtitle: 'رفع اشکال و پاسخ به سوالات' },
        { icon: '🏆', title: 'مدرک معتبر', subtitle: 'گواهینامه پایان دوره با اعتبار بین‌المللی' },
        { icon: '🔄', title: 'آپدیت مادام‌العمر', subtitle: 'دسترسی به همه به‌روزرسانی‌ها' },
        // { icon: '📊', title: 'پنل پیشرفت شخصی', subtitle: 'ردیابی و تحلیل روند یادگیری' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-2xl mt-10 p-7 mb-8 shadow-xl shadow-green-100/30 overflow-hidden"
        >
            {/* <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-green-600 transition-colors z-10"
            >
                <motion.svg
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
            </button> */}

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Content Section */}
                <div className="flex-1 space-y-7">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-green-200 shadow-sm"
                    >
                        <span className="text-3xl bg-green-100 p-3 rounded-full">🚀</span>
                        <div>
                            <h3 className="text-xl font-black text-green-800">
                                ارتقاء به نسخه حرفه‌ای {doc?.Title}
                            </h3>
                            <p className="text-sm text-green-600 mt-1">تجربه یادگیری کاملاً جدید با قابلیت‌های پیشرفته</p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -3 }}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-all shadow-sm"
                            >
                                <span className="text-2xl p-2">{item.icon}</span>
                                <div>
                                    <h4 className="font-semibold text-green-800">{item.title}</h4>
                                    <p className="text-xs text-green-600">{item.subtitle}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>


                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="xl:w-96 shrink-0 bg-gradient-to-b from-green-900 to-green-800 text-white p-5 rounded-xl border-2 border-green-700 space-y-5 shadow-lg"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-700/50 rounded-full text-sm">
                            <span className="animate-pulse">🔥</span>
                            <span>پرفروش‌ترین پلن!</span>
                        </div>

                        <div className="space-y-2">
                            <div className="text-3xl font-black">{doc?.FinalPrice ? doc?.FinalPrice.toLocaleString() : doc?.Price.toLocaleString()} تومان</div>
                            {doc.DiscountAmount > 0 && (
                                <div className="line-through text-green-300/80 text-sm">
                                    {doc.Price.toLocaleString()} تومان
                                </div>
                            )}
                            <div className="text-xs text-green-200">پرداخت یکبار برای همیشه!</div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 246, 130, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || isInCart}
                            className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg font-bold transition-colors shadow-lg
    ${isAddingToCart || isInCart
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-white/95 text-green-800 hover:bg-white"}`}
                        >
                            {isAddingToCart ? (
                                <>
                                    <span>در حال افزودن...</span>
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                </>
                            ) : isInCart ? (
                                <>
                                    <ShoppingCart size={16} />
                                    <span>در سبد خرید</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={16} />
                                    <span>خرید دوره</span>
                                </>
                            )}
                        </motion.button>


                        <div className="text-xs text-green-200 flex justify-center items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>پرداخت امن از درگاه بانکی</span>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm text-green-200">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            <span>ضمانت بازگشت وجه ۱۴ روزه بدون قید و شرط</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🔄</span>
                            <span>آپدیت رایگان مادام‌العمر</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📞</span>
                            <span>مشاوره رایگان پیش از خرید</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Floating Elements for Design */}
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-green-200/20"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-green-300/20"></div>
        </motion.div>
    )
}

export default VideoCourseAdEnd
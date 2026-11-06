// app/cart/page.jsx
"use client";
import { useSelector, useDispatch } from 'react-redux';
import {
    RiShoppingCartLine,
    RiDeleteBinLine,
    RiCoupon3Line,
    RiWallet3Line,
    RiBankLine,
    RiCashLine,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiFileCopyLine,
    RiCheckLine,
    RiQrCodeLine,
    RiCloseLine,
    RiWhatsAppLine,
    RiTelegramLine,
    RiUploadLine
} from 'react-icons/ri';
import * as RiIcons from "react-icons/ri";
import {
    removeFromCart,
    applyDiscount,
    selectPayment,
    clearCart
} from '../../features/cart/cartSlice';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const paymentMethods = [
    { id: 'online', name: 'پرداخت آنلاین', icon: <RiWallet3Line className="w-6 h-6" /> },
    { id: 'bank', name: 'کارت به کارت', icon: <RiBankLine className="w-6 h-6" /> },
    { id: 'cash', name: 'پرداخت در محل', icon: <RiCashLine className="w-6 h-6" /> },
];

const CartPage = () => {
    const {
        items,
        totalAmount,
        discountAmount,
        discountCode,
        selectedPayment
    } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const [discountInput, setDiscountInput] = useState('');
    const [showBankModal, setShowBankModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [copiedField, setCopiedField] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    const handleApplyDiscount = () => {
        dispatch(applyDiscount(discountInput.toUpperCase()));
        setDiscountInput('');
    };

    const handleCopyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
        }
    };

    const grandTotal = totalAmount - discountAmount - 100000;

    const bankTransferInfo = {
        bankName: "بانک ملت",
        accountNumber: "6104-3378-1234-5678",
        cardNumber: "6037-9912-3456-7890",
        accountHolder: "آکادمی آموزشی",
        amount: grandTotal,
        description: "پرداخت دوره آموزشی"
    };

    const contactInfo = {
        whatsapp: "+989195993264",
        telegram: "@academy_support",
        phone: "021-12345678"
    };

    const cartItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: 50 }
    };


    const DynamicIcon = ({ iconName, className }) => {
        const IconComponent = RiIcons[iconName];
        if (!IconComponent) return null; // اگر آیکون وجود نداشت
        return <IconComponent className={className} />;
    };


    return (
        <div className="min-h-screen pt-32 bg-gray-50/50">
            <div className="container mx-auto px-4 lg:px-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
                >
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <RiShoppingCartLine className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" />
                            سبد خرید شما
                        </h1>
                        {items.length > 0 && (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                {items.length} دوره
                            </span>
                        )}
                    </div>
                    <Link
                        href="/courses"
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 md:px-5 md:py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 group"
                    >
                        <RiArrowRightLine className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                        بازگشت به فروشگاه
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Cart Items Section - Responsive Table */}
                    <div className="lg:col-span-2">
                        <AnimatePresence>
                            {items.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-200"
                                >
                                    <div className="max-w-xs mx-auto mb-6">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <RiShoppingCartLine className="w-10 h-10 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-lg mb-2">سبد خرید شما خالی است!</p>
                                    <p className="text-gray-500 text-sm mb-6">می‌توانید از بین دوره‌های آموزشی انتخاب کنید</p>
                                    <Link
                                        href="/docs"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                                    >
                                        <RiShoppingCartLine className="w-5 h-5" />
                                        مشاهده دوره‌ها
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                                >
                                    {/* Desktop Table */}
                                    <div className="hidden md:block">
                                        {/* Table Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 grid grid-cols-12 gap-4">
                                            <div className="col-span-5 text-sm font-semibold text-gray-700">دوره آموزشی</div>
                                            <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">قیمت اصلی</div>
                                            <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">تخفیف</div>
                                            <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">قیمت نهایی</div>
                                            <div className="col-span-1 text-sm font-semibold text-gray-700 text-center">حذف</div>
                                        </div>

                                        {/* Table Body */}
                                        <div className="divide-y divide-gray-200">
                                            {items.map((item, index) => (
                                                <motion.div
                                                    key={item.Id}
                                                    variants={cartItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    className="p-6 hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <div className="grid grid-cols-12 gap-4 items-center">
                                                        {/* Course Info */}
                                                        <div className="col-span-5 flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                                                <DynamicIcon iconName={item.Avatar} className="w-6 h-6 text-white" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                                                                    دوره  {item.Title}
                                                                </h3>
                                                                <p className="text-gray-500 text-xs mt-1">کد: {item.Id}</p>
                                                            </div>
                                                        </div>

                                                        {/* Original Price */}
                                                        <div className="col-span-2 text-center">
                                                            <span className="text-gray-700 font-medium">
                                                                {item.Price?.toLocaleString()} تومان
                                                            </span>
                                                        </div>

                                                        {/* Discount */}
                                                        <div className="col-span-2 text-center">
                                                            {item.DiscountAmount > 0 ? (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                        {item.DiscountAmount}%
                                                                    </span>
                                                                    <span className="text-green-600 text-xs font-medium">
                                                                        {(item.Price - item.FinalPrice).toLocaleString()} تومان
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">بدون تخفیف</span>
                                                            )}
                                                        </div>

                                                        {/* Final Price */}
                                                        <div className="col-span-2 text-center">
                                                            <span className="text-emerald-600 font-bold text-lg">
                                                                {item.FinalPrice ? item.FinalPrice.toLocaleString() : item.Price.toLocaleString()} تومان
                                                            </span>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="col-span-1 text-center">
                                                            <button
                                                                onClick={() => dispatch(removeFromCart(item.Id))}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                                title="حذف از سبد خرید"
                                                            >
                                                                <RiDeleteBinLine className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-gray-200">
                                        {items.map((item, index) => (
                                            <motion.div
                                                key={item.Id}
                                                variants={cartItemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="p-4 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <div className="space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                                                <RiShoppingCartLine className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                                                                    {item.Title}
                                                                </h3>
                                                                <p className="text-gray-500 text-xs mt-1">کد: {item.Id}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => dispatch(removeFromCart(item.Id))}
                                                            className="text-red-500 hover:text-red-600 p-1"
                                                        >
                                                            <RiDeleteBinLine className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Prices */}
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="space-y-1">
                                                            <div className="text-gray-500 text-xs">قیمت اصلی</div>
                                                            <div className="text-gray-700 font-medium">
                                                                {item.Price?.toLocaleString()} تومان
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-gray-500 text-xs">تخفیف</div>
                                                            {item.DiscountAmount > 0 ? (
                                                                <div className="space-y-1">
                                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                        {item.DiscountAmount}%
                                                                    </span>
                                                                    <div className="text-green-600 text-xs">
                                                                        {(item.Price - item.FinalPrice).toLocaleString()} تومان
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">بدون تخفیف</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Final Price */}
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 text-sm">قیمت نهایی:</span>
                                                            <span className="text-emerald-600 font-bold">
                                                                {item.FinalPrice ? item.FinalPrice.toLocaleString() : item.Price.toLocaleString()} تومان
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Payment Summary Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">خلاصه سفارش</h2>

                            <div className="space-y-4">
                                {/* Discount Section */}
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                                    <label className="block text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                                        <RiCoupon3Line className="w-4 h-4" />
                                        کد تخفیف
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="کد تخفیف را وارد کنید..."
                                            className="flex-1 border border-emerald-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                                            value={discountInput}
                                            onChange={(e) => setDiscountInput(e.target.value)}
                                        />
                                        <button
                                            onClick={handleApplyDiscount}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-lg transition-colors flex items-center gap-2 text-sm shrink-0"
                                        >
                                            <RiCoupon3Line className="w-4 h-4" />
                                            اعمال
                                        </button>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">جمع کل:</span>
                                        <span className="font-medium text-gray-900">
                                            {totalAmount?.toLocaleString()} تومان
                                        </span>
                                    </div>

                                    {discountAmount < 1 && (
                                        <>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-green-600">
                                                <span>تخفیف ({discountCode}20):</span>
                                                <span className="font-medium">-100000 تومان</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-blue-600">
                                                <span>مبلغ تخفیف:</span>
                                                <span className="font-medium">100000 تومان</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between items-center py-3 border-t border-gray-200">
                                        <span className="font-bold text-lg">مبلغ نهایی:</span>
                                        <span className="font-bold text-2xl text-emerald-600">
                                            {grandTotal.toLocaleString()} تومان
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <RiWallet3Line className="w-5 h-5 text-emerald-600" />
                                روش پرداخت
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {paymentMethods.map(method => (
                                    <motion.button
                                        key={method.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            dispatch(selectPayment(method.id));
                                            if (method.id === 'bank') {
                                                setShowBankModal(true);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedPayment === method.id
                                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`${selectedPayment === method.id ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                {method.icon}
                                            </span>
                                            <span className="font-medium text-gray-900 text-right flex-1">
                                                {method.name}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Checkout Button */}
                            {selectedPayment && selectedPayment !== 'bank' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6"
                                >
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl transition-all duration-300 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                        پرداخت ایمن
                                        <RiWallet3Line className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bank Transfer Modal */}
            <AnimatePresence>
                {showBankModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowBankModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[60vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {/* <RiBankLine className="w-6 h-6 text-blue-600" /> */}
                                    پرداخت کارت به کارت
                                </h3>
                                <button
                                    onClick={() => setShowBankModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <RiCloseLine className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Amount Section */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <div className="text-center">
                                        <div className="text-blue-700 font-medium mb-2">مبلغ قابل پرداخت</div>
                                        <div className="text-3xl font-bold text-blue-900">
                                            {grandTotal.toLocaleString()} تومان
                                        </div>
                                        <p className="text-blue-600 text-sm mt-2">
                                            لطفا دقیقا همین مبلغ را واریز کنید
                                        </p>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900">اطلاعات حساب</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="text-gray-600 text-sm mb-1">نام بانک</div>
                                            <div className="font-medium text-gray-900">{bankTransferInfo.bankName}</div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="text-gray-600 text-sm mb-1">شماره شبا</div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 font-mono text-sm">
                                                    IR12 3456 7890 1234 5678 90
                                                </span>
                                                <button
                                                    onClick={() => handleCopyToClipboard('IR12345678901234567890', 'sheba')}
                                                    className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                                >
                                                    {copiedField === 'sheba' ? (
                                                        <RiCheckLine className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <RiFileCopyLine className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <div className="text-gray-600 text-sm mb-1">شماره کارت</div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 font-mono text-lg">
                                                    {bankTransferInfo.cardNumber}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyToClipboard(bankTransferInfo.cardNumber, 'card')}
                                                    className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                                >
                                                    {copiedField === 'card' ? (
                                                        <RiCheckLine className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <RiFileCopyLine className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                                            <div className="text-gray-600 text-sm mb-1">به نام</div>
                                            <div className="font-medium text-gray-900">{bankTransferInfo.accountHolder}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Receipt */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900">آپلود فیش واریزی</h4>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="receipt-upload"
                                            accept="image/*,.pdf"
                                            onChange={handleFileUpload}
                                        />
                                        <label htmlFor="receipt-upload" className="cursor-pointer block">
                                            <RiIcons.RiUpload2Line className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <div className="text-gray-600 mb-2">
                                                {receiptFile ? 'فایل انتخاب شده:' : 'برای آپلود فیش کلیک کنید'}
                                            </div>
                                            {receiptFile ? (
                                                <div className="text-emerald-600 font-medium">
                                                    {receiptFile.name}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 text-sm">
                                                    PNG, JPG, PDF (حداکثر ۵ مگابایت)
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <h4 className="font-bold text-green-800 mb-3">ارسال فیش از طریق</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <a
                                            href={`https://wa.me/${contactInfo.whatsapp}?text=فیش واریز دوره آموزشی - مبلغ: ${grandTotal.toLocaleString()} تومان`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RiIcons.RiWhatsappLine className="w-5 h-5" />
                                            واتساپ
                                        </a>

                                        <a
                                            href={`https://t.me/${contactInfo.telegram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RiIcons.RiTelegram2Line className="w-5 h-5" />
                                            تلگرام
                                        </a>
                                    </div>

                                    <div className="mt-3 text-center">
                                        <div className="text-green-700 text-sm">شماره تماس: {contactInfo.phone}</div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                    <h4 className="font-medium text-yellow-800 mb-2">راهنمای پرداخت:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                                        <li>پس از واریز، فیش را از طریق واتساپ یا تلگرام ارسال کنید</li>
                                        <li>شماره پیگیری تراکنش را یادداشت کنید</li>
                                        <li>پس از تایید پرداخت، دوره‌ها در پنل کاربری فعال می‌شوند</li>
                                        <li>در صورت وجود مشکل با پشتیبانی تماس بگیرید</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowBankModal(false)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
                                >
                                    بستن
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle final submission
                                        setShowBankModal(false);
                                    }}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors font-medium"
                                >
                                    تایید و ارسال
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CartPage;
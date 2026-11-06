"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Smartphone, Timer, RotateCw, KeyRound, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  clearError,
  decrementTimer,
} from "../../../features/auth/authSlice";
import { requestOTP, verifyOTP } from "../../../features/auth/authActions";

// ─── Schema ───────────────────────────────────────────────
const schema = yup.object({
  phone: yup
    .string()
    .required("شماره موبایل الزامی است")
    .matches(/^09\d{9}$/, "فرمت شماره موبایل صحیح نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"),

  // اعتبارسنجی شرطی بر اساس مرحله فعلی (step)
  otp: yup.string().when("$step", {
    is: 2,
    then: (schema) =>
      schema
        .required("وارد کردن کد تایید الزامی است")
        .length(6, "کد باید دقیقاً ۶ رقم باشد"),
    otherwise: (schema) => schema.nullable(),
  }),
});

// ─── Component ────────────────────────────────────────────
const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, user, timer } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    resetField,
  } = useForm({
    resolver: yupResolver(schema),
    context: { step }, // ارسال step به yup به عنوان $step
    mode: "onChange",  // اعتبارسنجی لحظه‌ای
  });

  const watchedPhone = watch("phone");

  // تایمر countdown
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        dispatch(decrementTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer, dispatch]);

  // هدایت بعد از لاگین موفق
  useEffect(() => {
    if (user) {
      router.replace("/account");
    }
  }, [user, router]);

  // ریست فیلدهای غیرضروری هنگام تغییر step
  useEffect(() => {
    if (step === 1) resetField("otp");
  }, [step, resetField]);

  // ارسال درخواست OTP
  const handleSendCode = async (data) => {
    dispatch(clearError());
    const result = await dispatch(requestOTP(data.phone));
    // فقط در صورت موفقیت‌آمیز بودن به مرحله ۲ برود
    if (requestOTP.fulfilled.match(result)) {
      setStep(2);
    }
  };

  // تأیید کد
  const handleVerifyCode = async (data) => {
    dispatch(clearError());
    await dispatch(
      verifyOTP({
        phone: data.phone, // استفاده مستقیم از دیتا فرم
        code: data.otp,
      })
    );
  };

  // ارسال مجدد
  const handleResendCode = async () => {
    dispatch(clearError());
    const phone = getValues("phone");
    if (phone && !errors.phone) {
      await dispatch(requestOTP(phone));
    }
  };

  // بازگشت به مرحله وارد کردن شماره
  const handleChangePhone = () => {
    setStep(1);
    dispatch(clearError());
  };

  return (
    <div
      dir="rtl" // راست‌چین کردن کل صفحه
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white font-sans"
    >
      {/* پس‌زمینه انیمیشن (حذف Math.random برای جلوگیری از Hydration Error) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-[#6ACF5A]/60 rounded-full z-0"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.4, 0],
            y: "120vh",
          }}
          transition={{
            duration: 8 + (i % 5),
            repeat: Infinity,
            delay: (i % 6) * 1.5,
          }}
        />
      ))}

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(step === 1 ? handleSendCode : handleVerifyCode)}
        className="bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl border border-[#7AE36A]/30 w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-[#7AE36A] to-[#4CAF50] p-5 rounded-full shadow-lg">
            <Lock className="text-white h-9 w-9" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#7AE36A] to-[#4CAF50] bg-clip-text text-transparent">
          {step === 1 ? "ورود / ثبت‌نام" : "تأیید کد"}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <label htmlFor="phone" className="block text-gray-700 text-center font-medium">
                شماره موبایل خود را وارد کنید
              </label>
              <div className="relative">
                {/* تغییر left-4 به right-4 برای راست‌چین */}
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7AE36A] h-5 w-5" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr" // شماره موبایل معمولا چپ‌چین تایپ می‌شود
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7AE36A]/60 transition text-left"
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm text-center">{errors.phone.message}</p>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                کد ۶ رقمی برای شماره <strong className="font-mono text-base">{watchedPhone}</strong> ارسال شد.
              </p>

              <label htmlFor="otp" className="block text-gray-700 text-center font-medium">
                کد تأیید
              </label>
              <div className="relative">
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7AE36A] h-5 w-5" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="──────"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7AE36A]/60 text-center tracking-[0.5em] font-mono text-xl transition"
                  {...register("otp")}
                />
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm text-center">{errors.otp.message}</p>
              )}

              {/* تایمر بهینه و یکپارچه شده */}
              <div className="min-h-[2rem]">
                {timer > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-[#4CAF50] font-medium">
                    <Timer className="h-5 w-5" />
                    <span className="font-mono">
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                    </span>
                    <span className="text-gray-500 text-sm">تا ارسال مجدد</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="flex items-center justify-center mx-auto gap-2 text-sm font-medium text-[#7AE36A] hover:text-[#5bbd4e] transition"
                  >
                    <RotateCw className="h-4 w-4" />
                    ارسال مجدد کد تأیید
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full mt-8 py-3.5 bg-gradient-to-r from-[#7AE36A] to-[#4CAF50] text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <RotateCw className="h-5 w-5 animate-spin" />
          ) : step === 1 ? (
            "دریافت کد تأیید"
          ) : (
            "تأیید و ورود"
          )}
        </motion.button>

        {step === 2 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleChangePhone}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 text-sm transition flex items-center justify-center gap-1 mx-auto"
            >
              تغییر شماره موبایل
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            ورود شما به معنای پذیرش{" "}
            <a href="/terms" className="text-[#7AE36A] hover:underline">
              شرایط و قوانین
            </a>{" "}
            است
          </p>
        </div>
      </motion.form>
    </div>
  );
};

export default Login;
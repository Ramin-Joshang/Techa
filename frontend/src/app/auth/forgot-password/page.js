"use client";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
    email: yup
        .string()
        .required("ایمیل الزامی است")
        .email("ایمیل معتبر نیست"),
});

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data) => {
        setTimeout(() => {
            alert("درخواست بازیابی رمز عبور ارسال شد!");
        }, 2000);
    };

    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.form
                initial="hidden"
                animate="visible"
                variants={formVariants}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-[#7AE36A]/30 w-full max-w-md"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center mb-8"
                >
                    <div className="bg-[#7AE36A] p-4 rounded-full">
                        <Mail className="text-white h-8 w-8" />
                    </div>
                </motion.div>

                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#7AE36A] to-[#4CAF50] bg-clip-text text-transparent">
                    فراموشی رمز عبور
                </h2>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div >
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7AE36A]" />
                                <input
                                    type="email"
                                    placeholder="ایمیل"
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 rounded-xl border border-[#7AE36A]/30 focus:outline-none text-gray-700 placeholder-gray-300"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && (
                                <span className="text-red-400 text-sm mt-1 block">{errors.email.message}</span>
                            )}
                        </div>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-[#7AE36A] to-[#4CAF50] rounded-xl text-white font-semibold hover:shadow-lg transition-all relative overflow-hidden"
                    >
                        {isSubmitting && (
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            />
                        )}
                        {isSubmitting ? "در حال پردازش..." : "ارسال"}
                    </motion.button>

                    <motion.div
                        className="text-center mt-4 text-[#7AE36A]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        به خاطر آوردید؟{" "}
                        <a href="/auth/login" className="font-bold hover:text-[#66d15e]">
                            ورود
                        </a>
                    </motion.div>
                </div>
            </motion.form>
        </div>
    );
};

export default ForgotPassword;

import React from 'react';
import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'بازیابی رمز عبور | تکا ۲.۰',
  description: 'بازیابی امن رمز عبور حساب کاربری با پیامک اعتبارسنجی',
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#02180F] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7AE36A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}

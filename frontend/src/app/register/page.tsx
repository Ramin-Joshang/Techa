import React from 'react';
import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'ثبت‌نام در پلتفرم | تکا (TECHA)',
  description: 'عضویت در پلتفرم آموزش و مستندات مهندسی تکا',
};

export default async function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#02180F] text-slate-100 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#7AE36A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#042A1B] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <RegisterForm />
      </div>
    </main>
  );
}

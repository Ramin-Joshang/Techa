import React from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'ورود به حساب کاربری | تکا (TECHA)',
  description: 'ورود به حساب کاربری در پلتفرم آموزش و مستندات مهندسی تکا',
};

export default async function LoginPage() {
  return (
    <main className="min-h-screen bg-[#02180F] text-slate-100 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#7AE36A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#042A1B] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <LoginForm />
      </div>
    </main>
  );
}

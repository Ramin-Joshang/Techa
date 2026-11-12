import type { Metadata } from 'next';
import React from 'react';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
import { AdminToastProvider } from '../../components/admin/ui/ToastProvider';
import AdminShell from '../../components/admin/layout/AdminShell';

export const metadata: Metadata = {
  title: {
    default: 'پنل مدیریت تکا',
    template: '%s | پنل مدیریت تکا',
  },
  description: 'پنل مدیریت محتوا و حاکمیت پلتفرم آموزشی تکا',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <AdminShell>{children}</AdminShell>
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}

import React from 'react';

interface CourseLayoutProps {
  children: React.ReactNode;
}

export default function CourseLayout({ children }: CourseLayoutProps) {
  return (
    <div className="w-full bg-slate-50/70 min-h-screen py-6 sm:py-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

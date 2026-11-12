'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Home,
  Menu,
  Search,
  X,
  PhoneCall,
  Terminal,
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/docs?q=${encodeURIComponent(query)}`);
      setMobileMenuOpen(false);
    } else {
      router.push('/docs');
    }
  };

  const navLinks = [
    { href: '/', label: 'صفحه اصلی', icon: Home },
    { href: '/docs', label: 'کاتالوگ دوره‌ها', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#042A1B] border-b border-[#7AE36A]/20 shadow-lg shadow-black/20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Right Section: Logo & Primary Nav */}
        <div className="flex items-center gap-6 xl:gap-8">
          {/* Authentic TECHA Logo */}
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative w-36 h-10 sm:w-44 sm:h-12">
              <Image
                src="/images/logo-light.svg"
                alt="تکا - پلتفرم آموزش و کارآموزی برنامه‌نویسی وب"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 mr-2">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#7AE36A]/15 text-[#7AE36A] font-bold border border-[#7AE36A]/30'
                      : 'text-white/80 hover:text-[#7AE36A] hover:bg-white/5'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${active ? 'text-[#7AE36A]' : 'text-white/60'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center / Left Section: Search Bar & Contact & CTA */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Header Search Bar (Added as requested) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-56 xl:w-72"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در دوره‌ها و مستندات..."
              className="w-full bg-[#053723] text-white text-xs placeholder-white/50 pl-9 pr-3.5 py-2.5 rounded-full border border-[#7AE36A]/30 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all"
            />
            <button
              type="submit"
              className="absolute left-2.5 p-1 text-white/60 hover:text-[#7AE36A] transition-colors"
              aria-label="جستجو"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Authentic Phone Contact Section */}
          <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-[#7AE36A]/20">
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-white/60 font-medium">با ما در تماس باشید</span>
              <a
                href="tel:02182800003"
                className="text-sm font-bold text-white hover:text-[#7AE36A] transition-colors tracking-wider"
                style={{ direction: 'ltr' }}
              >
                021-82800003
              </a>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7AE36A]/10 text-[#7AE36A] border border-[#7AE36A]/30">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>

          {/* Action CTA Button */}
          <Link
            href="/docs"
            className="hidden sm:inline-flex items-center gap-2 bg-[#7AE36A] text-[#042A1B] px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-[#6acf5a] transition-all shadow-lg shadow-[#7AE36A]/20 hover:scale-102 active:scale-98"
          >
            <Terminal className="h-4 w-4" />
            <span>مشاهده دوره‌ها</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl p-2.5 text-white hover:bg-white/10 hover:text-[#7AE36A] transition-colors"
            aria-label="منوی موبایل"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#042A1B] border-t border-[#7AE36A]/20 px-5 pt-4 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در تمام دوره‌ها و مستندات..."
              className="w-full bg-[#053723] text-white text-sm placeholder-white/50 pl-10 pr-4 py-3 rounded-xl border border-[#7AE36A]/30 focus:outline-none focus:border-[#7AE36A]"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#7AE36A]"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Nav Items */}
          <div className="space-y-1.5 pt-2">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#7AE36A]/15 text-[#7AE36A] font-bold border border-[#7AE36A]/30'
                      : 'text-white/80 hover:bg-white/5 hover:text-[#7AE36A]'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${active ? 'text-[#7AE36A]' : 'text-white/60'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Contact in Mobile */}
          <div className="pt-3 border-t border-[#7AE36A]/20 flex items-center justify-between text-white/80 text-xs">
            <span>شماره تماس پشتیبانی:</span>
            <a
              href="tel:02182800003"
              className="text-sm font-bold text-[#7AE36A]"
              style={{ direction: 'ltr' }}
            >
              021-82800003
            </a>
          </div>

          {/* Mobile CTA */}
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-[#7AE36A] text-[#042A1B] py-3 rounded-xl font-bold text-sm shadow-md"
          >
            <Terminal className="h-4 w-4" />
            <span>مشاهده تمام دوره‌ها</span>
          </Link>
        </div>
      )}
    </header>
  );
}

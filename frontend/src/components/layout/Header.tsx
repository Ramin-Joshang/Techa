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
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';
import { hasAnyAdminAccess } from '@techa/shared';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const hasAdmin = Boolean(user && user.status === 'active' && hasAnyAdminAccess(user.roles));
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.phoneMasked
    : '';

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

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
      router.refresh();
    } finally {
      setLoggingOut(false);
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
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Right Section: Logo & Primary Nav */}
        <div className="flex items-center gap-5 xl:gap-7 min-w-0">
          {/* Authentic TECHA Logo */}
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90 shrink-0">
            <div className="relative w-32 h-10 sm:w-40 sm:h-11">
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
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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

        {/* Left Section: Search Bar, Contact & Auth Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Header Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-48 lg:w-56 xl:w-64"
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
          <div className="hidden xl:flex items-center gap-2.5 pr-3 border-r border-[#7AE36A]/20">
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-white/60 font-medium">پشتیبانی</span>
              <a
                href="tel:02182800003"
                className="text-xs font-bold text-white hover:text-[#7AE36A] transition-colors tracking-wider"
                style={{ direction: 'ltr' }}
              >
                021-82800003
              </a>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7AE36A]/10 text-[#7AE36A] border border-[#7AE36A]/30">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>

          {/* Auth Controls (Desktop / Tablet) */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2">
              {hasAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 bg-[#7AE36A] text-[#042A1B] px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-[#6acf5a] transition-all shadow-md shadow-[#7AE36A]/20 whitespace-nowrap"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>پنل مدیریت</span>
                </Link>
              )}

              <div
                className="inline-flex items-center gap-1.5 bg-[#053723] text-white px-3 py-2 rounded-xl border border-[#7AE36A]/30 text-xs font-medium max-w-[150px]"
                title={user.phoneMasked}
              >
                <User className="h-3.5 w-3.5 text-[#7AE36A] shrink-0" />
                <span className="truncate">{displayName}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-red-300 hover:bg-red-500/10 border border-white/15 transition-colors whitespace-nowrap disabled:opacity-50"
                title="خروج از حساب کاربری"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white border border-[#7AE36A]/40 hover:bg-[#7AE36A]/15 hover:text-[#7AE36A] transition-all whitespace-nowrap"
              >
                <LogIn className="h-4 w-4 text-[#7AE36A]" />
                <span>ورود</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 bg-[#7AE36A] text-[#042A1B] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#6acf5a] transition-all shadow-lg shadow-[#7AE36A]/20 whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4" />
                <span>ثبت‌نام</span>
              </Link>
            </div>
          )}

          {/* Mobile Quick Login Link (visible on xs screens before opening drawer) */}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="sm:hidden inline-flex items-center gap-1 bg-[#7AE36A] text-[#042A1B] px-3 py-2 rounded-xl font-bold text-xs"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>ورود</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 text-white hover:bg-white/10 hover:text-[#7AE36A] transition-colors"
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

          {/* Auth Actions in Mobile Drawer */}
          <div className="pt-3 border-t border-[#7AE36A]/20 space-y-2.5">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#053723] border border-[#7AE36A]/25 text-xs text-white">
                  <span className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4 text-[#7AE36A]" />
                    <span>{displayName}</span>
                  </span>
                  <span className="font-mono text-white/60" dir="ltr">
                    {user.phoneMasked}
                  </span>
                </div>

                {hasAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-[#7AE36A] text-[#042A1B] py-3 rounded-xl font-bold text-sm shadow-md"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>ورود به پنل مدیریت</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center justify-center gap-2 w-full bg-red-500/15 text-red-200 border border-red-400/30 py-3 rounded-xl font-bold text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>خروج از حساب</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-[#7AE36A]/40 text-white py-3 rounded-xl font-bold text-sm hover:bg-[#7AE36A]/10"
                >
                  <LogIn className="h-4 w-4 text-[#7AE36A]" />
                  <span>ورود</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[#7AE36A] text-[#042A1B] py-3 rounded-xl font-bold text-sm shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>ثبت‌نام</span>
                </Link>
              </div>
            )}
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
        </div>
      )}
    </header>
  );
}


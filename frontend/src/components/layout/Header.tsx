'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Compass,
  HelpCircle,
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  User,
  ChevronDown,
  X,
} from 'lucide-react';
import { hasAnyAdminAccess } from '@techa/shared';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'مدیر ارشد سیستم',
  admin: 'مدیر پلتفرم',
  content_manager: 'مدیر محتوا',
  content_editor: 'ویراستار محتوا',
  reviewer: 'بازبین محتوا',
  student: 'دانشجو',
  user: 'کاربر',
};

const NAV_LINKS = [
  { href: '/', label: 'صفحه اصلی', icon: Home },
  { href: '/docs', label: 'دوره‌ها', icon: BookOpen },
  { href: '/roadmap', label: 'نقشه راه', icon: Compass },
  { href: '/about', label: 'درباره ما', icon: Info },
  { href: '/faq', label: 'سوالات متداول', icon: HelpCircle },
  { href: '/contact', label: 'تماس با ما', icon: PhoneCall },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Close menus cleanly on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const hasAdmin = Boolean(user && user.status === 'active' && hasAnyAdminAccess(user.roles));
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.phoneMasked
    : '';
  const primaryRole = user?.roles?.[0] ? ROLE_LABELS[user.roles[0]] || user.roles[0] : 'کاربر';
  const avatarInitial = displayName ? displayName.trim().charAt(0) : 'ت';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setMobileMenuOpen(false);
    setSearchOpen(false);
    if (query) {
      router.push(`/docs?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/docs');
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setProfileOpen(false);
      setMobileMenuOpen(false);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path) ?? false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#042A1B]/95 backdrop-blur-md border-b border-[#7AE36A]/20 shadow-md shadow-black/15">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1 (Start/Right): Brand Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 transition-opacity hover:opacity-90"
          aria-label="صفحه اصلی تکا"
        >
          <div className="relative w-28 h-8 sm:w-32 sm:h-9">
            <Image
              src="/images/logo-light.svg"
              alt="تکا - پلتفرم آموزش و کارآموزی برنامه‌نویسی وب"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Zone 2 (Center): Single-Line Navigation */}
        <nav aria-label="ناوبری اصلی" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#7AE36A]/15 text-[#7AE36A] font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3 (End/Left): Compact Search Trigger + Unified Auth / Profile Dropdown + Mobile Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className={`hidden md:inline-flex items-center justify-center h-9 w-9 rounded-lg border transition-colors ${
              searchOpen
                ? 'bg-[#7AE36A]/15 border-[#7AE36A]/50 text-[#7AE36A]'
                : 'bg-white/5 border-white/10 text-white/80 hover:text-[#7AE36A] hover:border-[#7AE36A]/35'
            }`}
            aria-label="جستجو در دوره‌ها"
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          {/* Auth Zone */}
          {isAuthenticated && user ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="منوی حساب کاربری"
                className="inline-flex items-center gap-2 h-9 pl-2.5 pr-1.5 rounded-xl bg-[#053723] hover:bg-[#07442c] border border-[#7AE36A]/35 text-white text-xs font-semibold transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7AE36A] text-[#042A1B] font-black text-xs shrink-0">
                  {avatarInitial}
                </span>
                <span className="hidden sm:inline max-w-[115px] truncate">{displayName}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#7AE36A] transition-transform duration-200 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-label="گزینه‌های حساب کاربری"
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-white text-gray-900 shadow-2xl border border-gray-200 overflow-hidden z-50"
                >
                  {/* User Identity Header */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900 truncate">{displayName}</span>
                      <span className="text-[11px] font-semibold text-emerald-700 shrink-0">
                        {primaryRole}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-500 text-right" dir="ltr">
                      {user.phoneMasked}
                    </p>
                  </div>

                  {/* Dropdown Links */}
                  <div className="p-1.5 space-y-0.5">
                    {hasAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span>پنل مدیریت</span>
                      </Link>
                    )}

                    <Link
                      href="/docs"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>کاتالوگ دوره‌ها</span>
                    </Link>

                    <Link
                      href="/roadmap"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors"
                    >
                      <Compass className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>مسیر یادگیری</span>
                    </Link>
                  </div>

                  {/* Logout Action */}
                  <div className="p-1.5 border-t border-gray-100">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>{loggingOut ? 'در حال خروج...' : 'خروج از حساب کاربری'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#7AE36A] text-[#042A1B] hover:bg-[#6acf5a] font-bold text-xs transition-all shadow-sm shadow-[#7AE36A]/20 whitespace-nowrap"
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" />
              <span>ورود / ثبت‌نام</span>
            </Link>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/15 text-white hover:bg-white/10 hover:text-[#7AE36A] transition-colors"
            aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Desktop Search Bar */}
      {searchOpen && (
        <div className="hidden md:block bg-[#053723] border-t border-[#7AE36A]/20">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-[#7AE36A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در دوره‌ها، فصول و مباحث فنی (مثال: React، TypeScript)..."
                  className="w-full bg-[#042A1B] text-white text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#7AE36A]/30 focus:outline-none focus:border-[#7AE36A] placeholder-white/50"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#7AE36A] text-[#042A1B] font-bold text-xs hover:bg-[#6acf5a] transition-colors shrink-0"
              >
                جستجو
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#042A1B] border-t border-[#7AE36A]/20 max-h-[calc(100dvh-4rem)] overflow-y-auto shadow-2xl">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="h-4 w-4 text-[#7AE36A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در دوره‌ها و مستندات..."
                className="w-full bg-[#053723] text-white text-sm placeholder-white/50 pr-10 pl-16 py-2.5 rounded-xl border border-[#7AE36A]/30 focus:outline-none focus:border-[#7AE36A]"
              />
              <button
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#7AE36A]/15 text-[#7AE36A] text-xs font-bold"
              >
                بگرد
              </button>
            </form>

            {/* Mobile Nav Grid */}
            <nav aria-label="منوی موبایل" className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#7AE36A]/15 text-[#7AE36A] border border-[#7AE36A]/30 font-bold'
                        : 'bg-white/5 text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#7AE36A]' : 'text-white/60'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth Section */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#053723] border border-[#7AE36A]/25 text-xs text-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="h-4 w-4 text-[#7AE36A] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{displayName}</p>
                        <p className="text-[11px] text-white/60">{primaryRole}</p>
                      </div>
                    </div>
                    <span className="font-mono text-white/70 shrink-0" dir="ltr">
                      {user.phoneMasked}
                    </span>
                  </div>

                  <div className={`grid ${hasAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                    {hasAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 bg-[#7AE36A] text-[#042A1B] py-2.5 rounded-xl font-bold text-xs"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>پنل مدیریت</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center justify-center gap-1.5 bg-red-500/15 text-red-200 border border-red-400/30 py-2.5 rounded-xl font-bold text-xs"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#7AE36A] text-[#042A1B] py-2.5 rounded-xl font-bold text-xs shadow-md"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>ورود / ثبت‌نام</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Support Footer */}
            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-white/70 text-xs">
              <span>پشتیبانی آموزشی تکا:</span>
              <a
                href="tel:02182800003"
                className="font-bold text-[#7AE36A] font-mono"
                dir="ltr"
              >
                021-82800003
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Settings,
  Users,
  History,
  ShieldCheck,
  Menu,
  X,
  PanelRightClose,
  PanelRightOpen,
  LogOut,
  ExternalLink,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminClient } from '../../../lib/admin/admin-client';
import { USER_ROLE_LABELS } from '../../../lib/admin/admin-formatters';
import { ReadinessResponse } from '../../../lib/admin/admin-types';
import { ADMIN_NAV_SECTIONS, AdminNavItem, isAdminNavItemActive } from './admin-nav';

function NavIcon({ name, className }: { name: AdminNavItem['iconName']; className?: string }) {
  switch (name) {
    case 'dashboard':
      return <LayoutDashboard className={className} />;
    case 'courses':
      return <BookOpen className={className} />;
    case 'media':
      return <ImageIcon className={className} />;
    case 'pages':
      return <FileText className={className} />;
    case 'settings':
      return <Settings className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'revisions':
      return <History className={className} />;
    case 'audit':
      return <ShieldCheck className={className} />;
  }
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasPermission, logout } = useAdminAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);

  const isLoginRoute = pathname === '/admin/login';

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoginRoute) return;
    let active = true;
    adminClient.getReadiness().then((res) => {
      if (active) setReadiness(res);
    });
    return () => {
      active = false;
    };
  }, [isLoginRoute, pathname]);

  if (isLoginRoute) {
    return <div className="min-h-screen bg-[#F8FAFC] text-slate-900">{children}</div>;
  }

  const visibleSections = ADMIN_NAV_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.filter((item) => hasPermission(item.permission)),
  })).filter((sec) => sec.items.length > 0);

  const fullName =
    user && (user.firstName || user.lastName)
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : user?.phoneMasked || 'مدیر تکا';

  const primaryRoleLabel = user?.roles?.[0]
    ? USER_ROLE_LABELS[user.roles[0]] || user.roles[0]
    : '';

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  const renderSidebarLinks = (isMobile = false) => (
    <nav aria-label="منوی اصلی مدیریت" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {visibleSections.map((section) => (
        <div key={section.title} className="space-y-1">
          {(!sidebarCollapsed || isMobile) && (
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 tracking-wide">
              {section.title}
            </div>
          )}
          {section.items.map((item) => {
            const active = isAdminNavItemActive(item, pathname);
            return (
              <Link
                key={item.key}
                href={item.href}
                title={sidebarCollapsed && !isMobile ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                  active
                    ? 'bg-[#042A1B] text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <NavIcon
                  name={item.iconName}
                  className={`w-4 h-4 shrink-0 ${active ? 'text-[#7AE36A]' : 'text-slate-500'}`}
                />
                {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex" dir="rtl">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white border-l border-slate-200 transition-all duration-200 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#042A1B] text-[#7AE36A] flex items-center justify-center font-bold text-sm shrink-0">
                ت
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">پنل مدیریت تکا</div>
                <div className="text-[11px] text-slate-500 truncate">CMS & Governance</div>
              </div>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mx-auto"
            aria-label={sidebarCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
          >
            {sidebarCollapsed ? (
              <PanelRightOpen className="w-4 h-4" />
            ) : (
              <PanelRightClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {renderSidebarLinks(false)}

        <div className="p-3 border-t border-slate-200">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="مشاهده وب‌سایت عمومی"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>مشاهده سایت عمومی</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/40">
          <aside className="w-72 max-w-[85vw] bg-white h-full border-l border-slate-200 flex flex-col shadow-2xl">
            <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#042A1B] text-[#7AE36A] flex items-center justify-center font-bold text-sm">
                  ت
                </span>
                <span className="text-sm font-bold text-slate-900">پنل مدیریت تکا</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="بستن منو"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarLinks(true)}
            <div className="p-3 border-t border-slate-200">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                <ExternalLink className="w-4 h-4" />
                <span>مشاهده سایت عمومی</span>
              </Link>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="باز کردن منوی مدیریت"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-medium text-slate-700 hidden sm:inline">سامانه مدیریت محتوا</span>
              {readiness && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${
                    readiness.database === 'connected'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                      : 'bg-red-50/70 border-red-200 text-red-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      readiness.database === 'connected' ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  />
                  <span>
                    {readiness.database === 'connected' ? 'دیتابیس متصل' : 'دیتابیس قطع'}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Current Admin Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[40px]"
            >
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{fullName}</div>
                {primaryRoleLabel && (
                  <div className="text-[11px] text-slate-500 leading-tight">{primaryRoleLabel}</div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">{fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5" dir="ltr">
                    {user?.phoneMasked || '—'}
                  </div>
                  {user?.roles && (
                    <div className="text-[11px] text-emerald-700 mt-1">
                      {user.roles.map((r) => USER_ROLE_LABELS[r] || r).join('، ')}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-right text-xs font-medium text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب کاربری</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

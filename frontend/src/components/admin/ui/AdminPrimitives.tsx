'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  ACCOUNT_STATUS_LABELS,
  AUDIT_RESULT_LABELS,
  MEDIA_STATUS_LABELS,
  PUBLICATION_STATUS_LABELS,
  formatPersianNumber,
} from '../../../lib/admin/admin-formatters';
import {
  AccountStatus,
  AuditResult,
  MediaStatus,
  PaginationMeta,
  PublicationStatus,
} from '../../../lib/admin/admin-types';

// -----------------------------------------------------------------------------
// 1. AdminButton
// -----------------------------------------------------------------------------
export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const BUTTON_VARIANTS: Record<NonNullable<AdminButtonProps['variant']>, string> = {
  primary:
    'bg-[#042A1B] hover:bg-[#063b26] text-white border border-transparent shadow-xs disabled:bg-slate-300',
  secondary:
    'bg-emerald-700 hover:bg-emerald-800 text-white border border-transparent shadow-xs disabled:bg-slate-300',
  outline:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 disabled:text-slate-400',
  danger:
    'bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-xs disabled:bg-red-300',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent disabled:text-slate-400',
};

const BUTTON_SIZES: Record<NonNullable<AdminButtonProps['size']>, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs',
  md: 'min-h-[40px] px-4 py-2 text-sm',
};

export function AdminButton({
  variant = 'outline',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
      {children}
    </button>
  );
}

// -----------------------------------------------------------------------------
// 2. AdminStatusLabel (Clean inline semantic dot + label, zero pill-sandwich)
// -----------------------------------------------------------------------------
export function PublicationStatusLabel({ status }: { status: PublicationStatus }) {
  const styles: Record<PublicationStatus, { dot: string; text: string }> = {
    published: { dot: 'bg-emerald-600', text: 'text-emerald-800' },
    draft: { dot: 'bg-amber-500', text: 'text-amber-800' },
    archived: { dot: 'bg-slate-400', text: 'text-slate-600' },
  };
  const cfg = styles[status] || styles.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span>{PUBLICATION_STATUS_LABELS[status] || status}</span>
    </span>
  );
}

export function AccountStatusLabel({ status }: { status: AccountStatus }) {
  const styles: Record<AccountStatus, { dot: string; text: string }> = {
    active: { dot: 'bg-emerald-600', text: 'text-emerald-800' },
    pending_verification: { dot: 'bg-amber-500', text: 'text-amber-800' },
    suspended: { dot: 'bg-orange-500', text: 'text-orange-800' },
    disabled: { dot: 'bg-red-600', text: 'text-red-800' },
  };
  const cfg = styles[status] || styles.disabled;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span>{ACCOUNT_STATUS_LABELS[status] || status}</span>
    </span>
  );
}

export function MediaStatusLabel({ status }: { status: MediaStatus }) {
  const styles: Record<MediaStatus, { dot: string; text: string }> = {
    ready: { dot: 'bg-emerald-600', text: 'text-emerald-800' },
    uploading: { dot: 'bg-sky-500', text: 'text-sky-800' },
    failed: { dot: 'bg-red-600', text: 'text-red-800' },
    archived: { dot: 'bg-slate-400', text: 'text-slate-600' },
  };
  const cfg = styles[status] || styles.ready;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span>{MEDIA_STATUS_LABELS[status] || status}</span>
    </span>
  );
}

export function AuditResultLabel({ result }: { result: AuditResult }) {
  const styles: Record<AuditResult, { dot: string; text: string }> = {
    success: { dot: 'bg-emerald-600', text: 'text-emerald-800' },
    failure: { dot: 'bg-red-600', text: 'text-red-800' },
    denied: { dot: 'bg-amber-600', text: 'text-amber-800' },
  };
  const cfg = styles[result] || styles.success;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span>{AUDIT_RESULT_LABELS[result] || result}</span>
    </span>
  );
}

// -----------------------------------------------------------------------------
// 3. Breadcrumb & PageHeader
// -----------------------------------------------------------------------------
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={`${item.label}_${idx}`}>
            {idx > 0 && <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-emerald-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-slate-800 font-medium' : ''}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-5 mb-6">
      <div className="space-y-1.5 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && <AdminBreadcrumb items={breadcrumbs} />}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-600 max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 4. Empty & Error States
// -----------------------------------------------------------------------------
export function AdminEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-10 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function AdminErrorState({
  title = 'خطا در دریافت اطلاعات',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-white border border-red-200 rounded-lg p-8 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3 border border-red-100">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <AdminButton variant="outline" onClick={onRetry} icon={<RefreshCw className="w-4 h-4" />}>
            تلاش مجدد
          </AdminButton>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 5. AdminPagination
// -----------------------------------------------------------------------------
export function AdminPagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return (
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
        <span className="tabular-nums">
          مجموع: {formatPersianNumber(pagination?.totalItems || 0)} مورد
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
      <div className="tabular-nums">
        صفحه <strong className="text-slate-900">{formatPersianNumber(pagination.page)}</strong> از{' '}
        <strong className="text-slate-900">{formatPersianNumber(pagination.totalPages)}</strong>{' '}
        <span className="text-slate-400 mx-1">·</span>
        مجموع {formatPersianNumber(pagination.totalItems)} مورد
      </div>
      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          icon={<ChevronRight className="w-4 h-4" />}
        >
          قبلی
        </AdminButton>
        <AdminButton
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <span>بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </AdminButton>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 6. AdminModal & AdminConfirmModal & AdminDrawer
// -----------------------------------------------------------------------------
export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClass = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white border border-slate-200 rounded-xl shadow-xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  variant = 'primary',
  isLoading = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'secondary';
  isLoading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-md"
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={variant === 'danger' ? 'danger' : variant === 'secondary' ? 'secondary' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </AdminModal>
  );
}

export function AdminDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" role="dialog" aria-modal="true">
      <div className="flex-1" onClick={onClose} />
      <div
        className={`bg-white border-r border-slate-200 shadow-2xl w-full ${widthClass} h-full flex flex-col`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="بستن پنل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 7. ConflictResolutionModal (409 Optimistic Concurrency Guard)
// -----------------------------------------------------------------------------
export function ConflictResolutionModal({
  open,
  onClose,
  onReloadServer,
  localVersion,
  serverVersion,
  message,
  isReloading = false,
}: {
  open: boolean;
  onClose: () => void;
  onReloadServer: () => void;
  localVersion?: number;
  serverVersion?: number;
  message?: string;
  isReloading?: boolean;
}) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="تضاد نسخه ویرایش (۴۰۹)"
      maxWidthClass="max-w-md"
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            ادامه بررسی پیش‌نویس محلی
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={onReloadServer}
            isLoading={isReloading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            بارگذاری آخرین نسخه سرور
          </AdminButton>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <p>
            {message ||
              'این مورد پس از آخرین بارگذاری توسط کاربر یا تب دیگری تغییر کرده است. برای جلوگیری از بازنویسی کورکورانه، ذخیره متوقف شد.'}
          </p>
          {(localVersion !== undefined || serverVersion !== undefined) && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1 tabular-nums">
              {localVersion !== undefined && (
                <div>
                  نسخه پیش‌نویس شما: <strong>{formatPersianNumber(localVersion)}</strong>
                </div>
              )}
              {serverVersion !== undefined && (
                <div>
                  نسخه فعلی در سرور: <strong>{formatPersianNumber(serverVersion)}</strong>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-slate-500">
            پیش‌نویس محلی شما حفظ شده است. می‌توانید تغییرات خود را یادداشت یا کپی کرده و سپس آخرین نسخه سرور را بارگذاری کنید.
          </p>
        </div>
      </div>
    </AdminModal>
  );
}

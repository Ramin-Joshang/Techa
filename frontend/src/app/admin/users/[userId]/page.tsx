'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  KeyRound,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { ACCOUNT_STATUSES, AccountStatus, USER_ROLES, UserRole } from '@techa/shared';
import AdminGuard from '../../../../components/admin/auth/AdminGuard';
import { AdminField, AdminSelect, AdminTextarea } from '../../../../components/admin/ui/AdminFormFields';
import {
  AccountStatusLabel,
  AdminButton,
  AdminConfirmModal,
  AdminErrorState,
  AdminPageHeader,
} from '../../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { adminClient } from '../../../../lib/admin/admin-client';
import {
  ACCOUNT_STATUS_LABELS,
  USER_ROLE_LABELS,
  formatPersianDateTime,
  formatPersianNumber,
} from '../../../../lib/admin/admin-formatters';
import { AdminUserDetailDto, AdminUserSessionDto } from '../../../../lib/admin/admin-types';

function UserDetailContent() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { user: currentAdmin, hasPermission, hasRole } = useAdminAuth();
  const toast = useAdminToast();

  const isSuperAdmin = hasRole('super_admin');
  const canManageStatus = hasPermission('users:manage_status');
  const canManageRoles = hasPermission('users:manage_roles');
  const canRevokeSessions = hasPermission('users:revoke_sessions');

  const [detail, setDetail] = useState<AdminUserDetailDto | null>(null);
  const [sessions, setSessions] = useState<AdminUserSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update form
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus>('active');
  const [statusReason, setStatusReason] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  // Role update form
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [roleReason, setRoleReason] = useState('');
  const [rolesSaving, setRolesSaving] = useState(false);

  // Bulk session revoke modal
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('admin_session_revocation');
  const [revoking, setRevoking] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [userRes, sessionsRes] = await Promise.all([
        adminClient.getUserDetail(userId),
        adminClient.getUserSessions(userId),
      ]);
      setDetail(userRes);
      setSessions(sessionsRes);
      setSelectedStatus(userRes.user.status);
      setSelectedRoles(userRes.user.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات کاربر');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    if (statusReason.trim().length < 3) {
      toast.error('دلیل تغییر وضعیت الزامی است', 'لطفاً حداقل ۳ کاراکتر توضیح وارد کنید.');
      return;
    }

    setStatusSaving(true);
    try {
      const updated = await adminClient.updateUserStatus(detail.user.id, {
        status: selectedStatus,
        reason: statusReason.trim(),
      });
      setDetail((prev) => (prev ? { ...prev, user: updated } : prev));
      setStatusReason('');
      toast.success('وضعیت حساب کاربری بروزرسانی شد');
    } catch (err) {
      toast.error('بروزرسانی وضعیت ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleToggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev; // Minimum 1 role required
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  };

  const handleRolesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    if (selectedRoles.length === 0) {
      toast.error('حداقل یک نقش باید انتخاب شود');
      return;
    }
    if (roleReason.trim().length < 3) {
      toast.error('دلیل تغییر نقش الزامی است', 'لطفاً حداقل ۳ کاراکتر توضیح وارد کنید.');
      return;
    }

    setRolesSaving(true);
    try {
      const updated = await adminClient.updateUserRoles(detail.user.id, {
        roles: selectedRoles,
        reason: roleReason.trim(),
      });
      setDetail((prev) => (prev ? { ...prev, user: updated } : prev));
      setSelectedRoles(updated.roles);
      setRoleReason('');
      toast.success('نقش‌های کاربری با موفقیت بروزرسانی شد');
    } catch (err) {
      toast.error('تغییر نقش ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setRolesSaving(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!detail) return;
    if (revokeReason.trim().length < 3) {
      toast.error('دلیل لغو نشست‌ها الزامی است', 'لطفاً حداقل ۳ کاراکتر توضیح وارد کنید.');
      return;
    }
    setRevoking(true);
    try {
      const res = await adminClient.revokeUserSessions(detail.user.id, revokeReason.trim());
      toast.success(
        'نشست‌های فعال کاربر لغو شد',
        `تعداد ${formatPersianNumber(res.revokedCount)} نشست باطل گردید.`
      );
      setRevokeModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error('لغو نشست‌ها ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-slate-200 rounded-lg" />
        <div className="h-56 bg-white border border-slate-200 rounded-lg" />
      </div>
    );
  }

  if (error || !detail) {
    return <AdminErrorState message={error || 'کاربر یافت نشد.'} onRetry={loadData} />;
  }

  const targetUser = detail.user;
  const fullName = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ').trim();
  const isSelf = currentAdmin?.id === targetUser.id;
  const targetIsSuperAdmin = targetUser.roles.includes('super_admin');
  const blockedSuperAdminModification = targetIsSuperAdmin && !isSuperAdmin;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={fullName || `کاربر ${targetUser.maskedPhone}`}
        description={`شناسه: ${targetUser.id} · نشست‌های فعال: ${formatPersianNumber(detail.activeSessionsCount)}`}
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'کاربران', href: '/admin/users' },
          { label: fullName || targetUser.maskedPhone },
        ]}
        actions={
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فهرست</span>
          </Link>
        }
      />

      {isSelf && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            شما در حال مشاهده پروفایل حساب خودتان هستید. غیرفعال‌سازی یا کاهش دسترسی حساب خودتان توسط سرور محدود شده است.
          </span>
        </div>
      )}

      {/* User Overview Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block mb-1">شماره تماس (ماسک‌شده)</span>
          <strong dir="ltr" className="font-mono text-sm text-slate-900">
            {targetUser.maskedPhone}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 block mb-1">وضعیت فعلی</span>
          <AccountStatusLabel status={targetUser.status} />
        </div>
        <div>
          <span className="text-slate-500 block mb-1">تاریخ تأیید شماره</span>
          <span className="text-slate-800 tabular-nums">
            {formatPersianDateTime(targetUser.phoneVerifiedAt)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-1">آخرین ورود موفق</span>
          <span className="text-slate-800 tabular-nums">
            {formatPersianDateTime(targetUser.lastLoginAt)}
          </span>
        </div>
      </div>

      {/* Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Management */}
        <form
          onSubmit={handleStatusSubmit}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">مدیریت وضعیت حساب</h2>
          </div>

          <AdminField label="وضعیت حساب کاربری" required>
            <AdminSelect
              disabled={!canManageStatus || blockedSuperAdminModification || isSelf}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AccountStatus)}
            >
              {ACCOUNT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {ACCOUNT_STATUS_LABELS[st]}
                </option>
              ))}
            </AdminSelect>
          </AdminField>

          <AdminField label="دلیل تغییر وضعیت (ثبت در Audit Log)" required>
            <AdminTextarea
              rows={2}
              disabled={!canManageStatus || blockedSuperAdminModification || isSelf}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="دلیل تعلیق، فعال‌سازی یا مسدودسازی را بنویسید (حداقل ۳ کاراکتر)..."
            />
          </AdminField>

          {canManageStatus && !blockedSuperAdminModification && !isSelf ? (
            <AdminButton type="submit" variant="primary" isLoading={statusSaving}>
              ذخیره تغییر وضعیت
            </AdminButton>
          ) : (
            <p className="text-xs text-slate-500">
              {blockedSuperAdminModification
                ? 'فقط مدیر ارشد سیستم امکان تغییر وضعیت مدیر ارشد دیگر را دارد.'
                : 'تغییر وضعیت برای این حساب مجاز نیست.'}
            </p>
          )}
        </form>

        {/* Role Management */}
        <form
          onSubmit={handleRolesSubmit}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">مدیریت نقش‌های RBAC</h2>
          </div>

          <div className="space-y-2">
            {USER_ROLES.map((role) => {
              const checked = selectedRoles.includes(role);
              const disableSuperRole = role === 'super_admin' && !isSuperAdmin;
              const disabled =
                !canManageRoles || blockedSuperAdminModification || isSelf || disableSuperRole;

              return (
                <label
                  key={role}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                    checked
                      ? 'border-emerald-300 bg-emerald-50/60 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-slate-50/40 text-slate-700'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => handleToggleRole(role)}
                    />
                    <span>{USER_ROLE_LABELS[role]}</span>
                  </div>
                  <span dir="ltr" className="font-mono text-[11px] text-slate-400">
                    {role}
                  </span>
                </label>
              );
            })}
          </div>

          <AdminField label="دلیل تغییر نقش (ثبت در Audit Log)" required>
            <AdminTextarea
              rows={2}
              disabled={!canManageRoles || blockedSuperAdminModification || isSelf}
              value={roleReason}
              onChange={(e) => setRoleReason(e.target.value)}
              placeholder="علت اعطا یا سلب نقش را توضیح دهید..."
            />
          </AdminField>

          {canManageRoles && !blockedSuperAdminModification && !isSelf ? (
            <AdminButton type="submit" variant="primary" isLoading={rolesSaving}>
              ذخیره نقش‌های کاربری
            </AdminButton>
          ) : (
            <p className="text-xs text-slate-500">
              {blockedSuperAdminModification
                ? 'تغییر نقش مدیر ارشد سیستم فقط توسط مدیر ارشد دیگر امکان‌پذیر است.'
                : 'تغییر نقش برای این حساب مجاز نیست.'}
            </p>
          )}
        </form>
      </div>

      {/* Sessions Management */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">تاریخچه نشست‌های احراز هویت</h2>
            </div>
            <p className="text-xs text-slate-500">
              سرویس بک‌اند امکان لغو یکجای تمام نشست‌های فعال کاربر را فراهم می‌کند.
            </p>
          </div>
          {canRevokeSessions && !blockedSuperAdminModification && detail.activeSessionsCount > 0 && (
            <AdminButton
              variant="danger"
              size="sm"
              onClick={() => setRevokeModalOpen(true)}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              لغو همه نشست‌های فعال ({formatPersianNumber(detail.activeSessionsCount)})
            </AdminButton>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            هیچ نشستی برای این کاربر ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">وضعیت نشست</th>
                  <th className="px-4 py-3 font-semibold">زمان صدور</th>
                  <th className="px-4 py-3 font-semibold">آخرین استفاده</th>
                  <th className="px-4 py-3 font-semibold">انقضا</th>
                  <th className="px-4 py-3 font-semibold">User Agent</th>
                  <th className="px-4 py-3 font-semibold">دلیل لغو</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => {
                  const isRevoked = Boolean(s.revokedAt);
                  const isExpired = new Date(s.expiresAt).getTime() <= Date.now();
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isRevoked ? (
                          <span className="text-red-700 font-medium">لغوشده</span>
                        ) : isExpired ? (
                          <span className="text-slate-500">منقضی‌شده</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">فعال</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-600">
                        {formatPersianDateTime(s.issuedAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-600">
                        {formatPersianDateTime(s.lastUsedAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-600">
                        {formatPersianDateTime(s.expiresAt)}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate font-mono text-[11px] text-slate-500" dir="ltr">
                        {s.userAgent || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.revokeReason || (s.revokedAt ? formatPersianDateTime(s.revokedAt) : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminConfirmModal
        open={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        onConfirm={handleRevokeAllSessions}
        isLoading={revoking}
        variant="danger"
        title="لغو همه نشست‌های فعال کاربر"
        confirmLabel="لغو همه نشست‌ها"
        message={`تمامی ${formatPersianNumber(detail.activeSessionsCount)} نشست فعال این کاربر بلافاصله منقضی خواهند شد.`}
      >
        <AdminField label="دلیل لغو نشست‌ها (الزامی)" required>
          <AdminTextarea
            rows={2}
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="مثلاً: درخواست امنیتی کاربر یا تغییر نقش"
          />
        </AdminField>
      </AdminConfirmModal>
    </div>
  );
}

export default function AdminUserDetailPage() {
  return (
    <AdminGuard requiredPermission="users:read">
      <UserDetailContent />
    </AdminGuard>
  );
}

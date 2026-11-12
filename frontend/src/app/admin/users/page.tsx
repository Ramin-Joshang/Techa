'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Search, Shield, Users } from 'lucide-react';
import { ACCOUNT_STATUSES, USER_ROLES } from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import { AdminInput, AdminSelect } from '../../../components/admin/ui/AdminFormFields';
import {
  AccountStatusLabel,
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminPagination,
} from '../../../components/admin/ui/AdminPrimitives';
import { adminClient } from '../../../lib/admin/admin-client';
import {
  ACCOUNT_STATUS_LABELS,
  USER_ROLE_LABELS,
  formatPersianDateTime,
} from '../../../lib/admin/admin-formatters';
import { AdminUserDto, PaginationMeta } from '../../../lib/admin/admin-types';

function UsersListContent() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.listUsers({
        page,
        limit: 20,
        q: q.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        sort,
        order,
      });
      setUsers(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری لیست کاربران');
    } finally {
      setLoading(false);
    }
  }, [page, q, role, status, sort, order]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مدیریت کاربران و دسترسی‌ها"
        description="مشاهده حساب‌های کاربری، مدیریت نقش‌های RBAC، تغییر وضعیت و لغو نشست‌های فعال"
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'کاربران' }]}
      />

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <AdminInput
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو با نام، نام خانوادگی یا شماره ماسک‌شده..."
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <AdminSelect
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه نقش‌ها</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {USER_ROLE_LABELS[r]}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {ACCOUNT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {ACCOUNT_STATUS_LABELS[st]}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={`${sort}:${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split(':');
            setSort(s);
            setOrder(o as 'asc' | 'desc');
            setPage(1);
          }}
        >
          <option value="createdAt:desc">جدیدترین ثبت‌نام</option>
          <option value="lastLoginAt:desc">آخرین ورود</option>
          <option value="updatedAt:desc">آخرین ویرایش</option>
        </AdminSelect>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title="کاربری یافت نشد"
          description="هیچ حساب کاربری مطابق فیلترهای انتخاب‌شده پیدا نشد."
          icon={<Users className="w-6 h-6" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">کاربر</th>
                  <th className="px-4 py-3 font-semibold">شماره تماس (ماسک‌شده)</th>
                  <th className="px-4 py-3 font-semibold">نقش‌ها</th>
                  <th className="px-4 py-3 font-semibold">وضعیت حساب</th>
                  <th className="px-4 py-3 font-semibold">آخرین ورود</th>
                  <th className="px-4 py-3 font-semibold">ثبت‌نام</th>
                  <th className="px-4 py-3 font-semibold">مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-700"
                        >
                          {fullName || 'کاربر بدون نام'}
                        </Link>
                        <div dir="ltr" className="text-[11px] text-slate-400 font-mono">
                          {u.id}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span dir="ltr" className="font-mono text-slate-800">
                          {u.maskedPhone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
                            >
                              <Shield className="w-3 h-3 text-slate-400" />
                              {USER_ROLE_LABELS[r] || r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AccountStatusLabel status={u.status} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap tabular-nums">
                        {formatPersianDateTime(u.lastLoginAt)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap tabular-nums">
                        {formatPersianDateTime(u.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>جزئیات</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <AdminPagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard requiredPermission="users:read">
      <UsersListContent />
    </AdminGuard>
  );
}

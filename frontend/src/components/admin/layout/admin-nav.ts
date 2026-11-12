import { AdminPermission } from '@techa/shared';

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  permission: AdminPermission;
  iconName:
    | 'dashboard'
    | 'courses'
    | 'media'
    | 'pages'
    | 'settings'
    | 'users'
    | 'revisions'
    | 'audit';
  matchPrefixes: string[];
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: 'نمای کلی',
    items: [
      {
        key: 'dashboard',
        label: 'داشبورد',
        href: '/admin',
        permission: 'dashboard:read',
        iconName: 'dashboard',
        matchPrefixes: ['/admin'],
      },
    ],
  },
  {
    title: 'مدیریت محتوا',
    items: [
      {
        key: 'courses',
        label: 'دوره‌ها و درس‌ها',
        href: '/admin/courses',
        permission: 'courses:read',
        iconName: 'courses',
        matchPrefixes: ['/admin/courses', '/admin/chapters', '/admin/lessons'],
      },
      {
        key: 'media',
        label: 'کتابخانه رسانه',
        href: '/admin/media',
        permission: 'media:read',
        iconName: 'media',
        matchPrefixes: ['/admin/media'],
      },
      {
        key: 'pages',
        label: 'صفحات سایت',
        href: '/admin/pages',
        permission: 'pages:read',
        iconName: 'pages',
        matchPrefixes: ['/admin/pages'],
      },
    ],
  },
  {
    title: 'مدیریت پلتفرم',
    items: [
      {
        key: 'settings',
        label: 'تنظیمات سایت',
        href: '/admin/settings',
        permission: 'settings:read',
        iconName: 'settings',
        matchPrefixes: ['/admin/settings'],
      },
      {
        key: 'users',
        label: 'کاربران و دسترسی‌ها',
        href: '/admin/users',
        permission: 'users:read',
        iconName: 'users',
        matchPrefixes: ['/admin/users'],
      },
    ],
  },
  {
    title: 'حاکمیت و نسخه‌ها',
    items: [
      {
        key: 'revisions',
        label: 'تاریخچه نسخه‌ها',
        href: '/admin/revisions',
        permission: 'revisions:read',
        iconName: 'revisions',
        matchPrefixes: ['/admin/revisions'],
      },
      {
        key: 'audit-logs',
        label: 'گزارش‌های ممیزی',
        href: '/admin/audit-logs',
        permission: 'audit:read',
        iconName: 'audit',
        matchPrefixes: ['/admin/audit-logs'],
      },
    ],
  },
];

export function isAdminNavItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.href === '/admin') {
    return pathname === '/admin';
  }
  return item.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

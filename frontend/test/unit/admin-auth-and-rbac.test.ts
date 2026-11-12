import { describe, it, expect } from 'vitest';
import { hasAdminPermission, hasAnyAdminAccess } from '@techa/shared';
import {
  ADMIN_NAV_SECTIONS,
  isAdminNavItemActive,
} from '../../src/components/admin/layout/admin-nav';
import { sanitizeAdminReturnPath } from '../../src/lib/admin/admin-formatters';

describe('Phase 7 Admin RBAC, Navigation Filtering & Return URL Security', () => {
  it('blocks student role from admin panel access while allowing editorial/admin roles', () => {
    expect(hasAnyAdminAccess(['student'])).toBe(false);
    expect(hasAnyAdminAccess([])).toBe(false);
    expect(hasAnyAdminAccess(['content_editor'])).toBe(true);
    expect(hasAnyAdminAccess(['content_manager'])).toBe(true);
    expect(hasAnyAdminAccess(['admin'])).toBe(true);
    expect(hasAnyAdminAccess(['super_admin'])).toBe(true);
  });

  it('enforces granular permissions per role in admin navigation sections', () => {
    const allItems = ADMIN_NAV_SECTIONS.flatMap((sec) => sec.items);

    const editorVisibleKeys = allItems
      .filter((item) => hasAdminPermission(['content_editor'], item.permission))
      .map((item) => item.key);
    expect(editorVisibleKeys).toEqual(['dashboard', 'courses', 'media', 'pages', 'revisions']);
    expect(editorVisibleKeys).not.toContain('settings');
    expect(editorVisibleKeys).not.toContain('users');
    expect(editorVisibleKeys).not.toContain('audit-logs');

    const adminVisibleKeys = allItems
      .filter((item) => hasAdminPermission(['admin'], item.permission))
      .map((item) => item.key);
    expect(adminVisibleKeys).toContain('settings');
    expect(adminVisibleKeys).toContain('users');
    expect(adminVisibleKeys).toContain('audit-logs');
    expect(adminVisibleKeys).toContain('revisions');
  });

  it('highlights active admin navigation items across nested routes', () => {
    const allItems = ADMIN_NAV_SECTIONS.flatMap((sec) => sec.items);
    const dashboardItem = allItems.find((i) => i.key === 'dashboard')!;
    const coursesItem = allItems.find((i) => i.key === 'courses')!;
    const usersItem = allItems.find((i) => i.key === 'users')!;

    expect(isAdminNavItemActive(dashboardItem, '/admin')).toBe(true);
    expect(isAdminNavItemActive(dashboardItem, '/admin/courses')).toBe(false);

    expect(isAdminNavItemActive(coursesItem, '/admin/courses/507f1f77bcf86cd799439011')).toBe(true);
    expect(isAdminNavItemActive(coursesItem, '/admin/chapters/507f1f77bcf86cd799439011')).toBe(true);
    expect(isAdminNavItemActive(coursesItem, '/admin/lessons/507f1f77bcf86cd799439011')).toBe(true);

    expect(isAdminNavItemActive(usersItem, '/admin/users/507f1f77bcf86cd799439011')).toBe(true);
  });

  it('sanitizes admin return paths and prevents open redirects', () => {
    expect(sanitizeAdminReturnPath('/admin/courses')).toBe('/admin/courses');
    expect(sanitizeAdminReturnPath('/admin/lessons/507f1f77bcf86cd799439011?tab=preview')).toBe(
      '/admin/lessons/507f1f77bcf86cd799439011?tab=preview'
    );

    expect(sanitizeAdminReturnPath(null)).toBe('/admin');
    expect(sanitizeAdminReturnPath('')).toBe('/admin');
    expect(sanitizeAdminReturnPath('/admin/login')).toBe('/admin');
    expect(sanitizeAdminReturnPath('/admin/login?next=/admin')).toBe('/admin');
    expect(sanitizeAdminReturnPath('https://evil.example/admin')).toBe('/admin');
    expect(sanitizeAdminReturnPath('//evil.example/admin')).toBe('/admin');
    expect(sanitizeAdminReturnPath('/admin\\evil')).toBe('/admin');
    expect(sanitizeAdminReturnPath('/docs/react')).toBe('/admin');
    expect(sanitizeAdminReturnPath('javascript:alert(1)')).toBe('/admin');
  });
});

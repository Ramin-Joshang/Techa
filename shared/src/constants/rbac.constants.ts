import { UserRole } from './content.constants';

export const ADMIN_PERMISSIONS = [
  'courses:read',
  'courses:create',
  'courses:update',
  'courses:publish',
  'courses:archive',
  'chapters:read',
  'chapters:create',
  'chapters:update',
  'chapters:reorder',
  'chapters:publish',
  'chapters:archive',
  'lessons:read',
  'lessons:create',
  'lessons:update',
  'lessons:reorder',
  'lessons:publish',
  'lessons:archive',
  'media:read',
  'media:upload',
  'media:update',
  'media:delete',
  'pages:read',
  'pages:create',
  'pages:update',
  'pages:publish',
  'pages:archive',
  'settings:read',
  'settings:update',
  'revisions:read',
  'revisions:restore',
  'users:read',
  'users:manage_status',
  'users:manage_roles',
  'users:revoke_sessions',
  'audit:read',
  'preview:read',
  'dashboard:read',
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const CONTENT_EDITOR_PERMISSIONS: readonly AdminPermission[] = [
  'courses:read',
  'courses:create',
  'courses:update',
  'chapters:read',
  'chapters:create',
  'chapters:update',
  'chapters:reorder',
  'lessons:read',
  'lessons:create',
  'lessons:update',
  'lessons:reorder',
  'media:read',
  'media:upload',
  'media:update',
  'pages:read',
  'revisions:read',
  'preview:read',
  'dashboard:read',
];

export const CONTENT_MANAGER_PERMISSIONS: readonly AdminPermission[] = [
  ...CONTENT_EDITOR_PERMISSIONS,
  'courses:publish',
  'courses:archive',
  'chapters:publish',
  'chapters:archive',
  'lessons:publish',
  'lessons:archive',
  'media:delete',
  'pages:create',
  'pages:update',
  'pages:publish',
  'pages:archive',
  'revisions:restore',
];

export const ADMIN_ROLE_PERMISSIONS: readonly AdminPermission[] = [
  ...CONTENT_MANAGER_PERMISSIONS,
  'settings:read',
  'settings:update',
  'users:read',
  'users:manage_status',
  'users:manage_roles',
  'users:revoke_sessions',
  'audit:read',
];

export const SUPER_ADMIN_PERMISSIONS: readonly AdminPermission[] = [...ADMIN_PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, readonly AdminPermission[]> = {
  student: [],
  content_editor: CONTENT_EDITOR_PERMISSIONS,
  content_manager: CONTENT_MANAGER_PERMISSIONS,
  admin: ADMIN_ROLE_PERMISSIONS,
  super_admin: SUPER_ADMIN_PERMISSIONS,
};

export function getPermissionsForRoles(roles: readonly UserRole[] = []): Set<AdminPermission> {
  const granted = new Set<AdminPermission>();
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms) {
      for (const p of perms) {
        granted.add(p);
      }
    }
  }
  return granted;
}

export function hasAdminPermission(
  roles: readonly UserRole[] = [],
  permission: AdminPermission
): boolean {
  const granted = getPermissionsForRoles(roles);
  return granted.has(permission);
}

export function hasAnyAdminAccess(roles: readonly UserRole[] = []): boolean {
  return roles.some((r) => r !== 'student' && (ROLE_PERMISSIONS[r]?.length ?? 0) > 0);
}

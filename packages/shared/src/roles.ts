export const PLATFORM_ROLES = ['SUPER_ADMIN'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const STORE_ROLES = ['STORE_MANAGER', 'STORE_OPERATOR', 'CATALOG_MANAGER'] as const;
export type StoreRole = (typeof STORE_ROLES)[number];

export const ALL_ROLES = [...PLATFORM_ROLES, ...STORE_ROLES, 'COURIER', 'CUSTOMER'] as const;
export type AppRole = (typeof ALL_ROLES)[number];

/**
 * Permission definitions for RBAC.
 * Format: resource:action
 */
export const PERMISSIONS = {
  // Store management
  'stores:create': ['SUPER_ADMIN'],
  'stores:update': ['SUPER_ADMIN'],
  'stores:list': ['SUPER_ADMIN'],
  'stores:deactivate': ['SUPER_ADMIN'],

  // Store settings
  'store-settings:read': ['SUPER_ADMIN', 'STORE_MANAGER'],
  'store-settings:update': ['SUPER_ADMIN', 'STORE_MANAGER'],

  // Staff management
  'staff:list': ['SUPER_ADMIN', 'STORE_MANAGER'],
  'staff:assign': ['SUPER_ADMIN', 'STORE_MANAGER'],
  'staff:revoke': ['SUPER_ADMIN', 'STORE_MANAGER'],

  // Courier management
  'couriers:list': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],
  'couriers:create': ['SUPER_ADMIN', 'STORE_MANAGER'],
  'couriers:update': ['SUPER_ADMIN', 'STORE_MANAGER'],

  // Catalog
  'categories:create': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],
  'categories:update': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],
  'categories:delete': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],
  'products:create': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],
  'products:update': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],
  'products:delete': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],
  'products:import': ['SUPER_ADMIN', 'STORE_MANAGER', 'CATALOG_MANAGER'],

  // Orders
  'orders:list': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],
  'orders:view': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],
  'orders:update-status': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],
  'orders:assign-courier': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],
  'orders:cancel': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],
  'orders:substitution': ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR'],

  // Audit
  'audit:read': ['SUPER_ADMIN', 'STORE_MANAGER'],
} as const satisfies Record<string, readonly AppRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(roles: AppRole[], permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return roles.some((role) => (allowedRoles as readonly string[]).includes(role));
}

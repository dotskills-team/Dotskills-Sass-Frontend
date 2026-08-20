/** `GET /platform/permissions` item — `PLATFORM_PERMISSIONS`-এর whitelist দিয়ে scoped (verified platform-role.service.ts `listPermissions`). */
export interface PlatformPermissionCatalogItem {
  id: string;
  code: string;
  moduleCode: string;
  resource: string;
  action: string;
  name: string;
  description: string | null;
}

export type PlatformRoleStatus = "ACTIVE" | "INACTIVE";
export type PermissionEffect = "ALLOW" | "DENY";

/** `GET /platform/roles` item (verified platform-role.service.ts `ROLE_LIST_SELECT`). */
export interface PlatformRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  status: PlatformRoleStatus;
  _count: { members: number; permissions: number };
  permissions: { effect: PermissionEffect; permission: { code: string; name: string } }[];
}

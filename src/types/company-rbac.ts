/** Backend `GET /companies/:companyId/rbac/permissions` item (verified company-rbac.controller.ts `listPermissions`). */
export interface CompanyPermission {
  id: string;
  code: string;
  moduleCode: string;
  resource: string;
  action: string;
  name: string;
  description: string | null;
}

export type PermissionEffect = "ALLOW" | "DENY";
export type CompanyRoleStatus = "ACTIVE" | "INACTIVE";
export type CompanyScopeType = "COMPANY" | "BRANCH" | "WAREHOUSE" | "POS_COUNTER";

/** `GET /companies/:companyId/rbac/roles` item (verified `listRoles` select). */
export interface CompanyRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  _count: { members: number; permissions: number };
  permissions: { effect: PermissionEffect; permission: { code: string; name: string } }[];
}

/** `GET /companies/:companyId/rbac/members` item (verified `MEMBER_SELECT`). */
export interface CompanyMember {
  id: string;
  tenantId: string;
  companyId: string;
  employeeCode: string | null;
  designation: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";
  joinedAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; fullName: string; status: string };
  roles: { expiresAt: string | null; companyRole: { id: string; code: string; name: string } }[];
  scopes: { id: string; scopeType: CompanyScopeType; scopeKey: string; validUntil: string | null }[];
  locations: { locationId: string; location: { name: string } }[];
}

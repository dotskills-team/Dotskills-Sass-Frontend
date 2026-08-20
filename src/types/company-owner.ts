import type { CompanyMembershipStatus } from "@/types/platform";

/** `GET /platform/companies/:companyId/owner` list item (verified company-owner.service.ts `findAll`). */
export interface CompanyOwnerUser {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  status: string;
  lastLoginAt: string | null;
}

export interface CompanyOwnerRole {
  companyMemberId: string;
  companyRoleId: string;
  companyRole: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CompanyOwnerMember {
  id: string;
  companyId: string;
  tenantId: string;
  userId: string;
  designation: string | null;
  status: CompanyMembershipStatus;
  activatedAt: string | null;
  user: CompanyOwnerUser;
  roles: CompanyOwnerRole[];
}

export interface CompanyOwnership {
  id: string;
  tenantId: string;
  companyId: string;
  companyMemberId: string;
  isPrimary: boolean;
  startedAt: string;
  endedAt: string | null;
  companyMember: CompanyOwnerMember;
}

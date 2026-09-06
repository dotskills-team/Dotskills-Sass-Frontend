/**
 * Backend-এর GET /auth/me/companies response mirror (Phase 3-এ যোগ করা
 * endpoint — auth.controller.ts/auth.service.ts, এই session-এই লেখা ও
 * live-verified)।
 */
export interface CompanyMembership {
  companyId: string;
  companyMemberId: string;
  tenantId: string;
  companyName: string;
  logoUrl: string | null;
  companyStatus: string;
  tenantStatus: string;
  roleCodes: string[];
  permissions: string[];
}

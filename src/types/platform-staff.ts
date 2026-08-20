/** `GET /platform/staff` item (verified platform-staff.controller.ts `PLATFORM_MEMBER_SELECT`). */
export interface PlatformStaffMember {
  id: string;
  employeeCode: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";
  invitedAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; fullName: string; status: string; lastLoginAt: string | null };
  roles: { assignedAt: string; platformRole: { id: string; code: string; name: string; status: string } }[];
}

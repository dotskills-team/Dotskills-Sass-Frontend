import { describe, expect, it } from "vitest";

import { dashboardPathForScope, resolveUserScope } from "./scope";
import type { AuthenticatedUser, PlatformStaffUser } from "@/types/auth";

const baseUser: AuthenticatedUser = {
  userId: "u1",
  sessionId: "s1",
  email: "owner@company.test",
  fullName: "Company Owner",
  preferredLocale: "en",
  timezone: "Asia/Dhaka",
  roles: [],
};

describe("resolveUserScope", () => {
  it("resolves to company when there is no platformMemberId and no roles", () => {
    expect(resolveUserScope(baseUser)).toBe("company");
  });

  it("resolves to platform when platformMemberId is present", () => {
    expect(resolveUserScope({ ...baseUser, platformMemberId: "pm1" })).toBe("platform");
  });

  it("resolves to platform when roles is non-empty, even without platformMemberId", () => {
    expect(resolveUserScope({ ...baseUser, roles: ["SUPER_ADMIN"] })).toBe("platform");
  });

  it("resolves platform staff users (with permissions) to platform", () => {
    const staffUser: PlatformStaffUser = {
      ...baseUser,
      platformMemberId: "pm1",
      userType: "PLATFORM_STAFF",
      roles: ["SUPER_ADMIN"],
      permissions: ["platform.staff.read"],
    };

    expect(resolveUserScope(staffUser)).toBe("platform");
  });
});

describe("dashboardPathForScope", () => {
  it("maps platform to /platform/dashboard", () => {
    expect(dashboardPathForScope("platform")).toBe("/platform/dashboard");
  });

  it("maps company to /company/dashboard", () => {
    expect(dashboardPathForScope("company")).toBe("/company/dashboard");
  });
});

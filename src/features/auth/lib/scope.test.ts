import { describe, expect, it } from "vitest";

import { dashboardPathForScope, resolveRedirectTarget, resolveUserScope } from "./scope";
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

describe("resolveRedirectTarget", () => {
  it("returns the scope's own dashboard when there is no redirectTo", () => {
    expect(resolveRedirectTarget("company", null)).toBe("/company/dashboard");
    expect(resolveRedirectTarget("platform", null)).toBe("/platform/dashboard");
  });

  it("honors redirectTo when it matches the resolved scope", () => {
    expect(resolveRedirectTarget("company", "/company/invoices/123")).toBe("/company/invoices/123");
    expect(resolveRedirectTarget("platform", "/platform/companies/456")).toBe("/platform/companies/456");
  });

  /**
   * Regression: a company login carrying a leftover `/platform/...`
   * redirectTo (e.g. from an earlier platform-session bounce in the same
   * browser tab) used to be honored blindly, landing the company user on
   * a platform route — whose layout renders the platform sidebar
   * unconditionally by URL, regardless of the user's actual scope.
   */
  it("ignores redirectTo that belongs to a different scope", () => {
    expect(resolveRedirectTarget("company", "/platform/dashboard")).toBe("/company/dashboard");
    expect(resolveRedirectTarget("platform", "/company/invoices/123")).toBe("/platform/dashboard");
  });

  it("ignores an unrelated/unscoped redirectTo", () => {
    expect(resolveRedirectTarget("company", "/login")).toBe("/company/dashboard");
    expect(resolveRedirectTarget("company", "https://evil.example.com")).toBe("/company/dashboard");
  });
});

import { describe, expect, it } from "vitest";

import { hasAllPermissions, hasAnyPermission, hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("returns true when the code is present", () => {
    expect(hasPermission(["invoice.read"], "invoice.read")).toBe(true);
  });

  it("returns false when the code is missing", () => {
    expect(hasPermission(["invoice.read"], "invoice.create")).toBe(false);
  });

  it("returns false when permissions is undefined", () => {
    expect(hasPermission(undefined, "invoice.read")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("returns true if at least one required code is present", () => {
    expect(hasAnyPermission(["invoice.read"], ["invoice.create", "invoice.read"])).toBe(true);
  });

  it("returns false if none of the required codes are present", () => {
    expect(hasAnyPermission(["invoice.read"], ["invoice.create", "invoice.void"])).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true only when every required code is present", () => {
    expect(
      hasAllPermissions(["invoice.read", "invoice.create"], ["invoice.read", "invoice.create"]),
    ).toBe(true);
  });

  it("returns false when at least one required code is missing", () => {
    expect(hasAllPermissions(["invoice.read"], ["invoice.read", "invoice.create"])).toBe(false);
  });
});

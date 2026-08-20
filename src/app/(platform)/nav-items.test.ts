import { describe, expect, it } from "vitest";

import { platformNavItems } from "./nav-items";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import type { NavItem } from "@/components/layout/app-sidebar";

const PLATFORM_PERMISSION_VALUES = Object.values(PLATFORM_PERMISSIONS) as string[];

/** Group parent-এর নিজের route নেই — children flatten করে exact same flat checks reuse করা যায়। */
function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children ? flatten(item.children) : [item]));
}

const flatItems = flatten(platformNavItems);

describe("platformNavItems", () => {
  it("has no duplicate routes", () => {
    const hrefs = flatItems.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("every gated item uses an exact PLATFORM_PERMISSIONS code (never invented)", () => {
    for (const item of flatItems) {
      if (item.platformPermission) {
        const codes = Array.isArray(item.platformPermission)
          ? item.platformPermission
          : [item.platformPermission];
        for (const code of codes) {
          expect(PLATFORM_PERMISSION_VALUES).toContain(code);
        }
      }
    }
  });

  it("only the always-visible Dashboard item (and group headers, which gate via their children) have no permission gate", () => {
    const ungated = flatItems.filter((item) => !item.platformPermission);
    expect(ungated).toHaveLength(1);
    expect(ungated[0]?.href).toBe("/platform/dashboard");
  });

  it("Access Control group has no route of its own and every child is permission-gated", () => {
    const group = platformNavItems.find((item) => item.labelKey === "accessControl");
    expect(group?.href).toBeUndefined();
    expect(group?.children?.length).toBeGreaterThan(0);
    for (const child of group?.children ?? []) {
      expect(child.platformPermission).toBeTruthy();
    }
  });

  it("gates each financial/resource route with its matching *_READ permission", () => {
    const expected: Record<string, string> = {
      "/platform/companies": PLATFORM_PERMISSIONS.COMPANY_READ,
      "/platform/industries": PLATFORM_PERMISSIONS.INDUSTRY_READ,
      "/platform/billing": PLATFORM_PERMISSIONS.BILLING_READ,
      "/platform/invoices": PLATFORM_PERMISSIONS.INVOICE_READ,
      "/platform/payments": PLATFORM_PERMISSIONS.PAYMENT_READ,
    };

    for (const [href, permission] of Object.entries(expected)) {
      const item = flatItems.find((navItem) => navItem.href === href);
      expect(item?.platformPermission).toBe(permission);
    }
  });
});

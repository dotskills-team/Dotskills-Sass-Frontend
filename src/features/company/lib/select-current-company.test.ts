import { describe, expect, it } from "vitest";

import { selectCurrentCompany } from "./select-current-company";
import type { CompanyMembership } from "@/types/company";

const companyA: CompanyMembership = {
  companyId: "a",
  companyMemberId: "ma",
  tenantId: "t1",
  companyName: "Company A",
  companyStatus: "LIVE",
  tenantStatus: "ACTIVE",
  roleCodes: ["COMPANY_OWNER"],
  permissions: ["company.invoice.read"],
};

const companyB: CompanyMembership = {
  ...companyA,
  companyId: "b",
  companyMemberId: "mb",
  companyName: "Company B",
};

describe("selectCurrentCompany", () => {
  it("returns null when currentCompanyId is null", () => {
    expect(selectCurrentCompany([companyA, companyB], null)).toBeNull();
  });

  it("returns null when companies is undefined (still loading)", () => {
    expect(selectCurrentCompany(undefined, "a")).toBeNull();
  });

  it("returns the matching company", () => {
    expect(selectCurrentCompany([companyA, companyB], "b")).toEqual(companyB);
  });

  it("returns null when currentCompanyId doesn't match any company (e.g. stale after logout)", () => {
    expect(selectCurrentCompany([companyA], "b")).toBeNull();
  });
});

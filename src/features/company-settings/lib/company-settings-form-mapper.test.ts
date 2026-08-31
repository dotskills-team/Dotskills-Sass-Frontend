import { describe, expect, it } from "vitest";

import { toCompanySettingsFormValues, toCompanySettingsPayload } from "./company-settings-form-mapper";
import type { CompanySettings } from "@/types/company-settings";

const settings: CompanySettings = {
  id: "settings-1",
  enableMultiUnit: true,
  enableCustomerDue: true,
  enableBarcode: false,
  enableProductVariant: false,
  enableComboOffer: false,
  enableMultiLocation: false,
  allowNegativeStock: false,
  maxCustomerDueLimit: "5000",
  enableTax: true,
  defaultTaxRate: "15",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("toCompanySettingsFormValues", () => {
  it("maps a null maxCustomerDueLimit to an empty string", () => {
    const values = toCompanySettingsFormValues({ ...settings, maxCustomerDueLimit: null });
    expect(values.maxCustomerDueLimit).toBe("");
  });

  it("passes through an existing maxCustomerDueLimit", () => {
    const values = toCompanySettingsFormValues(settings);
    expect(values.maxCustomerDueLimit).toBe("5000");
  });
});

describe("toCompanySettingsPayload", () => {
  it("converts non-empty numeric strings to numbers", () => {
    const payload = toCompanySettingsPayload(toCompanySettingsFormValues(settings));
    expect(payload.maxCustomerDueLimit).toBe(5000);
    expect(payload.defaultTaxRate).toBe(15);
  });

  it("omits empty numeric fields", () => {
    const payload = toCompanySettingsPayload(toCompanySettingsFormValues({ ...settings, maxCustomerDueLimit: null }));
    expect(payload.maxCustomerDueLimit).toBeUndefined();
  });
});

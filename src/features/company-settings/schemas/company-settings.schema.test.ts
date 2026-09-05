import { describe, expect, it } from "vitest";

import { createCompanySettingsSchema } from "./company-settings.schema";

const messages = {
  maxCustomerDueLimitNonNegative: "max-due-non-negative",
  maxSupplierPayableLimitNonNegative: "max-payable-non-negative",
  defaultTaxRateNonNegative: "tax-rate-non-negative",
};
const schema = createCompanySettingsSchema(messages);

const baseValues = {
  enableMultiUnit: false,
  enableCustomerDue: false,
  enableBarcode: false,
  enableProductVariant: false,
  enableComboOffer: false,
  enableMultiLocation: false,
  allowNegativeStock: false,
  enableTax: false,
};

describe("createCompanySettingsSchema", () => {
  it("accepts all toggles off with blank numeric fields", () => {
    expect(schema.safeParse({ ...baseValues, maxCustomerDueLimit: "", defaultTaxRate: "" }).success).toBe(true);
  });

  it("accepts a valid maxCustomerDueLimit and defaultTaxRate", () => {
    expect(
      schema.safeParse({ ...baseValues, maxCustomerDueLimit: "5000", defaultTaxRate: "15" }).success,
    ).toBe(true);
  });

  it("rejects a negative maxCustomerDueLimit", () => {
    expect(schema.safeParse({ ...baseValues, maxCustomerDueLimit: "-1" }).success).toBe(false);
  });

  it("accepts a valid maxSupplierPayableLimit", () => {
    expect(schema.safeParse({ ...baseValues, maxSupplierPayableLimit: "8000" }).success).toBe(true);
  });

  it("rejects a negative maxSupplierPayableLimit", () => {
    expect(schema.safeParse({ ...baseValues, maxSupplierPayableLimit: "-1" }).success).toBe(false);
  });

  it("rejects a negative defaultTaxRate", () => {
    expect(schema.safeParse({ ...baseValues, defaultTaxRate: "-1" }).success).toBe(false);
  });

  it("accepts zero for all numeric fields", () => {
    expect(
      schema.safeParse({
        ...baseValues,
        maxCustomerDueLimit: "0",
        maxSupplierPayableLimit: "0",
        defaultTaxRate: "0",
      }).success,
    ).toBe(true);
  });
});

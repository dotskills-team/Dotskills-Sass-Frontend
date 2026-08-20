import { describe, expect, it } from "vitest";

import { createPlanPriceCreateSchema, createPlanPriceEditSchema } from "./plan-price.schema";

const messages = {
  billingCycleRequired: "billing-cycle-required",
  currencyCodePattern: "currency-code-pattern",
  amountRequired: "amount-required",
  amountInvalid: "amount-invalid",
  effectiveToBeforeFrom: "effective-to-before-from",
};

const createSchema = createPlanPriceCreateSchema(messages);
const editSchema = createPlanPriceEditSchema(messages);

describe("createPlanPriceCreateSchema", () => {
  const base = {
    billingCycle: "MONTHLY" as const,
    currencyCode: "",
    amount: "999",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: "true" as const,
  };

  it("accepts a minimal valid payload", () => {
    expect(createSchema.safeParse(base).success).toBe(true);
  });

  it("accepts a valid currency code", () => {
    expect(createSchema.safeParse({ ...base, currencyCode: "USD" }).success).toBe(true);
  });

  it("rejects an invalid currency code", () => {
    expect(createSchema.safeParse({ ...base, currencyCode: "usd" }).success).toBe(false);
    expect(createSchema.safeParse({ ...base, currencyCode: "US" }).success).toBe(false);
  });

  it("rejects a missing billing cycle", () => {
    expect(
      createSchema.safeParse({
        currencyCode: base.currencyCode,
        amount: base.amount,
        effectiveFrom: base.effectiveFrom,
        effectiveTo: base.effectiveTo,
        isActive: base.isActive,
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid billing cycle", () => {
    expect(createSchema.safeParse({ ...base, billingCycle: "WEEKLY" }).success).toBe(false);
  });

  it("rejects a missing amount", () => {
    expect(createSchema.safeParse({ ...base, amount: "" }).success).toBe(false);
  });

  it("rejects a negative amount", () => {
    expect(createSchema.safeParse({ ...base, amount: "-1" }).success).toBe(false);
  });

  it("rejects an amount with more than 4 decimal places", () => {
    expect(createSchema.safeParse({ ...base, amount: "1.23456" }).success).toBe(false);
  });

  it("accepts an amount with up to 4 decimal places", () => {
    expect(createSchema.safeParse({ ...base, amount: "1.2345" }).success).toBe(true);
  });

  it("rejects effectiveTo before effectiveFrom", () => {
    expect(
      createSchema.safeParse({ ...base, effectiveFrom: "2026-06-01", effectiveTo: "2026-01-01" })
        .success,
    ).toBe(false);
  });

  it("accepts effectiveTo after effectiveFrom", () => {
    expect(
      createSchema.safeParse({ ...base, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-01" })
        .success,
    ).toBe(true);
  });
});

describe("createPlanPriceEditSchema", () => {
  it("does not require or accept billingCycle/currencyCode fields", () => {
    const result = editSchema.safeParse({
      amount: "999",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: "true",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing amount", () => {
    expect(
      editSchema.safeParse({ amount: "", effectiveFrom: "", effectiveTo: "", isActive: "true" })
        .success,
    ).toBe(false);
  });
});

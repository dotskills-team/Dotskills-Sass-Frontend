import { describe, expect, it } from "vitest";

import { toCreatePlanPricePayload, toUpdatePlanPricePayload } from "./plan-price-form-mapper";

describe("toCreatePlanPricePayload", () => {
  it("maps a full payload", () => {
    expect(
      toCreatePlanPricePayload({
        billingCycle: "MONTHLY",
        currencyCode: "usd",
        amount: "999.5",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        isActive: "true",
      }),
    ).toEqual({
      billingCycle: "MONTHLY",
      currencyCode: "usd",
      amount: 999.5,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      isActive: true,
    });
  });

  it("maps empty optional fields to undefined", () => {
    const payload = toCreatePlanPricePayload({
      billingCycle: "YEARLY",
      currencyCode: "",
      amount: "10",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: "false",
    });
    expect(payload.currencyCode).toBeUndefined();
    expect(payload.effectiveFrom).toBeUndefined();
    expect(payload.effectiveTo).toBeUndefined();
    expect(payload.isActive).toBe(false);
  });

  it("converts amount string to a number", () => {
    expect(
      toCreatePlanPricePayload({
        billingCycle: "MONTHLY",
        currencyCode: "",
        amount: "1234.5678",
        effectiveFrom: "",
        effectiveTo: "",
        isActive: "true",
      }).amount,
    ).toBe(1234.5678);
  });
});

describe("toUpdatePlanPricePayload", () => {
  it("never includes billingCycle/currencyCode (backend-immutable fields)", () => {
    const payload = toUpdatePlanPricePayload({
      amount: "500",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: "true",
    });
    expect(payload).not.toHaveProperty("billingCycle");
    expect(payload).not.toHaveProperty("currencyCode");
    expect(payload).toEqual({
      amount: 500,
      effectiveFrom: undefined,
      effectiveTo: undefined,
      isActive: true,
    });
  });
});

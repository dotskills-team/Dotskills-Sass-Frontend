import { describe, expect, it } from "vitest";

import { toSupplierPaymentPayload } from "./supplier-payment-form-mapper";

describe("toSupplierPaymentPayload", () => {
  it("converts amount to a number and omits an empty note", () => {
    const payload = toSupplierPaymentPayload("s-1", { amount: "250.5", note: "" });

    expect(payload).toEqual({ supplierId: "s-1", amount: 250.5, note: undefined });
  });

  it("trims a supplied note", () => {
    const payload = toSupplierPaymentPayload("s-1", { amount: "100", note: "  paid by cash  " });

    expect(payload.note).toBe("paid by cash");
  });
});

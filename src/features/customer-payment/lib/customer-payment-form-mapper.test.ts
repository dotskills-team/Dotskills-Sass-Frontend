import { describe, expect, it } from "vitest";

import { toCustomerPaymentPayload } from "./customer-payment-form-mapper";

describe("toCustomerPaymentPayload", () => {
  it("converts amount to a number and omits an empty note", () => {
    const payload = toCustomerPaymentPayload("c-1", { amount: "250.5", note: "" });

    expect(payload).toEqual({ customerId: "c-1", amount: 250.5, note: undefined });
  });

  it("trims a supplied note", () => {
    const payload = toCustomerPaymentPayload("c-1", { amount: "100", note: "  paid by cash  " });

    expect(payload.note).toBe("paid by cash");
  });
});

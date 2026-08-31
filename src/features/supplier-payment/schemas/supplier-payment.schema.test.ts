import { describe, expect, it } from "vitest";

import { createSupplierPaymentSchema } from "./supplier-payment.schema";

const messages = { amountPositive: "amount-positive" };
const schema = createSupplierPaymentSchema(messages);

describe("createSupplierPaymentSchema", () => {
  it("accepts a valid payload", () => {
    expect(schema.safeParse({ amount: "150", note: "" }).success).toBe(true);
  });

  it("accepts a payload without a note", () => {
    expect(schema.safeParse({ amount: "150" }).success).toBe(true);
  });

  it("rejects an empty amount", () => {
    expect(schema.safeParse({ amount: "", note: "" }).success).toBe(false);
  });

  it("rejects a zero amount", () => {
    expect(schema.safeParse({ amount: "0", note: "" }).success).toBe(false);
  });

  it("rejects a negative amount", () => {
    expect(schema.safeParse({ amount: "-10", note: "" }).success).toBe(false);
  });
});

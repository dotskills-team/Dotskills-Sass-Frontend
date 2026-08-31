import { describe, expect, it } from "vitest";

import { createStockTransferSchema } from "./stock-transfer.schema";

const messages = {
  fromLocationRequired: "from-location-required",
  toLocationRequired: "to-location-required",
  sameLocation: "same-location",
  productRequired: "product-required",
  quantityPositive: "quantity-positive",
};
const schema = createStockTransferSchema(messages);

const validPayload = { fromLocationId: "l-1", toLocationId: "l-2", productId: "p-1", quantity: "10" };

describe("createStockTransferSchema", () => {
  it("accepts a valid payload", () => {
    expect(schema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects a missing fromLocationId", () => {
    expect(schema.safeParse({ ...validPayload, fromLocationId: "" }).success).toBe(false);
  });

  it("rejects a missing toLocationId", () => {
    expect(schema.safeParse({ ...validPayload, toLocationId: "" }).success).toBe(false);
  });

  it("rejects a missing productId", () => {
    expect(schema.safeParse({ ...validPayload, productId: "" }).success).toBe(false);
  });

  it("rejects a zero quantity", () => {
    expect(schema.safeParse({ ...validPayload, quantity: "0" }).success).toBe(false);
  });

  it("rejects an empty quantity", () => {
    expect(schema.safeParse({ ...validPayload, quantity: "" }).success).toBe(false);
  });

  it("rejects fromLocationId equal to toLocationId", () => {
    const result = schema.safeParse({ ...validPayload, toLocationId: "l-1" });
    expect(result.success).toBe(false);
  });
});

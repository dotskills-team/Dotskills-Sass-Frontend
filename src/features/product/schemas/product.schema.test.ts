import { describe, expect, it } from "vitest";

import { createProductSchema } from "./product.schema";

const messages = {
  skuRequired: "sku-required",
  skuLength: "sku-length",
  nameRequired: "name-required",
  nameLength: "name-length",
  baseUnitRequired: "base-unit-required",
  pricePositive: "price-positive",
};
const schema = createProductSchema(messages);
const baseUnitId = "11111111-1111-1111-1111-111111111111";

describe("createProductSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(schema.safeParse({ sku: "RICE-5KG", name: "Rice 5kg", baseUnitId, sellByWeight: false }).success).toBe(
      true,
    );
  });

  it("accepts a full payload", () => {
    expect(
      schema.safeParse({
        sku: "RICE-5KG",
        name: "Rice 5kg",
        categoryId: "22222222-2222-2222-2222-222222222222",
        baseUnitId,
        barcode: "8901234567890",
        costPrice: "50",
        salePrice: "60",
        reorderLevel: "10",
        sellByWeight: true,
      }).success,
    ).toBe(true);
  });

  it("rejects a missing sku", () => {
    expect(schema.safeParse({ name: "Rice", baseUnitId, sellByWeight: false }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({ sku: "RICE", baseUnitId, sellByWeight: false }).success).toBe(false);
  });

  it("rejects a missing baseUnitId", () => {
    expect(schema.safeParse({ sku: "RICE", name: "Rice", sellByWeight: false }).success).toBe(false);
  });

  it("rejects a negative costPrice", () => {
    expect(
      schema.safeParse({ sku: "RICE", name: "Rice", baseUnitId, costPrice: "-1", sellByWeight: false }).success,
    ).toBe(false);
  });

  it("accepts blank optional price fields", () => {
    expect(
      schema.safeParse({
        sku: "RICE",
        name: "Rice",
        baseUnitId,
        costPrice: "",
        salePrice: "",
        reorderLevel: "",
        sellByWeight: false,
      }).success,
    ).toBe(true);
  });
});

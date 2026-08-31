import { describe, expect, it } from "vitest";

import { createPurchaseOrderSchema } from "./purchase-order.schema";

const messages = {
  supplierRequired: "supplier-required",
  locationRequired: "location-required",
  itemsMinOne: "items-min-one",
  productRequired: "product-required",
  orderedQtyPositive: "ordered-qty-positive",
  unitCostNonNegative: "unit-cost-non-negative",
};
const schema = createPurchaseOrderSchema(messages);

const validItem = { productId: "p-1", orderedQty: "10", unitCost: "5" };

describe("createPurchaseOrderSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(
      schema.safeParse({ supplierId: "s-1", locationId: "l-1", orderDate: "", note: "", items: [validItem] }).success,
    ).toBe(true);
  });

  it("rejects a missing supplierId", () => {
    expect(schema.safeParse({ locationId: "l-1", items: [validItem] }).success).toBe(false);
  });

  it("rejects a missing locationId", () => {
    expect(schema.safeParse({ supplierId: "s-1", items: [validItem] }).success).toBe(false);
  });

  it("rejects an empty items array", () => {
    expect(schema.safeParse({ supplierId: "s-1", locationId: "l-1", items: [] }).success).toBe(false);
  });

  it("rejects an item with no productId", () => {
    expect(
      schema.safeParse({ supplierId: "s-1", locationId: "l-1", items: [{ productId: "", orderedQty: "10", unitCost: "5" }] })
        .success,
    ).toBe(false);
  });

  it("rejects an item with zero orderedQty", () => {
    expect(
      schema.safeParse({ supplierId: "s-1", locationId: "l-1", items: [{ productId: "p-1", orderedQty: "0", unitCost: "5" }] })
        .success,
    ).toBe(false);
  });

  it("rejects an item with negative unitCost", () => {
    expect(
      schema.safeParse({ supplierId: "s-1", locationId: "l-1", items: [{ productId: "p-1", orderedQty: "10", unitCost: "-1" }] })
        .success,
    ).toBe(false);
  });

  it("accepts multiple items", () => {
    expect(
      schema.safeParse({ supplierId: "s-1", locationId: "l-1", items: [validItem, { productId: "p-2", orderedQty: "5", unitCost: "2" }] })
        .success,
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { toPurchaseOrderPayload } from "./purchase-order-form-mapper";

describe("toPurchaseOrderPayload", () => {
  it("converts item quantity/cost strings to numbers and omits empty optional fields", () => {
    const payload = toPurchaseOrderPayload({
      supplierId: "s-1",
      locationId: "l-1",
      orderDate: "",
      note: "  ",
      items: [{ productId: "p-1", orderedQty: "10", unitCost: "5.5" }],
    });

    expect(payload).toEqual({
      supplierId: "s-1",
      locationId: "l-1",
      orderDate: undefined,
      note: undefined,
      items: [{ productId: "p-1", orderedQty: 10, unitCost: 5.5 }],
    });
  });

  it("keeps a supplied orderDate and trimmed note, and maps multiple items", () => {
    const payload = toPurchaseOrderPayload({
      supplierId: "s-1",
      locationId: "l-1",
      orderDate: "2026-01-01",
      note: "  Urgent  ",
      items: [
        { productId: "p-1", orderedQty: "10", unitCost: "5" },
        { productId: "p-2", orderedQty: "3", unitCost: "2" },
      ],
    });

    expect(payload.orderDate).toBe("2026-01-01");
    expect(payload.note).toBe("Urgent");
    expect(payload.items).toHaveLength(2);
    expect(payload.items[1]).toEqual({ productId: "p-2", orderedQty: 3, unitCost: 2 });
  });
});

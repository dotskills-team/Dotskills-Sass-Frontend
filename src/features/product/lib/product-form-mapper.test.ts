import { describe, expect, it } from "vitest";

import { toProductPayload } from "./product-form-mapper";

const baseUnitId = "11111111-1111-1111-1111-111111111111";

describe("toProductPayload", () => {
  it("trims sku/name/barcode and omits empty optional fields", () => {
    const payload = toProductPayload({
      sku: "  RICE-5KG  ",
      name: "  Rice 5kg  ",
      categoryId: "",
      baseUnitId,
      barcode: "",
      costPrice: "",
      salePrice: "",
      reorderLevel: "",
      sellByWeight: false,
    });
    expect(payload).toEqual({
      sku: "RICE-5KG",
      name: "Rice 5kg",
      categoryId: undefined,
      baseUnitId,
      barcode: undefined,
      costPrice: undefined,
      salePrice: undefined,
      reorderLevel: undefined,
      sellByWeight: false,
    });
  });

  it("converts price strings to numbers", () => {
    const payload = toProductPayload({
      sku: "RICE",
      name: "Rice",
      categoryId: "",
      baseUnitId,
      barcode: "",
      costPrice: "50",
      salePrice: "60.5",
      reorderLevel: "10",
      sellByWeight: true,
    });
    expect(payload.costPrice).toBe(50);
    expect(payload.salePrice).toBe(60.5);
    expect(payload.reorderLevel).toBe(10);
    expect(payload.sellByWeight).toBe(true);
  });
});

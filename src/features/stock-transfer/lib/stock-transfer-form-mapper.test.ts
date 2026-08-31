import { describe, expect, it } from "vitest";

import { toStockTransferPayload } from "./stock-transfer-form-mapper";

describe("toStockTransferPayload", () => {
  it("converts quantity string to a number", () => {
    const payload = toStockTransferPayload({
      fromLocationId: "l-1",
      toLocationId: "l-2",
      productId: "p-1",
      quantity: "12.5",
    });

    expect(payload).toEqual({
      fromLocationId: "l-1",
      toLocationId: "l-2",
      productId: "p-1",
      quantity: 12.5,
    });
  });
});

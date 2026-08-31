import { describe, expect, it } from "vitest";

import { toSupplierPayload } from "./supplier-form-mapper";

describe("toSupplierPayload", () => {
  it("trims fields and omits empty optional ones", () => {
    expect(toSupplierPayload({ name: "  Rahim  ", phone: "", email: "", address: "" })).toEqual({
      name: "Rahim",
      phone: undefined,
      email: undefined,
      address: undefined,
    });
  });

  it("keeps supplied optional fields", () => {
    expect(
      toSupplierPayload({ name: "Rahim", phone: "01700000000", email: "rahim@example.com", address: "Dhaka" }),
    ).toEqual({ name: "Rahim", phone: "01700000000", email: "rahim@example.com", address: "Dhaka" });
  });
});

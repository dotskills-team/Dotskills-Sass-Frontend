import { describe, expect, it } from "vitest";

import { toCustomerPayload } from "./customer-form-mapper";

describe("toCustomerPayload", () => {
  it("trims fields and omits empty optional ones", () => {
    expect(
      toCustomerPayload({ name: "  Karim  ", phone: "", email: "", address: "", customerType: "RETAIL" }),
    ).toEqual({ name: "Karim", phone: undefined, email: undefined, address: undefined, customerType: "RETAIL" });
  });

  it("keeps supplied optional fields", () => {
    expect(
      toCustomerPayload({
        name: "Karim",
        phone: "01700000000",
        email: "karim@example.com",
        address: "Dhanmondi",
        customerType: "WHOLESALE",
      }),
    ).toEqual({
      name: "Karim",
      phone: "01700000000",
      email: "karim@example.com",
      address: "Dhanmondi",
      customerType: "WHOLESALE",
    });
  });
});

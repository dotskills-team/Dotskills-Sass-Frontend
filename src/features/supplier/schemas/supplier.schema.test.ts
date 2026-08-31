import { describe, expect, it } from "vitest";

import { createSupplierSchema } from "./supplier.schema";

const messages = { nameRequired: "name-required", nameLength: "name-length", emailInvalid: "email-invalid" };
const schema = createSupplierSchema(messages);

describe("createSupplierSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(schema.safeParse({ name: "Rahim Traders" }).success).toBe(true);
  });

  it("accepts a full payload", () => {
    expect(
      schema.safeParse({ name: "Rahim Traders", phone: "01700000000", email: "rahim@example.com", address: "Dhaka" })
        .success,
    ).toBe(true);
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({}).success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(schema.safeParse({ name: "Rahim", email: "not-an-email" }).success).toBe(false);
  });
});

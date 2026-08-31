import { describe, expect, it } from "vitest";

import { createCustomerSchema } from "./customer.schema";

const messages = { nameRequired: "name-required", nameLength: "name-length", emailInvalid: "email-invalid" };
const schema = createCustomerSchema(messages);

describe("createCustomerSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(schema.safeParse({ name: "Karim Traders", customerType: "RETAIL" }).success).toBe(true);
  });

  it("accepts a full payload", () => {
    expect(
      schema.safeParse({
        name: "Karim Traders",
        phone: "01700000000",
        email: "karim@example.com",
        address: "Dhanmondi",
        customerType: "WHOLESALE",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({ customerType: "RETAIL" }).success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ name: "A", customerType: "RETAIL" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(schema.safeParse({ name: "Karim", email: "not-an-email", customerType: "RETAIL" }).success).toBe(false);
  });

  it("accepts an empty-string email (optional)", () => {
    expect(schema.safeParse({ name: "Karim", email: "", customerType: "RETAIL" }).success).toBe(true);
  });
});

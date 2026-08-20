import { describe, expect, it } from "vitest";

import { createLoginSchema } from "./login.schema";

const schema = createLoginSchema({
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  passwordRequired: "Password is required.",
});

describe("login schema", () => {
  it("accepts a valid payload", () => {
    const result = schema.safeParse({
      email: "owner@company.test",
      password: "secret123",
      loginType: "company",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = schema.safeParse({
      email: "not-an-email",
      password: "secret123",
      loginType: "company",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = schema.safeParse({
      email: "owner@company.test",
      password: "",
      loginType: "staff",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown loginType", () => {
    const result = schema.safeParse({
      email: "owner@company.test",
      password: "secret123",
      loginType: "admin",
    });

    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { createIndustrySchema } from "./industry.schema";

const messages = {
  codeRequired: "code-required",
  codeLength: "code-length",
  codePattern: "code-pattern",
  nameRequired: "name-required",
  nameLength: "name-length",
  descriptionLength: "description-length",
};

const schema = createIndustrySchema(messages);

describe("createIndustrySchema", () => {
  it("accepts a valid payload with description", () => {
    const result = schema.safeParse({
      code: "RESTAURANT",
      name: "Restaurant",
      description: "Food service businesses",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid payload without description (optional)", () => {
    const result = schema.safeParse({ code: "RETAIL", name: "Retail" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty-string description", () => {
    const result = schema.safeParse({ code: "RETAIL", name: "Retail", description: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing code", () => {
    const result = schema.safeParse({ name: "Retail" });
    expect(result.success).toBe(false);
  });

  it("rejects a code shorter than 2 characters", () => {
    const result = schema.safeParse({ code: "A", name: "Retail" });
    expect(result.success).toBe(false);
  });

  it("rejects a code longer than 50 characters", () => {
    const result = schema.safeParse({ code: "A".repeat(51), name: "Retail" });
    expect(result.success).toBe(false);
  });

  it("rejects a code with lowercase letters", () => {
    const result = schema.safeParse({ code: "retail", name: "Retail" });
    expect(result.success).toBe(false);
  });

  it("rejects a code with disallowed characters", () => {
    const result = schema.safeParse({ code: "RETAIL!", name: "Retail" });
    expect(result.success).toBe(false);
  });

  it("accepts a code with underscore and hyphen", () => {
    const result = schema.safeParse({ code: "RETAIL_SHOP-2", name: "Retail" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = schema.safeParse({ code: "RETAIL" });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = schema.safeParse({ code: "RETAIL", name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 120 characters", () => {
    const result = schema.safeParse({ code: "RETAIL", name: "A".repeat(121) });
    expect(result.success).toBe(false);
  });

  it("rejects a description longer than 2000 characters", () => {
    const result = schema.safeParse({
      code: "RETAIL",
      name: "Retail",
      description: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

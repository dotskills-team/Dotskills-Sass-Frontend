import { describe, expect, it } from "vitest";

import { createUnitSchema } from "./unit.schema";

const messages = {
  nameRequired: "name-required",
  nameLength: "name-length",
  codeRequired: "code-required",
  codeLength: "code-length",
  conversionFactorPositive: "conversion-factor-positive",
};

const schema = createUnitSchema(messages);

describe("createUnitSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = schema.safeParse({ name: "Piece", code: "PCS" });
    expect(result.success).toBe(true);
  });

  it("accepts a full payload with baseUnitId and conversionFactor", () => {
    const result = schema.safeParse({
      name: "Dozen",
      code: "DZN",
      baseUnitId: "11111111-1111-1111-1111-111111111111",
      conversionFactor: "12",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = schema.safeParse({ code: "PCS" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    const result = schema.safeParse({ name: "A".repeat(61), code: "PCS" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing code", () => {
    const result = schema.safeParse({ name: "Piece" });
    expect(result.success).toBe(false);
  });

  it("rejects a code longer than 20 characters", () => {
    const result = schema.safeParse({ name: "Piece", code: "A".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("rejects a zero conversionFactor", () => {
    const result = schema.safeParse({ name: "Piece", code: "PCS", conversionFactor: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative conversionFactor", () => {
    const result = schema.safeParse({ name: "Piece", code: "PCS", conversionFactor: "-5" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty-string conversionFactor (optional)", () => {
    const result = schema.safeParse({ name: "Piece", code: "PCS", conversionFactor: "" });
    expect(result.success).toBe(true);
  });
});

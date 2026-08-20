import { describe, expect, it } from "vitest";

import { createFeatureSchema } from "./feature.schema";

const messages = {
  nameRequired: "name-required",
  nameLength: "name-length",
  codeRequired: "code-required",
  codeLength: "code-length",
  moduleRequired: "module-required",
  moduleLength: "module-length",
  descriptionLength: "description-length",
};

const schema = createFeatureSchema(messages);

describe("createFeatureSchema", () => {
  it("accepts a valid payload", () => {
    expect(
      schema.safeParse({ name: "Point of Sale", code: "POS", module: "SALES", description: "desc" })
        .success,
    ).toBe(true);
  });

  it("accepts a payload without description", () => {
    expect(schema.safeParse({ name: "Point of Sale", code: "POS", module: "SALES" }).success).toBe(
      true,
    );
  });

  it("accepts lowercase code/module (backend normalizes, no client pattern)", () => {
    expect(schema.safeParse({ name: "Point of Sale", code: "pos", module: "sales" }).success).toBe(
      true,
    );
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({ code: "POS", module: "SALES" }).success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ name: "A", code: "POS", module: "SALES" }).success).toBe(false);
  });

  it("rejects a code shorter than 2 characters", () => {
    expect(schema.safeParse({ name: "POS", code: "P", module: "SALES" }).success).toBe(false);
  });

  it("rejects a code longer than 80 characters", () => {
    expect(schema.safeParse({ name: "POS", code: "A".repeat(81), module: "SALES" }).success).toBe(
      false,
    );
  });

  it("rejects a missing module", () => {
    expect(schema.safeParse({ name: "POS", code: "POS" }).success).toBe(false);
  });

  it("rejects a description longer than 5000 characters", () => {
    expect(
      schema.safeParse({ name: "POS", code: "POS", module: "SALES", description: "A".repeat(5001) })
        .success,
    ).toBe(false);
  });
});

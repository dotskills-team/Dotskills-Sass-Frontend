import { describe, expect, it } from "vitest";

import { createPlanSchema } from "./plan.schema";

const messages = {
  codeRequired: "code-required",
  codeLength: "code-length",
  nameRequired: "name-required",
  nameLength: "name-length",
  descriptionLength: "description-length",
  trialDaysRange: "trial-days-range",
};

const schema = createPlanSchema(messages);

const base = { code: "PRO", name: "Professional", description: "", trialDays: "0", isPublic: "true" };

describe("createPlanSchema", () => {
  it("accepts a valid payload", () => {
    expect(schema.safeParse(base).success).toBe(true);
  });

  it("accepts an empty trialDays (treated as unset)", () => {
    expect(schema.safeParse({ ...base, trialDays: "" }).success).toBe(true);
  });

  it("rejects a missing code", () => {
    expect(schema.safeParse({ name: base.name, description: base.description, trialDays: base.trialDays, isPublic: base.isPublic }).success).toBe(false);
  });

  it("rejects a code shorter than 2 characters", () => {
    expect(schema.safeParse({ ...base, code: "A" }).success).toBe(false);
  });

  it("rejects a code longer than 50 characters", () => {
    expect(schema.safeParse({ ...base, code: "A".repeat(51) }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({ code: base.code, description: base.description, trialDays: base.trialDays, isPublic: base.isPublic }).success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ ...base, name: "A" }).success).toBe(false);
  });

  it("rejects a description longer than 2000 characters", () => {
    expect(schema.safeParse({ ...base, description: "A".repeat(2001) }).success).toBe(false);
  });

  it("rejects a negative trialDays", () => {
    expect(schema.safeParse({ ...base, trialDays: "-1" }).success).toBe(false);
  });

  it("rejects trialDays above 365", () => {
    expect(schema.safeParse({ ...base, trialDays: "366" }).success).toBe(false);
  });

  it("rejects a non-integer trialDays", () => {
    expect(schema.safeParse({ ...base, trialDays: "1.5" }).success).toBe(false);
  });

  it("rejects an invalid isPublic value", () => {
    expect(schema.safeParse({ ...base, isPublic: "yes" }).success).toBe(false);
  });
});

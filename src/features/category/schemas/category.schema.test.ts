import { describe, expect, it } from "vitest";

import { createCategorySchema } from "./category.schema";

const messages = { nameRequired: "name-required", nameLength: "name-length" };
const schema = createCategorySchema(messages);

describe("createCategorySchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(schema.safeParse({ name: "Beverages" }).success).toBe(true);
  });

  it("accepts a payload with parentCategoryId", () => {
    expect(
      schema.safeParse({ name: "Soft Drinks", parentCategoryId: "11111111-1111-1111-1111-111111111111" }).success,
    ).toBe(true);
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({}).success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("rejects a name longer than 120 characters", () => {
    expect(schema.safeParse({ name: "A".repeat(121) }).success).toBe(false);
  });
});

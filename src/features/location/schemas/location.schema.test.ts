import { describe, expect, it } from "vitest";

import { createLocationSchema } from "./location.schema";

const messages = {
  nameRequired: "name-required",
  nameLength: "name-length",
  locationTypeRequired: "location-type-required",
};
const schema = createLocationSchema(messages);

describe("createLocationSchema", () => {
  it("accepts a valid payload", () => {
    expect(
      schema.safeParse({ name: "Dhanmondi Branch", locationType: "BRANCH", address: "", isSalesEnabled: true })
        .success,
    ).toBe(true);
  });

  it("accepts WAREHOUSE type", () => {
    expect(
      schema.safeParse({ name: "Central Warehouse", locationType: "WAREHOUSE", isSalesEnabled: false }).success,
    ).toBe(true);
  });

  it("rejects a missing name", () => {
    expect(schema.safeParse({ locationType: "BRANCH", isSalesEnabled: true }).success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(schema.safeParse({ name: "A", locationType: "BRANCH", isSalesEnabled: true }).success).toBe(false);
  });

  it("rejects an invalid locationType", () => {
    expect(schema.safeParse({ name: "Main", locationType: "STORE", isSalesEnabled: true }).success).toBe(false);
  });

  it("rejects a missing locationType", () => {
    expect(schema.safeParse({ name: "Main", isSalesEnabled: true }).success).toBe(false);
  });
});

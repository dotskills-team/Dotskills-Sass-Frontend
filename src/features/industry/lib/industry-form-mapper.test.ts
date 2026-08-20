import { describe, expect, it } from "vitest";

import { toIndustryPayload } from "./industry-form-mapper";

describe("toIndustryPayload", () => {
  it("trims code and name", () => {
    expect(toIndustryPayload({ code: "  RETAIL  ", name: "  Retail  ", description: "" })).toEqual({
      code: "RETAIL",
      name: "Retail",
      description: undefined,
    });
  });

  it("maps a trimmed non-empty description", () => {
    expect(
      toIndustryPayload({ code: "RETAIL", name: "Retail", description: "  Shops  " }),
    ).toEqual({
      code: "RETAIL",
      name: "Retail",
      description: "Shops",
    });
  });

  it("maps an empty-string description to undefined", () => {
    expect(toIndustryPayload({ code: "RETAIL", name: "Retail", description: "" })).toEqual({
      code: "RETAIL",
      name: "Retail",
      description: undefined,
    });
  });

  it("maps a whitespace-only description to undefined", () => {
    expect(toIndustryPayload({ code: "RETAIL", name: "Retail", description: "   " })).toEqual({
      code: "RETAIL",
      name: "Retail",
      description: undefined,
    });
  });

  it("maps an undefined description to undefined", () => {
    expect(toIndustryPayload({ code: "RETAIL", name: "Retail" })).toEqual({
      code: "RETAIL",
      name: "Retail",
      description: undefined,
    });
  });

  it("this same mapper produces the payload used for both create and update mutations", () => {
    const values = { code: "RETAIL", name: "Retail", description: "Shops" };
    const createPayload = toIndustryPayload(values);
    const updatePayload = { id: "abc-123", ...toIndustryPayload(values) };

    expect(createPayload).toEqual({ code: "RETAIL", name: "Retail", description: "Shops" });
    expect(updatePayload).toEqual({ id: "abc-123", code: "RETAIL", name: "Retail", description: "Shops" });
  });
});

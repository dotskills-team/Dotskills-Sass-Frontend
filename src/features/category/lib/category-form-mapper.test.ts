import { describe, expect, it } from "vitest";

import { toCategoryPayload } from "./category-form-mapper";

describe("toCategoryPayload", () => {
  it("trims name and omits empty parentCategoryId", () => {
    expect(toCategoryPayload({ name: "  Beverages  ", parentCategoryId: "" })).toEqual({
      name: "Beverages",
      parentCategoryId: undefined,
    });
  });

  it("keeps a supplied parentCategoryId", () => {
    expect(
      toCategoryPayload({ name: "Soft Drinks", parentCategoryId: "11111111-1111-1111-1111-111111111111" }),
    ).toEqual({ name: "Soft Drinks", parentCategoryId: "11111111-1111-1111-1111-111111111111" });
  });
});

import { describe, expect, it } from "vitest";

import { toFeaturePayload } from "./feature-form-mapper";

describe("toFeaturePayload", () => {
  it("trims name, code, module", () => {
    expect(
      toFeaturePayload({ name: "  POS  ", code: "  pos  ", module: "  sales  ", description: "" }),
    ).toEqual({ name: "POS", code: "pos", module: "sales", description: undefined });
  });

  it("maps a trimmed non-empty description", () => {
    expect(
      toFeaturePayload({ name: "POS", code: "POS", module: "SALES", description: "  Point of sale  " }),
    ).toEqual({ name: "POS", code: "POS", module: "SALES", description: "Point of sale" });
  });

  it("maps an empty-string description to undefined", () => {
    expect(toFeaturePayload({ name: "POS", code: "POS", module: "SALES", description: "" })).toEqual({
      name: "POS",
      code: "POS",
      module: "SALES",
      description: undefined,
    });
  });

  it("maps an undefined description to undefined", () => {
    expect(toFeaturePayload({ name: "POS", code: "POS", module: "SALES" })).toEqual({
      name: "POS",
      code: "POS",
      module: "SALES",
      description: undefined,
    });
  });

  it("the same mapper produces the payload used for both create and update mutations", () => {
    const values = { name: "POS", code: "POS", module: "SALES", description: "desc" };
    const createPayload = toFeaturePayload(values);
    const updatePayload = { id: "abc-123", ...toFeaturePayload(values) };

    expect(createPayload).toEqual({ name: "POS", code: "POS", module: "SALES", description: "desc" });
    expect(updatePayload).toEqual({
      id: "abc-123",
      name: "POS",
      code: "POS",
      module: "SALES",
      description: "desc",
    });
  });
});

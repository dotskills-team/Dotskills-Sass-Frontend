import { describe, expect, it } from "vitest";

import { toUnitPayload } from "./unit-form-mapper";

describe("toUnitPayload", () => {
  it("trims name/code and omits empty baseUnitId/conversionFactor", () => {
    const payload = toUnitPayload({ name: "  Piece  ", code: "  PCS  ", baseUnitId: "", conversionFactor: "" });
    expect(payload).toEqual({ name: "Piece", code: "PCS", baseUnitId: undefined, conversionFactor: undefined });
  });

  it("keeps baseUnitId and converts conversionFactor to a number", () => {
    const payload = toUnitPayload({
      name: "Dozen",
      code: "DZN",
      baseUnitId: "11111111-1111-1111-1111-111111111111",
      conversionFactor: "12",
    });
    expect(payload).toEqual({
      name: "Dozen",
      code: "DZN",
      baseUnitId: "11111111-1111-1111-1111-111111111111",
      conversionFactor: 12,
    });
  });
});

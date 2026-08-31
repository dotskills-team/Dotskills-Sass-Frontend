import { describe, expect, it } from "vitest";

import { toLocationPayload } from "./location-form-mapper";

describe("toLocationPayload", () => {
  it("trims name/address and omits an empty address", () => {
    expect(
      toLocationPayload({ name: "  Dhanmondi  ", locationType: "BRANCH", address: "  ", isSalesEnabled: true }),
    ).toEqual({ name: "Dhanmondi", locationType: "BRANCH", address: undefined, isSalesEnabled: true });
  });

  it("keeps a supplied address", () => {
    expect(
      toLocationPayload({ name: "Warehouse", locationType: "WAREHOUSE", address: "123 Main St", isSalesEnabled: false }),
    ).toEqual({ name: "Warehouse", locationType: "WAREHOUSE", address: "123 Main St", isSalesEnabled: false });
  });
});

import { describe, expect, it } from "vitest";

import { toPlanPayload } from "./plan-form-mapper";
import type { PlanFormValues } from "@/features/plan/schemas/plan.schema";

const base: PlanFormValues = {
  code: "PRO",
  name: "Professional",
  description: "",
  trialDays: "0",
  isPublic: "true",
};

describe("toPlanPayload", () => {
  it("trims code and name", () => {
    expect(toPlanPayload({ ...base, code: "  PRO  ", name: "  Professional  " })).toEqual({
      code: "PRO",
      name: "Professional",
      description: undefined,
      trialDays: 0,
      isPublic: true,
    });
  });

  it("maps an empty trialDays to 0", () => {
    expect(toPlanPayload({ ...base, trialDays: "" }).trialDays).toBe(0);
  });

  it("maps a numeric trialDays string to a number", () => {
    expect(toPlanPayload({ ...base, trialDays: "14" }).trialDays).toBe(14);
  });

  it("maps isPublic 'false' to boolean false", () => {
    expect(toPlanPayload({ ...base, isPublic: "false" }).isPublic).toBe(false);
  });

  it("maps an empty-string description to undefined", () => {
    expect(toPlanPayload({ ...base, description: "" }).description).toBeUndefined();
  });

  it("maps a trimmed non-empty description", () => {
    expect(toPlanPayload({ ...base, description: "  desc  " }).description).toBe("desc");
  });

  it("the same mapper produces the payload used for both create and update mutations", () => {
    const createPayload = toPlanPayload(base);
    const updatePayload = { id: "abc-123", ...toPlanPayload(base) };

    expect(createPayload).toEqual({
      code: "PRO",
      name: "Professional",
      description: undefined,
      trialDays: 0,
      isPublic: true,
    });
    expect(updatePayload.id).toBe("abc-123");
  });
});

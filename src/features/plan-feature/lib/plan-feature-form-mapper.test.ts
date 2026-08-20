import { describe, expect, it } from "vitest";

import {
  parseLimitsJson,
  toAssignPlanFeaturePayload,
  toUpdatePlanFeaturePayload,
} from "./plan-feature-form-mapper";

describe("parseLimitsJson", () => {
  it("treats an empty string as no limits", () => {
    expect(parseLimitsJson("")).toEqual({ ok: true, value: undefined });
  });

  it("treats a whitespace-only string as no limits", () => {
    expect(parseLimitsJson("   ")).toEqual({ ok: true, value: undefined });
  });

  it("parses valid JSON", () => {
    expect(parseLimitsJson('{"maxUsers": 5}')).toEqual({ ok: true, value: { maxUsers: 5 } });
  });

  it("rejects invalid JSON", () => {
    expect(parseLimitsJson("{maxUsers: 5}")).toEqual({ ok: false });
  });
});

describe("toAssignPlanFeaturePayload", () => {
  it("maps featureId and enabled from form values, and passes through parsed limits", () => {
    expect(
      toAssignPlanFeaturePayload({ featureId: "feat-1", enabled: "true" }, { maxUsers: 5 }),
    ).toEqual({ featureId: "feat-1", enabled: true, limits: { maxUsers: 5 } });
  });

  it("maps enabled 'false' to boolean false", () => {
    expect(toAssignPlanFeaturePayload({ featureId: "feat-1", enabled: "false" }, undefined)).toEqual({
      featureId: "feat-1",
      enabled: false,
      limits: undefined,
    });
  });
});

describe("toUpdatePlanFeaturePayload", () => {
  it("maps enabled and passes through parsed limits, without featureId", () => {
    expect(toUpdatePlanFeaturePayload({ enabled: "true" }, { maxUsers: 10 })).toEqual({
      enabled: true,
      limits: { maxUsers: 10 },
    });
  });
});

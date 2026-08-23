import { describe, expect, it } from "vitest";

import {
  buildConfigDefaults,
  formatLimitsSummary,
  limitsToConfigValues,
  limitsToRows,
  rowsToLimits,
  toAssignPlanFeaturePayload,
  toUpdatePlanFeaturePayload,
} from "./plan-feature-form-mapper";
import type { FeatureConfigField } from "@/types/platform";

describe("limitsToRows", () => {
  it("returns an empty array for null/undefined limits", () => {
    expect(limitsToRows(null)).toEqual([]);
    expect(limitsToRows(undefined)).toEqual([]);
  });

  it("converts each entry to a typed row", () => {
    expect(limitsToRows({ maxUsers: 5, isTrial: true, region: "APAC" })).toEqual([
      { key: "maxUsers", type: "number", value: "5" },
      { key: "isTrial", type: "boolean", value: "true" },
      { key: "region", type: "string", value: "APAC" },
    ]);
  });
});

describe("rowsToLimits", () => {
  it("returns undefined when there are no rows with a non-empty key", () => {
    expect(rowsToLimits([])).toBeUndefined();
    expect(rowsToLimits([{ key: "  ", type: "string", value: "x" }])).toBeUndefined();
  });

  it("coerces values by declared type", () => {
    expect(
      rowsToLimits([
        { key: "maxUsers", type: "number", value: "5" },
        { key: "isTrial", type: "boolean", value: "true" },
        { key: "region", type: "string", value: "APAC" },
      ]),
    ).toEqual({ maxUsers: 5, isTrial: true, region: "APAC" });
  });

  it("falls back to 0 for a non-numeric number value", () => {
    expect(rowsToLimits([{ key: "maxUsers", type: "number", value: "not-a-number" }])).toEqual({
      maxUsers: 0,
    });
  });

  it("trims keys and drops empty-key rows", () => {
    expect(
      rowsToLimits([
        { key: "  maxUsers ", type: "number", value: "5" },
        { key: "", type: "string", value: "ignored" },
      ]),
    ).toEqual({ maxUsers: 5 });
  });
});

describe("toAssignPlanFeaturePayload", () => {
  it("builds the assign payload from typed args", () => {
    expect(toAssignPlanFeaturePayload("feat-1", true, { maxUsers: 5 })).toEqual({
      featureId: "feat-1",
      enabled: true,
      limits: { maxUsers: 5 },
    });
  });
});

describe("toUpdatePlanFeaturePayload", () => {
  it("builds the update payload from typed args", () => {
    expect(toUpdatePlanFeaturePayload(false, undefined)).toEqual({ enabled: false, limits: undefined });
  });
});

const USER_MANAGEMENT_SCHEMA: FeatureConfigField[] = [
  { key: "maxUsers", label: "Maximum Users", type: "NUMBER", required: true, defaultValue: 5, min: 1, max: 100 },
  { key: "allowImport", label: "Allow Import", type: "BOOLEAN", defaultValue: false },
  {
    key: "tier",
    label: "Tier",
    type: "SELECT",
    options: [
      { value: "basic", label: "Basic" },
      { value: "pro", label: "Pro" },
    ],
  },
];

describe("buildConfigDefaults", () => {
  it("uses each field's defaultValue when present", () => {
    expect(buildConfigDefaults(USER_MANAGEMENT_SCHEMA)).toEqual({ maxUsers: 5, allowImport: false });
  });

  it("defaults MULTI_SELECT fields to an empty array", () => {
    const schema: FeatureConfigField[] = [{ key: "tags", label: "Tags", type: "MULTI_SELECT" }];
    expect(buildConfigDefaults(schema)).toEqual({ tags: [] });
  });
});

describe("limitsToConfigValues", () => {
  it("backfills missing keys from schema defaults", () => {
    expect(limitsToConfigValues(USER_MANAGEMENT_SCHEMA, { maxUsers: 25 })).toEqual({
      maxUsers: 25,
      allowImport: false,
    });
  });

  it("returns schema defaults when limits is null", () => {
    expect(limitsToConfigValues(USER_MANAGEMENT_SCHEMA, null)).toEqual({ maxUsers: 5, allowImport: false });
  });
});

describe("formatLimitsSummary", () => {
  it("returns null for empty or missing limits", () => {
    expect(formatLimitsSummary(null, null, { yes: "Yes", no: "No" })).toBeNull();
    expect(formatLimitsSummary({}, null, { yes: "Yes", no: "No" })).toBeNull();
  });

  it("falls back to key: value pairs when there is no schema", () => {
    expect(formatLimitsSummary({ maxUsers: 5, isTrial: true }, null, { yes: "Yes", no: "No" })).toBe(
      "maxUsers: 5, isTrial: Yes",
    );
  });

  it("uses field labels and option labels when a schema is present", () => {
    expect(
      formatLimitsSummary({ maxUsers: 25, allowImport: true, tier: "pro" }, USER_MANAGEMENT_SCHEMA, {
        yes: "Yes",
        no: "No",
      }),
    ).toBe("Maximum Users: 25 • Allow Import: Yes • Tier: Pro");
  });
});

import { describe, expect, it } from "vitest";

import { resolvePresetRange } from "./date-presets";

describe("resolvePresetRange", () => {
  it("returns the same date for both dateFrom/dateTo for 'today'", () => {
    const result = resolvePresetRange("today");
    expect(result).not.toBeNull();
    expect(result!.dateFrom).toBe(result!.dateTo);
  });

  it("returns a 7-day span for 'last7Days' (inclusive of today)", () => {
    const result = resolvePresetRange("last7Days")!;
    const from = new Date(result.dateFrom);
    const to = new Date(result.dateTo);
    const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(6);
  });

  it("returns the first day of the current month for 'thisMonth'", () => {
    const result = resolvePresetRange("thisMonth")!;
    expect(result.dateFrom.endsWith("-01")).toBe(true);
  });

  it("returns a range fully within the previous calendar month for 'lastMonth'", () => {
    const result = resolvePresetRange("lastMonth")!;
    const from = new Date(result.dateFrom);
    const to = new Date(result.dateTo);
    expect(from.getUTCMonth()).toBe(to.getUTCMonth());
    expect(from.getUTCDate()).toBe(1);
  });

  it("returns null for 'custom' (caller keeps whatever dates are already selected)", () => {
    expect(resolvePresetRange("custom")).toBeNull();
  });
});

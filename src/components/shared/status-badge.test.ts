import { describe, expect, it } from "vitest";

import { getStatusTone } from "./status-badge";

describe("getStatusTone", () => {
  it.each([
    ["LIVE", "success"],
    ["SUSPENDED", "warning"],
    ["CLOSED", "destructive"],
    ["READY", "info"],
    ["DRAFT", "muted"],
    ["ACTIVE", "success"],
    ["TRIALING", "info"],
    ["PAST_DUE", "warning"],
    ["GRACE", "warning"],
    ["CANCELLED", "destructive"],
    ["EXPIRED", "destructive"],
    ["PENDING", "muted"],
    ["PROCESSING", "info"],
    ["SUCCEEDED", "success"],
    ["FAILED", "destructive"],
    ["ISSUED", "info"],
    ["PAID", "success"],
    ["VOID", "destructive"],
  ])("maps %s to tone %s", (status, tone) => {
    expect(getStatusTone(status)).toBe(tone);
  });

  it("falls back to muted for an unknown status", () => {
    expect(getStatusTone("SOME_UNKNOWN_STATUS")).toBe("muted");
  });
});

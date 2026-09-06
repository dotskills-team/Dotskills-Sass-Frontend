import { describe, expect, it } from "vitest";

import { validateLogoFile } from "./company-logo-validation";

describe("validateLogoFile", () => {
  it("accepts a PNG under 2MB", () => {
    expect(validateLogoFile({ type: "image/png", size: 1024 })).toBeNull();
  });

  it("accepts a JPEG under 2MB", () => {
    expect(validateLogoFile({ type: "image/jpeg", size: 1024 })).toBeNull();
  });

  it("rejects a non-PNG/JPEG type", () => {
    expect(validateLogoFile({ type: "image/gif", size: 1024 })).toBe("invalidType");
  });

  it("rejects a file over 2MB", () => {
    expect(validateLogoFile({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toBe("tooLarge");
  });

  it("accepts a file exactly at the 2MB boundary", () => {
    expect(validateLogoFile({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
  });

  it("checks type before size — an oversized non-image file reports invalidType, not tooLarge", () => {
    expect(validateLogoFile({ type: "application/pdf", size: 2 * 1024 * 1024 + 1 })).toBe("invalidType");
  });
});

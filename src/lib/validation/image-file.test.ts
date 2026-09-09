import { describe, expect, it } from "vitest";

import { validateImageFile } from "./image-file";

describe("validateImageFile", () => {
  it("accepts a PNG under 2MB", () => {
    expect(validateImageFile({ type: "image/png", size: 1024 })).toBeNull();
  });

  it("accepts a JPEG under 2MB", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 1024 })).toBeNull();
  });

  it("rejects a non-PNG/JPEG type", () => {
    expect(validateImageFile({ type: "image/gif", size: 1024 })).toBe("invalidType");
  });

  it("rejects a file over 2MB", () => {
    expect(validateImageFile({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toBe("tooLarge");
  });

  it("accepts a file exactly at the 2MB boundary", () => {
    expect(validateImageFile({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
  });

  it("checks type before size — an oversized non-image file reports invalidType, not tooLarge", () => {
    expect(validateImageFile({ type: "application/pdf", size: 2 * 1024 * 1024 + 1 })).toBe("invalidType");
  });
});

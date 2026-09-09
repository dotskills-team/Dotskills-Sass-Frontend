const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export type ImageValidationError = "invalidType" | "tooLarge" | null;

/**
 * Extracted as a pure function so it has its own unit test — shared by
 * Company Logo upload and User Profile image upload (same PNG/JPEG,
 * 2MB rule on both, matching each feature's own server-side gate). The
 * server always re-validates independently regardless of this check —
 * this is purely a fail-fast UX check, never the only gate.
 */
export function validateImageFile(file: Pick<File, "type" | "size">): ImageValidationError {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "invalidType";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "tooLarge";
  return null;
}

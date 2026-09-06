const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg"];

export type LogoValidationError = "invalidType" | "tooLarge" | null;

/**
 * Extracted as a pure function (not inline in the component) so it has its
 * own unit test, matching this codebase's convention — the server always
 * re-validates independently (`ParseFilePipeBuilder` + `uploadLogo()`'s own
 * mimetype check), this is purely a fail-fast UX check.
 */
export function validateLogoFile(file: Pick<File, "type" | "size">): LogoValidationError {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) return "invalidType";
  if (file.size > MAX_LOGO_SIZE_BYTES) return "tooLarge";
  return null;
}

/**
 * Generic permission-check engine — Platform ও Company উভয় scope-এর জন্যই
 * ব্যবহারযোগ্য, যেহেতু backend উভয় ক্ষেত্রেই একটা flat permission-code
 * string[] হিসেবে কাজ করে (দেখুন docs/frontend/authentication.md)।
 *
 * এটা শুধুমাত্র UX control (show/hide/disable) — actual authorization
 * সবসময় backend করে; frontend permission bypass করলেও backend request
 * reject করবে।
 */
export function hasPermission(
  permissions: string[] | undefined,
  required: string,
): boolean {
  return !!permissions?.includes(required);
}

export function hasAnyPermission(
  permissions: string[] | undefined,
  required: string[],
): boolean {
  return required.some((code) => hasPermission(permissions, code));
}

export function hasAllPermissions(
  permissions: string[] | undefined,
  required: string[],
): boolean {
  return required.every((code) => hasPermission(permissions, code));
}

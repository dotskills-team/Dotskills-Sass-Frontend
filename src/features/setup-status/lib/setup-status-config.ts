import type { SetupCheckKey } from "@/types/setup-status";

/**
 * Which of the 5 backend checks are things the Owner can actually go do
 * right now (Location/Unit/Product — all reachable from `/company/setup`),
 * versus checks that depend entirely on a Platform Admin action
 * (Subscription activation, RBAC/permission bootstrap) and must never be
 * presented as something the Owner can click through themselves.
 *
 * Completion itself is never decided here — that stays 100% backend-driven
 * (`SetupCheckItem.completed`). This only controls how a pending item is
 * *presented* (actionable button vs. "waiting on Platform Admin" badge).
 */
export const PLATFORM_DEPENDENT_CHECKS: ReadonlySet<SetupCheckKey> = new Set([
  "SUBSCRIPTION",
  "RBAC",
]);

export function isPlatformDependentCheck(key: SetupCheckKey): boolean {
  return PLATFORM_DEPENDENT_CHECKS.has(key);
}

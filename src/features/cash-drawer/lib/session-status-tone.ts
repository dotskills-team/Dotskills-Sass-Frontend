import type { CashDrawerSessionStatus } from "@/types/cash-drawer-session";

/**
 * Deliberately NOT reusing the shared `STATUS_TONE` map
 * (`src/components/shared/status-badge.tsx`) — it already maps
 * `CLOSED -> "destructive"` for `Company.status`'s "permanently shut
 * down" meaning, a completely different concept from a CashDrawerSession
 * finishing an ordinary, successful shift. Reusing it verbatim would
 * render every normal closed shift in alarming red, violating the
 * "variance/status must read as neutral information" requirement.
 */
const SESSION_TONE_CLASS: Record<CashDrawerSessionStatus, string> = {
  OPEN: "bg-info/15 text-info border-info/30",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

export function getSessionStatusToneClass(status: CashDrawerSessionStatus): string {
  return SESSION_TONE_CLASS[status];
}

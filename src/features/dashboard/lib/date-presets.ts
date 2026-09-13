export type DatePreset = "today" | "yesterday" | "last7Days" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

/**
 * Everything below works in UTC calendar fields (`getUTC*`/`Date.UTC`)
 * consistently — never mixes a local-time constructor with
 * `toISOString()` (UTC-based), which would silently shift the computed
 * date by a day for any timezone offset that isn't exactly 0 (e.g. a
 * server running in Asia/Dhaka, UTC+6).
 */
function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/** Pure date math only — never decides business data, just the `dateFrom`/`dateTo` strings sent to the backend. */
export function resolvePresetRange(preset: DatePreset): { dateFrom: string; dateTo: string } | null {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const today = toDateInputValue(utcDate(year, month, day));

  switch (preset) {
    case "today":
      return { dateFrom: today, dateTo: today };
    case "yesterday": {
      const value = toDateInputValue(utcDate(year, month, day - 1));
      return { dateFrom: value, dateTo: value };
    }
    case "last7Days":
      return { dateFrom: toDateInputValue(utcDate(year, month, day - 6)), dateTo: today };
    case "thisMonth":
      return { dateFrom: toDateInputValue(utcDate(year, month, 1)), dateTo: today };
    case "lastMonth":
      return {
        dateFrom: toDateInputValue(utcDate(year, month - 1, 1)),
        dateTo: toDateInputValue(utcDate(year, month, 0)),
      };
    case "thisYear":
      return { dateFrom: toDateInputValue(utcDate(year, 0, 1)), dateTo: today };
    case "custom":
      return null;
    default:
      return null;
  }
}

export const DATE_PRESETS: DatePreset[] = [
  "today",
  "yesterday",
  "last7Days",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "custom",
];

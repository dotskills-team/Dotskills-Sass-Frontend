import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { bn, enUS } from "date-fns/locale";

import type { Locale } from "@/i18n/config";

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

const DATE_FNS_LOCALE: Record<Locale, typeof enUS> = { en: enUS, bn };

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = toDate(value);
  return isValid(date) ? format(date, "d MMM yyyy") : "—";
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = toDate(value);
  return isValid(date) ? format(date, "d MMM yyyy, h:mm a") : "—";
}

export function formatRelativeTime(value: string | Date | null | undefined, locale: Locale = "en"): string {
  if (!value) return "—";
  const date = toDate(value);
  return isValid(date)
    ? formatDistanceToNow(date, { addSuffix: true, locale: DATE_FNS_LOCALE[locale] })
    : "—";
}

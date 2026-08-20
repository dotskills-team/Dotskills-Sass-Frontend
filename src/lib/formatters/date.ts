import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

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

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = toDate(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

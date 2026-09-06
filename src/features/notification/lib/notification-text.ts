import type { useTranslations } from "next-intl";
import type { Notification } from "@/types/notification";

/**
 * STAFF_ACTIVITY's `metadata.action` is a stable code (e.g. "MEMBER_CREATED"),
 * not display text — matches this codebase's convention of never storing
 * pre-rendered UI strings server-side. Every other type's metadata fields
 * are already plain data (names, quantities, amounts) safe to interpolate
 * directly; `action` is the one field that itself needs its own translation
 * lookup first, same pattern as `t(\`entryType.${x}\`)` badges elsewhere.
 *
 * Shared by the dropdown list item and the notification detail dialog —
 * one implementation, so the two views can never drift apart.
 */
export function renderNotificationText(t: ReturnType<typeof useTranslations>, notification: Notification): string {
  if (notification.type === "STAFF_ACTIVITY") {
    const metadata = notification.metadata as { memberName: string; action: string };
    return t("types.STAFF_ACTIVITY", {
      memberName: metadata.memberName,
      action: t(`staffActions.${metadata.action}`),
    });
  }
  return t(`types.${notification.type}`, notification.metadata as Record<string, string | number>);
}

/** Short, generic per-type label (e.g. "Low Stock") — the mobile-notification-style bold title shown above `renderNotificationText`'s full sentence. */
export function getNotificationTitle(t: ReturnType<typeof useTranslations>, notification: Notification): string {
  return t(`titles.${notification.type}`);
}

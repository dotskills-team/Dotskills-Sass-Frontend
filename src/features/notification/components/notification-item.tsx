"use client";

import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatters/date";
import type { Locale } from "@/i18n/config";

import { NotificationIcon } from "@/features/notification/components/notification-icon";
import { getNotificationTitle, renderNotificationText } from "@/features/notification/lib/notification-text";
import type { Notification } from "@/types/notification";

/** One dropdown row — colored icon, bold-if-unread title, single-line message, relative timestamp, unread dot + subtle tint. */
export function NotificationItem({
  notification,
  onSelect,
}: {
  notification: Notification;
  onSelect: (notification: Notification) => void;
}) {
  const t = useTranslations("notifications");
  const locale = useLocale() as Locale;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <NotificationIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm",
              notification.isRead ? "font-normal text-muted-foreground" : "font-semibold text-foreground",
            )}
          >
            {getNotificationTitle(t, notification)}
          </p>
          {!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
        </div>
        <p className="truncate text-sm text-muted-foreground">{renderNotificationText(t, notification)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt, locale)}</p>
      </div>
    </button>
  );
}

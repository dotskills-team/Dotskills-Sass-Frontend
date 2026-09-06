"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeTime } from "@/lib/formatters/date";
import type { Locale } from "@/i18n/config";

import { NotificationIcon } from "@/features/notification/components/notification-icon";
import { getNotificationTitle, renderNotificationText } from "@/features/notification/lib/notification-text";
import type { Notification } from "@/types/notification";

/**
 * Replaces the earlier click-to-redirect behavior — clicking a notification
 * now only shows its full message here, no page navigation. The colored
 * icon + short title mirror the dropdown row (`NotificationItem`); the
 * existing `types.*` i18n templates still render the complete detail
 * sentence, reused as-is for `DialogDescription`. No footer — the default
 * DialogContent close (X) icon is enough, same as ProductStockDialog's own
 * read-only-detail precedent.
 */
export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
}: {
  notification: Notification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("notifications");
  const locale = useLocale() as Locale;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <NotificationIcon type={notification.type} />
            <DialogTitle>{getNotificationTitle(t, notification)}</DialogTitle>
          </div>
          <DialogDescription>{renderNotificationText(t, notification)}</DialogDescription>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt, locale)}</p>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellRing } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { cn } from "@/lib/utils";
import {
  useGetUnreadNotificationCountQuery,
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/features/notification/api/notification.api";
import { NotificationItem } from "@/features/notification/components/notification-item";
import { NotificationDetailDialog } from "@/features/notification/components/notification-detail-dialog";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { Notification } from "@/types/notification";

/**
 * Slots into the company layout's header, same pattern as
 * CashDrawerStatusIndicator — renders nothing without NOTIFICATION_READ
 * (Owner/Admin only this phase). No WebSocket — both the unread count and
 * the list poll every 15s via RTK Query's own `pollingInterval` (moved
 * together deliberately — polling only one would let the badge and the
 * dropdown's contents disagree), which is proportionate at this scale (a
 * handful of Owners/Admins per company) and needs no new infrastructure.
 * Clicking a notification only marks it read and shows its full message in
 * a dialog — no page navigation (the earlier click-to-redirect behavior
 * was removed).
 */
export function NotificationBell({ companyId }: { companyId: string | undefined }) {
  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.NOTIFICATION_READ}>
      <NotificationBellInner companyId={companyId} />
    </CompanyPermissionGate>
  );
}

function NotificationBellInner({ companyId }: { companyId: string | undefined }) {
  const t = useTranslations("notifications");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [justArrived, setJustArrived] = useState(false);
  const previousCountRef = useRef<number | undefined>(undefined);

  const { data: unreadCount } = useGetUnreadNotificationCountQuery(companyId ?? "", {
    skip: !companyId,
    pollingInterval: 15_000,
  });
  const { data: notifications, isLoading, isError } = useListNotificationsQuery(
    { companyId: companyId ?? "", limit: 10 },
    { skip: !companyId, pollingInterval: 15_000 },
  );
  const [markRead] = useMarkNotificationReadMutation();

  const count = unreadCount ?? 0;

  // Mobile-style "just arrived" cue: a brief bounce the moment a poll tick
  // reports a HIGHER unread count than the previous tick — never on first
  // mount (previousCountRef starts undefined) and never on a decrease
  // (marking something read).
  useEffect(() => {
    if (unreadCount === undefined) return;
    if (previousCountRef.current !== undefined && unreadCount > previousCountRef.current) {
      setJustArrived(true);
      const timeout = setTimeout(() => setJustArrived(false), 1000);
      previousCountRef.current = unreadCount;
      return () => clearTimeout(timeout);
    }
    previousCountRef.current = unreadCount;
  }, [unreadCount]);

  async function handleSelect(notification: Notification) {
    if (!companyId) return;
    if (!notification.isRead) {
      await markRead({ companyId, id: notification.id });
    }
    setSelectedNotification(notification);
  }

  async function handleMarkAllRead() {
    if (!companyId || !notifications) return;
    const unread = notifications.items.filter((notification) => !notification.isRead);
    await Promise.all(unread.map((notification) => markRead({ companyId, id: notification.id })));
  }

  const BellGlyph = count > 0 ? BellRing : Bell;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label={t("title")}>
            <BellGlyph className={cn("size-5", justArrived && "animate-bounce")} aria-hidden="true" />
            {count > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] tabular-nums"
              >
                {count > 99 ? "99+" : count}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-medium">{t("title")}</span>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">…</p>
            ) : isError ? (
              <p className="p-4 text-sm text-destructive">{t("loadError")}</p>
            ) : !notifications || notifications.items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              notifications.items.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onSelect={handleSelect} />
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedNotification && (
        <NotificationDetailDialog
          notification={selectedNotification}
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
        />
      )}
    </>
  );
}

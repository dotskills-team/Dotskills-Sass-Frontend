"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import {
  useGetUnreadNotificationCountQuery,
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/features/notification/api/notification.api";
import { resolveNotificationTarget } from "@/features/notification/lib/notification-redirect";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { Notification } from "@/types/notification";

/**
 * Slots into the company layout's header, same pattern as
 * CashDrawerStatusIndicator — renders nothing without NOTIFICATION_READ
 * (Owner/Admin only this phase). No WebSocket — the unread count polls
 * every 60s via RTK Query's own `pollingInterval`, which is proportionate
 * at this scale (see the plan's Q4) and needs no new infrastructure.
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
  const router = useRouter();

  const { data: unreadCount } = useGetUnreadNotificationCountQuery(companyId ?? "", {
    skip: !companyId,
    pollingInterval: 60_000,
  });
  const { data: notifications, isLoading, isError } = useListNotificationsQuery(
    { companyId: companyId ?? "", limit: 10 },
    { skip: !companyId },
  );
  const [markRead] = useMarkNotificationReadMutation();

  async function handleSelect(notification: Notification) {
    if (!companyId) return;
    if (!notification.isRead) {
      await markRead({ companyId, id: notification.id });
    }
    router.push(resolveNotificationTarget(notification));
  }

  const count = unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label={t("title")}>
          <Bell className="size-5" aria-hidden="true" />
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
        <div className="border-b border-border px-3 py-2 text-sm font-medium">{t("title")}</div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">…</p>
          ) : isError ? (
            <p className="p-4 text-sm text-destructive">{t("loadError")}</p>
          ) : !notifications || notifications.items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            notifications.items.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleSelect(notification)}
                className="flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-accent"
              >
                <span className={notification.isRead ? "text-muted-foreground" : "font-medium text-foreground"}>
                  {renderNotificationText(t, notification)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * STAFF_ACTIVITY's `metadata.action` is a stable code (e.g. "MEMBER_CREATED"),
 * not display text — matches this codebase's convention of never storing
 * pre-rendered UI strings server-side. Every other type's metadata fields
 * are already plain data (names, quantities, amounts) safe to interpolate
 * directly; `action` is the one field that itself needs its own translation
 * lookup first, same pattern as `t(\`entryType.${x}\`)` badges elsewhere.
 */
function renderNotificationText(t: ReturnType<typeof useTranslations>, notification: Notification): string {
  if (notification.type === "STAFF_ACTIVITY") {
    const metadata = notification.metadata as { memberName: string; action: string };
    return t("types.STAFF_ACTIVITY", {
      memberName: metadata.memberName,
      action: t(`staffActions.${metadata.action}`),
    });
  }
  return t(`types.${notification.type}`, notification.metadata as Record<string, string | number>);
}

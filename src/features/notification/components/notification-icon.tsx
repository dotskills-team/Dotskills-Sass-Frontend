import { TONE_CLASS } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

import { NOTIFICATION_ICON, getNotificationTone } from "@/features/notification/lib/notification-tone";
import type { NotificationType } from "@/types/notification";

/** Small colored circular icon badge, one per notification type — reuses the existing tone→class map (`TONE_CLASS`), never a hardcoded hex. */
export function NotificationIcon({ type }: { type: NotificationType }) {
  const tone = getNotificationTone(type);
  const Icon = NOTIFICATION_ICON[type];

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        TONE_CLASS[tone],
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

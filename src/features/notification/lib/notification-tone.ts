import {
  Banknote,
  CircleDollarSign,
  CircleX,
  CreditCard,
  HandCoins,
  PackageMinus,
  PackageX,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import type { Tone } from "@/components/shared/status-badge";
import type { NotificationType } from "@/types/notification";

/**
 * Only 4 semantic tones + `primary` exist in this design system (verified
 * against globals.css — no `purple` token) — SUPPLIER_PAYABLE_OVERDUE uses
 * `primary` (the brand indigo, higher chroma than `info`) rather than a
 * hardcoded hex. Tones repeat across type pairs (destructive×2, warning×3);
 * each pair stays visually distinct via its icon, same as StatusBadge
 * already mapping more statuses than tones.
 */
const NOTIFICATION_TONE: Record<NotificationType, Tone> = {
  OUT_OF_STOCK: "destructive",
  LOW_STOCK: "warning",
  CASH_DRAWER_VARIANCE: "warning",
  CUSTOMER_DUE_OVERDUE: "info",
  SUPPLIER_PAYABLE_OVERDUE: "primary",
  SUBSCRIPTION_EXPIRING_SOON: "warning",
  SUBSCRIPTION_PAST_DUE: "destructive",
  STAFF_ACTIVITY: "success",
};

/**
 * Exported as a plain map (not wrapped in a getter) so a consumer does
 * `NOTIFICATION_ICON[type]` — the same direct-property-access shape
 * `app-sidebar.tsx` already uses for `item.icon` — rather than a function
 * call returning a component, which the `react-hooks/static-components`
 * lint rule (correctly, in the general case) flags as "created during
 * render" even though this lookup is just picking a fixed component
 * reference out of a table. Reuses the exact icon already established for
 * the same concept in `nav-items.ts` wherever one exists (Cash Drawer/
 * Supplier Payments/Subscription/Team).
 */
export const NOTIFICATION_ICON: Record<NotificationType, LucideIcon> = {
  OUT_OF_STOCK: PackageX,
  LOW_STOCK: PackageMinus,
  CASH_DRAWER_VARIANCE: Banknote,
  CUSTOMER_DUE_OVERDUE: CircleDollarSign,
  SUPPLIER_PAYABLE_OVERDUE: HandCoins,
  SUBSCRIPTION_EXPIRING_SOON: CreditCard,
  SUBSCRIPTION_PAST_DUE: CircleX,
  STAFF_ACTIVITY: UserCog,
};

export function getNotificationTone(type: NotificationType): Tone {
  return NOTIFICATION_TONE[type];
}

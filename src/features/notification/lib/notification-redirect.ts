import type { Notification } from "@/types/notification";

/**
 * One fixed, explicit target per type (never a generic string template) —
 * matches the plan's own table exactly, so a typo in one type's route
 * can't silently mis-route another. Every target reuses an existing
 * page/endpoint; the deep-linking query params (`productId`, `customerId`,
 * `supplierId`, `memberId`) are read by that page via `useSearchParams()`.
 */
export function resolveNotificationTarget(notification: Notification): string {
  const { type, relatedEntityId, locationId } = notification;

  switch (type) {
    case "OUT_OF_STOCK":
    case "LOW_STOCK": {
      const params = new URLSearchParams({ productId: relatedEntityId });
      if (locationId) params.set("locationId", locationId);
      return `/company/reports/stock?${params.toString()}`;
    }
    case "CASH_DRAWER_VARIANCE":
      return `/company/cash-drawer/sessions/${relatedEntityId}`;
    case "CUSTOMER_DUE_OVERDUE":
      return `/company/customer-payments?customerId=${relatedEntityId}`;
    case "SUPPLIER_PAYABLE_OVERDUE":
      return `/company/supplier-payments?supplierId=${relatedEntityId}`;
    case "SUBSCRIPTION_EXPIRING_SOON":
    case "SUBSCRIPTION_PAST_DUE":
      return "/company/subscription";
    case "STAFF_ACTIVITY":
      return `/company/rbac/members?memberId=${relatedEntityId}`;
  }
}

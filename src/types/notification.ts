export type NotificationType =
  | "OUT_OF_STOCK"
  | "LOW_STOCK"
  | "CASH_DRAWER_VARIANCE"
  | "CUSTOMER_DUE_OVERDUE"
  | "SUPPLIER_PAYABLE_OVERDUE"
  | "SUBSCRIPTION_EXPIRING_SOON"
  | "SUBSCRIPTION_PAST_DUE"
  | "STAFF_ACTIVITY";

export type NotificationRelatedEntityType =
  | "PRODUCT"
  | "CASH_DRAWER_SESSION"
  | "CUSTOMER"
  | "SUPPLIER"
  | "SUBSCRIPTION"
  | "COMPANY_MEMBER";

/** `GET /companies/:companyId/notifications` item (verified backend `Notification` model). */
export interface Notification {
  id: string;
  type: NotificationType;
  relatedEntityType: NotificationRelatedEntityType;
  relatedEntityId: string;
  locationId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

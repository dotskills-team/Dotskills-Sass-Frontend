/**
 * Backend-এর src/common/constants/permission.constants.ts-এর সাথে exactly
 * mirror করা — string values invent করা হয়নি, এই session-এই backend
 * থেকে সরাসরি পড়ে verify করা হয়েছে। Platform ও Company scope আলাদা
 * object, কখনো একটার code অন্য scope-এ ব্যবহার করা উচিত না (তাই দুটো
 * আলাদা TypeScript union type — নিচে দেখুন)।
 *
 * নতুন backend permission যোগ হলে এই ফাইলটাও আপডেট করতে হবে — single
 * source of truth এই একটাই ফাইল, component-এ raw string ছড়ানো হবে না।
 */
export const PLATFORM_PERMISSIONS = {
  STAFF_READ: "platform.staff.read",
  STAFF_CREATE: "platform.staff.create",
  STAFF_UPDATE: "platform.staff.update",
  STAFF_STATUS: "platform.staff.status",
  STAFF_ROLE_ASSIGN: "platform.staff.role.assign",

  ROLE_READ: "platform.role.read",
  ROLE_CREATE: "platform.role.create",
  ROLE_UPDATE: "platform.role.update",
  ROLE_STATUS: "platform.role.status",
  ROLE_PERMISSION_ASSIGN: "platform.role.permission.assign",

  COMPANY_READ: "platform.company.read",
  COMPANY_CREATE: "platform.company.create",
  COMPANY_UPDATE: "platform.company.update",
  COMPANY_STATUS: "platform.company.status",
  COMPANY_ACTIVATE: "platform.company.activate",
  COMPANY_SUSPEND: "platform.company.suspend",

  COMPANY_OWNER_READ: "platform.company.owner.read",
  COMPANY_OWNER_CREATE: "platform.company.owner.create",
  COMPANY_OWNER_UPDATE: "platform.company.owner.update",
  COMPANY_OWNER_CHANGE: "platform.company.owner.change",
  COMPANY_OWNER_STATUS: "platform.company.owner.status",

  TENANT_CREATE: "platform.tenant.create",
  TENANT_READ: "platform.tenant.read",
  TENANT_UPDATE: "platform.tenant.update",
  TENANT_STATUS: "platform.tenant.status",
  TENANT_DELETE: "platform.tenant.delete",

  INDUSTRY_READ: "platform.industry.read",
  INDUSTRY_CREATE: "platform.industry.create",
  INDUSTRY_UPDATE: "platform.industry.update",
  INDUSTRY_STATUS: "platform.industry.status",
  INDUSTRY_ACTIVATE: "platform.industry.activate",
  INDUSTRY_DEACTIVATE: "platform.industry.deactivate",
  INDUSTRY_DELETE: "platform.industry.delete",

  COMPANY_RBAC_BOOTSTRAP: "company.rbac.bootstrap",

  PLAN_PRICING_CREATE: "plan.pricing.create",
  PLAN_PRICING_READ: "plan.pricing.read",
  PLAN_PRICING_UPDATE: "plan.pricing.update",
  PLAN_PRICING_STATUS: "plan.pricing.status",

  SUBSCRIPTION_CREATE: "subscription:create",
  SUBSCRIPTION_READ: "subscription:read",
  SUBSCRIPTION_AUTO_RENEW: "subscription:auto-renew",
  SUBSCRIPTION_UPDATE: "subscription:update",
  SUBSCRIPTION_CHANGE_PLAN: "subscription:change-plan",
  SUBSCRIPTION_CANCEL: "subscription:cancel",
  SUBSCRIPTION_RENEW: "subscription:renew",
  SUBSCRIPTION_SUSPEND: "subscription:suspend",
  SUBSCRIPTION_REACTIVATE: "subscription:reactivate",
  SUBSCRIPTION_EXPIRE: "subscription:expire",

  FEATURE_CREATE: "platform.feature.create",
  FEATURE_READ: "platform.feature.read",
  FEATURE_UPDATE: "platform.feature.update",
  FEATURE_STATUS: "platform.feature.status",
  FEATURE_ACTIVATE: "platform.feature.activate",
  FEATURE_DEACTIVATE: "platform.feature.deactivate",
  FEATURE_ARCHIVE: "platform.feature.archive",

  BILLING_READ: "billing.read",
  BILLING_PROCESS: "billing.process",
  BILLING_RETRY: "billing.retry",

  INVOICE_READ: "invoice.read",
  INVOICE_ISSUE: "invoice.issue",
  INVOICE_VOID: "invoice.void",

  PAYMENT_READ: "payment.read",
  PAYMENT_VERIFY: "payment.verify",
  PAYMENT_CANCEL: "payment.cancel",

  PLAN_READ: "platform.plan.read",
  PLAN_CREATE: "platform.plan.create",
  PLAN_UPDATE: "platform.plan.update",
  PLAN_STATUS: "platform.plan.status",
  PLAN_ARCHIVE: "platform.plan.archive",

  PLAN_FEATURE_READ: "platform.plan.feature.read",
  PLAN_FEATURE_ASSIGN: "platform.plan.feature.assign",
  PLAN_FEATURE_UPDATE: "platform.plan.feature.update",
  PLAN_FEATURE_REMOVE: "platform.plan.feature.remove",

  SETTINGS_READ: "platform.settings.read",
  SETTINGS_UPDATE: "platform.settings.update",
} as const;

export const COMPANY_PERMISSIONS = {
  RBAC_READ: "company.rbac.read",
  ROLE_CREATE: "company.role.create",
  ROLE_UPDATE: "company.role.update",
  ROLE_PERMISSION_ASSIGN: "company.role.permission.assign",

  MEMBER_READ: "company.member.read",
  MEMBER_CREATE: "company.member.create",
  MEMBER_UPDATE: "company.member.update",
  MEMBER_ROLE_ASSIGN: "company.member.role.assign",
  MEMBER_SCOPE_ASSIGN: "company.member.scope.assign",

  SUBSCRIPTION_READ: "company.subscription.read",
  SUBSCRIPTION_AUTO_RENEW: "company.subscription.auto-renew",
  SUBSCRIPTION_CHANGE_PLAN: "company.subscription.change-plan",
  SUBSCRIPTION_CANCEL: "company.subscription.cancel",
  SUBSCRIPTION_REACTIVATE: "company.subscription.reactivate",

  INVOICE_READ: "company.invoice.read",

  PAYMENT_CREATE: "company.payment.create",
  PAYMENT_READ: "company.payment.read",

  LOCATION_READ: "company.location.read",
  LOCATION_CREATE: "company.location.create",
  LOCATION_UPDATE: "company.location.update",

  CATEGORY_READ: "company.category.read",
  CATEGORY_CREATE: "company.category.create",
  CATEGORY_UPDATE: "company.category.update",

  UNIT_READ: "company.unit.read",
  UNIT_CREATE: "company.unit.create",
  UNIT_UPDATE: "company.unit.update",

  PRODUCT_READ: "company.product.read",
  PRODUCT_CREATE: "company.product.create",
  PRODUCT_UPDATE: "company.product.update",
  PRODUCT_BULK_IMPORT: "company.product.bulk-import",

  CUSTOMER_READ: "company.customer.read",
  CUSTOMER_CREATE: "company.customer.create",
  CUSTOMER_UPDATE: "company.customer.update",

  SUPPLIER_READ: "company.supplier.read",
  SUPPLIER_CREATE: "company.supplier.create",
  SUPPLIER_UPDATE: "company.supplier.update",

  SETTINGS_READ: "company.settings.read",
  SETTINGS_UPDATE: "company.settings.update",

  PURCHASE_ORDER_READ: "company.purchase-order.read",
  PURCHASE_ORDER_CREATE: "company.purchase-order.create",
  PURCHASE_ORDER_UPDATE: "company.purchase-order.update",
  PURCHASE_ORDER_CANCEL: "company.purchase-order.cancel",
  PURCHASE_ORDER_RECEIVE: "company.purchase-order.receive",

  PURCHASE_RETURN_READ: "company.purchase-return.read",
  PURCHASE_RETURN_CREATE: "company.purchase-return.create",

  STOCK_TRANSFER_READ: "company.stock-transfer.read",
  STOCK_TRANSFER_CREATE: "company.stock-transfer.create",
  STOCK_TRANSFER_DISPATCH: "company.stock-transfer.dispatch",
  STOCK_TRANSFER_RECEIVE: "company.stock-transfer.receive",

  SUPPLIER_PAYMENT_READ: "company.supplier-payment.read",
  SUPPLIER_PAYMENT_CREATE: "company.supplier-payment.create",

  SALE_READ: "company.sale.read",
  SALE_CREATE: "company.sale.create",
  SALE_VOID: "company.sale.void",

  SALE_RETURN_READ: "company.sale-return.read",
  SALE_RETURN_CREATE: "company.sale-return.create",

  CUSTOMER_PAYMENT_READ: "company.customer-payment.read",
  CUSTOMER_PAYMENT_CREATE: "company.customer-payment.create",

  REPORT_READ: "company.report.read",
  /** Separate from REPORT_READ — gates only the Profit Report (margin/profit is the one figure an Owner may want hidden from a Branch Manager), mirrored from backend `reporting.controller.ts`. */
  PROFIT_REPORT_READ: "company.profit-report.read",

  CASH_DRAWER_SESSION_READ: "company.cash-drawer-session.read",
  CASH_DRAWER_SESSION_OPEN: "company.cash-drawer-session.open",
  CASH_DRAWER_SESSION_CLOSE: "company.cash-drawer-session.close",

  /** Manual Stock Adjustment — damage/theft/count-mismatch/expiry/opening-stock corrections, Owner/Manager tier. */
  STOCK_ADJUSTMENT_READ: "company.stock-adjustment.read",
  STOCK_ADJUSTMENT_CREATE: "company.stock-adjustment.create",

  /** Dashboard Notification Bell — Owner/Admin only this phase. */
  NOTIFICATION_READ: "company.notification.read",
} as const;

export type PlatformPermissionCode =
  (typeof PLATFORM_PERMISSIONS)[keyof typeof PLATFORM_PERMISSIONS];

export type CompanyPermissionCode =
  (typeof COMPANY_PERMISSIONS)[keyof typeof COMPANY_PERMISSIONS];

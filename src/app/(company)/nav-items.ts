import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  FileText,
  Wallet,
  CreditCard,
  MapPin,
  Tags,
  Ruler,
  Package,
  UserRound,
  Truck,
  Settings,
  ClipboardList,
  ArrowLeftRight,
  ShoppingCart,
} from "lucide-react";

import type { NavItem } from "@/components/layout/app-sidebar";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export const companyNavItems: NavItem[] = [
  { labelKey: "dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  /**
   * `subscriptions` GET route (`current`/`all`/`:id`)-এ কোনো `@RequireCompanyPermissions`
   * decorator নেই — `CompanyPermissionsGuard` verified: no-decorator মানে যেকোনো active company
   * member access পায়। তাই এই nav item ungated (Dashboard-এর মতোই), backend contract-এর সাথে
   * exact match — invented restriction নয়।
   */
  { labelKey: "subscription", href: "/company/subscription", icon: CreditCard },
  {
    labelKey: "invoices",
    href: "/company/invoices",
    icon: FileText,
    companyPermission: COMPANY_PERMISSIONS.INVOICE_READ,
  },
  {
    labelKey: "payments",
    href: "/company/payments",
    icon: Wallet,
    companyPermission: COMPANY_PERMISSIONS.PAYMENT_READ,
  },
  {
    labelKey: "companyRoles",
    href: "/company/rbac/roles",
    icon: ShieldCheck,
    companyPermission: COMPANY_PERMISSIONS.RBAC_READ,
  },
  {
    labelKey: "companyMembers",
    href: "/company/rbac/members",
    icon: Users,
    companyPermission: COMPANY_PERMISSIONS.MEMBER_READ,
  },
  {
    labelKey: "locations",
    href: "/company/locations",
    icon: MapPin,
    companyPermission: COMPANY_PERMISSIONS.LOCATION_READ,
  },
  {
    labelKey: "categories",
    href: "/company/categories",
    icon: Tags,
    companyPermission: COMPANY_PERMISSIONS.CATEGORY_READ,
  },
  {
    labelKey: "units",
    href: "/company/units",
    icon: Ruler,
    companyPermission: COMPANY_PERMISSIONS.UNIT_READ,
  },
  {
    labelKey: "products",
    href: "/company/products",
    icon: Package,
    companyPermission: COMPANY_PERMISSIONS.PRODUCT_READ,
  },
  {
    labelKey: "customers",
    href: "/company/customers",
    icon: UserRound,
    companyPermission: COMPANY_PERMISSIONS.CUSTOMER_READ,
  },
  {
    labelKey: "suppliers",
    href: "/company/suppliers",
    icon: Truck,
    companyPermission: COMPANY_PERMISSIONS.SUPPLIER_READ,
  },
  {
    labelKey: "sales",
    href: "/company/sales",
    icon: ShoppingCart,
    companyPermission: COMPANY_PERMISSIONS.SALE_READ,
  },
  {
    labelKey: "purchaseOrders",
    href: "/company/purchase-orders",
    icon: ClipboardList,
    companyPermission: COMPANY_PERMISSIONS.PURCHASE_ORDER_READ,
  },
  {
    labelKey: "stockTransfers",
    href: "/company/stock-transfers",
    icon: ArrowLeftRight,
    companyPermission: COMPANY_PERMISSIONS.STOCK_TRANSFER_READ,
  },
  {
    labelKey: "settings",
    href: "/company/settings",
    icon: Settings,
    companyPermission: COMPANY_PERMISSIONS.SETTINGS_READ,
  },
];

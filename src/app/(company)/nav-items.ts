import {
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  FileText,
  Wallet,
  CreditCard,
  MapPin,
  Tags,
  Ruler,
  Package,
  UserRound,
  Truck,
  SlidersHorizontal,
  ClipboardList,
  ArrowLeftRight,
  ShoppingCart,
  ScanLine,
  Receipt,
  Banknote,
  HandCoins,
  ClipboardEdit,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  Boxes,
  Scale,
  Landmark,
  Users,
  Settings,
  Wand2,
} from "lucide-react";

import type { NavItem } from "@/components/layout/app-sidebar";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export const companyNavItems: NavItem[] = [
  { labelKey: "dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  {
    labelKey: "configuration",
    icon: Settings,
    children: [
      {
        labelKey: "locations",
        href: "/company/locations",
        icon: MapPin,
        companyPermission: COMPANY_PERMISSIONS.LOCATION_READ,
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
        labelKey: "companySettings",
        href: "/company/settings",
        icon: SlidersHorizontal,
        companyPermission: COMPANY_PERMISSIONS.SETTINGS_READ,
      },
      /** Setup page-এ কোনো `CompanyPermissionGate` নেই (verified directly) — ungated, matches its real, already-shipped access level. */
      { labelKey: "setupWizard", href: "/company/setup", icon: Wand2 },
    ],
  },
  {
    labelKey: "accessControl",
    icon: Users,
    children: [
      {
        labelKey: "companyRoles",
        href: "/company/rbac/roles",
        icon: ShieldCheck,
        companyPermission: COMPANY_PERMISSIONS.RBAC_READ,
      },
      {
        labelKey: "companyMembers",
        href: "/company/rbac/members",
        icon: UserCog,
        companyPermission: COMPANY_PERMISSIONS.MEMBER_READ,
      },
    ],
  },
  //  {
  //   labelKey: "purchase",
  //   icon: ClipboardList,
  //   children: [
      {
        labelKey: "purchaseOrders",
        href: "/company/purchase-orders",
        icon: FileText,
        companyPermission: COMPANY_PERMISSIONS.PURCHASE_ORDER_READ,
      },
      {
        labelKey: "stockTransfers",
        href: "/company/stock-transfers",
        icon: ArrowLeftRight,
        companyPermission: COMPANY_PERMISSIONS.STOCK_TRANSFER_READ,
      },
      {
        labelKey: "supplierPayments",
        href: "/company/supplier-payments",
        icon: HandCoins,
        companyPermission: COMPANY_PERMISSIONS.SUPPLIER_PAYMENT_READ,
      },
  //   ],
  // },
  // {
  //   labelKey: "inventory",
  //   icon: Boxes,
  //   children: [
      {
        labelKey: "products",
        href: "/company/products",
        icon: Package,
        companyPermission: COMPANY_PERMISSIONS.PRODUCT_READ,
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
        labelKey: "stockAdjustments",
        href: "/company/stock-adjustments",
        icon: ClipboardEdit,
        companyPermission: COMPANY_PERMISSIONS.STOCK_ADJUSTMENT_READ,
      },
  //   ],
  // },
  // {
  //   labelKey: "sales",
  //   icon: ShoppingCart,
  //   children: [
      {
        labelKey: "pos",
        href: "/company/pos",
        icon: ScanLine,
        companyPermission: COMPANY_PERMISSIONS.SALE_CREATE,
      },
      {
        labelKey: "salesHistory",
        href: "/company/sales",
        icon: Receipt,
        companyPermission: COMPANY_PERMISSIONS.SALE_READ,
      },
      {
        labelKey: "cashDrawer",
        href: "/company/cash-drawer",
        icon: Banknote,
        companyPermission: COMPANY_PERMISSIONS.CASH_DRAWER_SESSION_READ,
      },
  //   ],
  // },
 
  
  {
    labelKey: "reports",
    icon: BarChart3,
    children: [
      {
        labelKey: "saleRegister",
        href: "/company/reports/sale-register",
        icon: Receipt,
        companyPermission: COMPANY_PERMISSIONS.REPORT_READ,
      },
      {
        labelKey: "purchaseRegister",
        href: "/company/reports/purchase-register",
        icon: FileSpreadsheet,
        companyPermission: COMPANY_PERMISSIONS.REPORT_READ,
      },
      {
        labelKey: "profitReport",
        href: "/company/reports/profit",
        icon: TrendingUp,
        companyPermission: COMPANY_PERMISSIONS.PROFIT_REPORT_READ,
      },
      {
        labelKey: "stockReport",
        href: "/company/reports/stock",
        icon: Boxes,
        companyPermission: COMPANY_PERMISSIONS.REPORT_READ,
      },
      {
        labelKey: "duePayableLedger",
        href: "/company/reports/due-payable",
        icon: Scale,
        companyPermission: COMPANY_PERMISSIONS.REPORT_READ,
      },
    ],
  },
  {
    labelKey: "subscriptionBilling",
    icon: Landmark,
    children: [
      /**
       * `subscriptions` GET route (`current`/`all`/`:id`)-এ কোনো `@RequireCompanyPermissions`
       * decorator নেই — `CompanyPermissionsGuard` verified: no-decorator মানে যেকোনো active company
       * member access পায়। তাই এই child ungated (Dashboard-এর মতোই), backend contract-এর সাথে
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
    ],
  },
  
  
];

import {
  LayoutDashboard,
  Building2,
  Factory,
  Layers,
  Puzzle,
  CreditCard,
  Receipt,
  FileText,
  Wallet,
  Building,
  UserCog,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import type { NavItem } from "@/components/layout/app-sidebar";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/**
 * Future module (settings/audit-logs/users/reports — section-এর "future
 * structure") এখনো যোগ করা হয়নি, শুধু এই array-তে entry বাড়ালেই হবে।
 */
export const platformNavItems: NavItem[] = [
  { labelKey: "dashboard", href: "/platform/dashboard", icon: LayoutDashboard },
   {
    labelKey: "accessControl",
    icon: ShieldCheck,
    children: [
      {
        labelKey: "staff",
        href: "/platform/access-control/staff",
        icon: UserCog,
        platformPermission: PLATFORM_PERMISSIONS.STAFF_READ,
      },
      {
        labelKey: "platformRoles",
        href: "/platform/access-control/roles",
        icon: ShieldCheck,
        platformPermission: PLATFORM_PERMISSIONS.ROLE_READ,
      },
      {
        labelKey: "platformPermissions",
        href: "/platform/access-control/permissions",
        icon: KeyRound,
        platformPermission: PLATFORM_PERMISSIONS.ROLE_READ,
      },
    ],
  },
  {
    labelKey: "tenants",
    href: "/platform/tenants",
    icon: Building,
    platformPermission: PLATFORM_PERMISSIONS.TENANT_READ,
  },
  {
    labelKey: "companies",
    href: "/platform/companies",
    icon: Building2,
    platformPermission: PLATFORM_PERMISSIONS.COMPANY_READ,
  },
  {
    labelKey: "industries",
    href: "/platform/industries",
    icon: Factory,
    platformPermission: PLATFORM_PERMISSIONS.INDUSTRY_READ,
  },
  {
    labelKey: "plans",
    href: "/platform/plans",
    icon: Layers,
    platformPermission: PLATFORM_PERMISSIONS.PLAN_READ,
  },
  {
    labelKey: "features",
    href: "/platform/features",
    icon: Puzzle,
    platformPermission: PLATFORM_PERMISSIONS.FEATURE_READ,
  },
  {
    labelKey: "subscriptions",
    href: "/platform/subscriptions",
    icon: CreditCard,
    platformPermission: PLATFORM_PERMISSIONS.SUBSCRIPTION_READ,
  },
  {
    labelKey: "billing",
    href: "/platform/billing",
    icon: Receipt,
    platformPermission: PLATFORM_PERMISSIONS.BILLING_READ,
  },
  {
    labelKey: "invoices",
    href: "/platform/invoices",
    icon: FileText,
    platformPermission: PLATFORM_PERMISSIONS.INVOICE_READ,
  },
  {
    labelKey: "payments",
    href: "/platform/payments",
    icon: Wallet,
    platformPermission: PLATFORM_PERMISSIONS.PAYMENT_READ,
  },
 
];

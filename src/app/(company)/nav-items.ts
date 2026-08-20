import { LayoutDashboard, ShieldCheck, Users, FileText, Wallet, CreditCard } from "lucide-react";

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
];

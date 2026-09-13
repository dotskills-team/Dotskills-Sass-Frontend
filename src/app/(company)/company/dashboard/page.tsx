import type { Metadata } from "next";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard — DotSkills",
};

/**
 * Real, backend-driven Business Command Center — replaces the previous
 * hardcoded/mock widgets entirely. Every number comes from
 * `GET /companies/:companyId/dashboard/overview` (see
 * `src/modules/dashboard/dashboard.service.ts`, backend), which itself
 * reuses `ProfitReportService` and the same Location/Inventory/Sale/
 * PurchaseOrder/Customer/Supplier/CashDrawer/Notification data every other
 * screen in the app already relies on — nothing here is fabricated.
 */
export default function CompanyDashboardPage() {
  return <DashboardOverview />;
}

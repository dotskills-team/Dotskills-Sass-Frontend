/** Mirrors backend `src/modules/dashboard/dashboard.service.ts`'s response shape exactly — every field is real data, nothing invented here. */

export interface DashboardScope {
  hasBranches: boolean;
  locations: { id: string; name: string }[];
  selectedLocationId: string | null;
}

export interface DashboardKpis {
  sales: string;
  orders: number;
  grossProfit: string;
  grossMarginPercent: number | null;
  receivable: { total: string; customerCount: number };
  payable: { total: string; supplierCount: number };
}

export interface DashboardSalesPoint {
  date: string;
  sales: string;
  orders: number;
  grossProfit: string;
}

export interface DashboardInventoryHealth {
  inventoryValue: string;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
}

export interface DashboardTopProduct {
  productId: string;
  name: string;
  sku: string;
  quantitySold: string;
  revenue: string;
}

export interface DashboardPurchaseOverview {
  totalPurchases: string;
  purchaseOrderCount: number;
}

export interface DashboardTransaction {
  id: string;
  type: "SALE" | "PURCHASE";
  reference: string;
  party: string | null;
  amount: string;
  status: string;
  date: string;
}

/** Shape from `NotificationService.listForCompany` — reused as-is, not redefined. */
export interface DashboardAlert {
  id: string;
  type: string;
  relatedEntityType: string;
  relatedEntityId: string;
  locationId: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardCashPosition {
  openSessionCount: number;
  totalOpeningFloat: string;
}

export interface DashboardBranchPerformance {
  locationId: string;
  name: string;
  sales: string;
  orders: number;
  grossProfit: string;
}

export interface DashboardOverview {
  currencyCode: string;
  scope: DashboardScope;
  kpis: DashboardKpis;
  salesPerformance: DashboardSalesPoint[];
  inventoryHealth: DashboardInventoryHealth;
  topProducts: DashboardTopProduct[];
  purchaseOverview: DashboardPurchaseOverview;
  recentTransactions: DashboardTransaction[];
  actionRequired: DashboardAlert[];
  cashPosition: DashboardCashPosition;
  branchPerformance: DashboardBranchPerformance[] | null;
}

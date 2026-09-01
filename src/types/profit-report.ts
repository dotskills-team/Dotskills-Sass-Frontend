/**
 * `GET /companies/:companyId/reports/profit` day-bucketed row (verified
 * `profit-report.service.ts`). `revenue = Sale.totalAmount - Sale.taxAmount`
 * (tax is pass-through, not income); `cogs` is `sum(SaleItem.quantity *
 * SaleItem.unitCost)` — the historical cost snapshotted at sale time, never
 * today's live `Product.costPrice`. Returns are not netted out (no
 * per-line price breakdown on `SaleReturn` to net correctly).
 */
export interface ProfitReportEntry {
  date: string;
  saleCount: number;
  revenue: string;
  cogs: string;
  grossProfit: string;
}

export interface ProfitReportSummary {
  saleCount: number;
  revenue: string;
  cogs: string;
  grossProfit: string;
}

export interface ProfitReportResult {
  items: ProfitReportEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  summary: ProfitReportSummary;
}

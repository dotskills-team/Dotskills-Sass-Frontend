/**
 * `GET /companies/:companyId/reports/customer-due-summary` /
 * `supplier-payable-summary` items (verified `ledger-summary.service.ts`) —
 * "who owes / is owed how much, right now," reading the already-maintained
 * running-balance columns directly, never re-summing the ledger. The
 * per-party ledger *detail* drill-down is unchanged, served by the existing
 * `customer-payments` / `supplier-payments` list endpoints.
 */
export interface CustomerDueSummaryEntry {
  id: string;
  name: string;
  phone: string | null;
  dueBalance: string;
}

export interface SupplierPayableSummaryEntry {
  id: string;
  name: string;
  phone: string | null;
  payableBalance: string;
}

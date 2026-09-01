import type { PurchaseOrderStatus } from "@/types/purchase-order";

/** `GET /companies/:companyId/reports/purchase-register` item (verified `PURCHASE_REGISTER_SELECT` in purchase-register.service.ts). */
export interface PurchaseRegisterEntry {
  id: string;
  orderNumber: string;
  orderDate: string;
  locationId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: string;
  _count: { receipts: number; returns: number };
}

/** Excludes CANCELLED orders only — the purchase-side equivalent of Sale Register excluding VOIDED sales from its summary. */
export interface PurchaseRegisterSummary {
  activeOrdersCount: number;
  totalOrderedValue: string;
}

export interface PurchaseRegisterResult {
  items: PurchaseRegisterEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  summary: PurchaseRegisterSummary;
}

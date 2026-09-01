import type { SaleStatus, SalePaymentMethod } from "@/types/sale";

/** `GET /companies/:companyId/reports/sale-register` item (verified `SALE_REGISTER_SELECT` in sale-register.service.ts). */
export interface SaleRegisterEntry {
  id: string;
  saleNumber: string;
  saleDate: string;
  locationId: string;
  customerId: string | null;
  processedByUserId: string;
  status: SaleStatus;
  subtotal: string;
  itemDiscountTotal: string;
  saleDiscountAmount: string;
  taxAmount: string;
  totalAmount: string;
}

export interface SaleRegisterPaymentBreakdown {
  method: SalePaymentMethod;
  amount: string;
}

/** Counts/totals COMPLETED sales only, even though `data` lists every status (a register is a complete record). */
export interface SaleRegisterSummary {
  completedSalesCount: number;
  totalRevenue: string;
  paymentBreakdown: SaleRegisterPaymentBreakdown[];
}

export interface SaleRegisterResult {
  items: SaleRegisterEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  summary: SaleRegisterSummary;
}

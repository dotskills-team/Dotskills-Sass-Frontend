export type SaleStatus = "COMPLETED" | "VOIDED";
export type SalePaymentMethod = "CASH" | "CARD" | "BKASH" | "NAGAD" | "DUE";

/** `Sale.items[]` (verified `SALE_SELECT` in sale.service.ts). */
export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  unitCost: string;
  discountAmount: string;
  subtotal: string;
}

/** `Sale.payments[]` (verified `SALE_SELECT`). */
export interface SalePayment {
  id: string;
  method: SalePaymentMethod;
  amount: string;
}

/** `GET /companies/:companyId/sales` item (verified `SALE_SELECT` in sale.service.ts). */
export interface Sale {
  id: string;
  locationId: string;
  customerId: string | null;
  processedByUserId: string;
  saleNumber: string;
  status: SaleStatus;
  saleDate: string;
  subtotal: string;
  itemDiscountTotal: string;
  saleDiscountAmount: string;
  taxAmount: string;
  totalAmount: string;
  voidedAt: string | null;
  voidReason: string | null;
  note: string | null;
  createdAt: string;
  items: SaleItem[];
  payments: SalePayment[];
}

/** `GET /companies/:companyId/sales/returns` item (verified sale.service.ts — full row, no select, mirrors PurchaseReturn's own precedent). */
export interface SaleReturn {
  id: string;
  tenantId: string;
  companyId: string;
  saleId: string;
  reason: string;
  refundAmount: string;
  returnDate: string;
  actorUserId: string | null;
  createdAt: string;
}

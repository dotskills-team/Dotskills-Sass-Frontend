export type SupplierLedgerEntryType = "PAYABLE" | "PAYMENT";

/** `GET /companies/:companyId/supplier-payments` item (verified supplier-payment.service.ts — full row, no select). */
export interface SupplierPayableLedgerEntry {
  id: string;
  tenantId: string;
  companyId: string;
  supplierId: string;
  entryType: SupplierLedgerEntryType;
  amount: string;
  referenceId: string | null;
  note: string | null;
  actorUserId: string | null;
  createdAt: string;
}

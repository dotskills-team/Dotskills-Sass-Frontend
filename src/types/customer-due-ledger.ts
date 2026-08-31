export type CustomerLedgerEntryType = "DUE" | "PAYMENT";

/** `GET /companies/:companyId/customer-payments` item (verified customer-payment.service.ts — full row, no select, mirrors SupplierPayableLedgerEntry exactly). */
export interface CustomerDueLedgerEntry {
  id: string;
  tenantId: string;
  companyId: string;
  customerId: string;
  entryType: CustomerLedgerEntryType;
  amount: string;
  referenceId: string | null;
  note: string | null;
  actorUserId: string | null;
  createdAt: string;
}

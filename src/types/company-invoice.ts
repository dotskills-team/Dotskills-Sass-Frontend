import type { BillingStatus, InvoiceStatus, SubscriptionStatus } from "@/types/platform";

/** `GET /invoices` (company-scoped) list item — verified invoice.service.ts `findAll` include block. */
export interface CompanyInvoice {
  id: string;
  tenantId: string;
  companyId: string | null;
  subscriptionId: string;
  billingId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currencyCode: string;
  totalAmount: string;
  issuedAt: string | null;
  dueAt: string;
  paidAt: string | null;
  createdAt: string;
  billing: { id: string; status: BillingStatus; periodStart: string; periodEnd: string };
  subscription: { id: string; status: SubscriptionStatus; planId: string };
}

/** `GET /invoices/:id` (company-scoped) — raw full row, no `{success,data}` envelope (verified `findOne`). */
export interface CompanyInvoiceDetail {
  id: string;
  tenantId: string;
  companyId: string | null;
  subscriptionId: string;
  billingId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currencyCode: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  priceSnapshot: Record<string, unknown>;
  issuedAt: string | null;
  dueAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  voidedAt: string | null;
  createdAt: string;
  billing: {
    id: string;
    status: BillingStatus;
    billingCycle: string;
    periodStart: string;
    periodEnd: string;
  };
  subscription: {
    id: string;
    status: SubscriptionStatus;
    planId: string;
    plan: { id: string; code: string; name: string };
  };
}

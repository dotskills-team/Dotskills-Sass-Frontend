import type { InvoiceStatus, PaymentStatus } from "@/types/platform";

/** `GET /payments` (company-scoped) list item — verified payment.service.ts `findAll` include block. */
export interface CompanyPayment {
  id: string;
  tenantId: string;
  companyId: string | null;
  subscriptionId: string;
  invoiceId: string;
  provider: string;
  status: PaymentStatus;
  currencyCode: string;
  amount: string;
  providerTransactionId: string;
  gatewayReference: string | null;
  failureReason: string | null;
  initiatedAt: string | null;
  succeededAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  invoice: { id: string; invoiceNumber: string; status: InvoiceStatus };
}

/** `GET /payments/:id` (company-scoped) — raw full row + `include: { invoice: true }` (verified `findOne`), no envelope. */
export interface CompanyPaymentDetail {
  id: string;
  tenantId: string;
  companyId: string | null;
  subscriptionId: string;
  invoiceId: string;
  provider: string;
  status: PaymentStatus;
  currencyCode: string;
  amount: string;
  providerTransactionId: string;
  gatewayReference: string | null;
  failureReason: string | null;
  initiatedAt: string | null;
  succeededAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    totalAmount: string;
    currencyCode: string;
    dueAt: string;
    issuedAt: string | null;
    paidAt: string | null;
  };
}

/** `POST /payments` response — raw `{payment, gatewayPageUrl}` (verified payment.service.ts `create`), no envelope. */
export interface CreateCompanyPaymentResult {
  payment: { id: string; status: PaymentStatus; providerTransactionId: string };
  gatewayPageUrl: string;
}

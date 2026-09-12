import type { BillingCycle, CompanySummary, InvoiceStatus, PaymentStatus, PlanSummary } from "@/types/platform";

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
  company: CompanySummary | null;
  invoice: { id: string; invoiceNumber: string; status: InvoiceStatus };
  subscription: { id: string; billingCycle: BillingCycle; plan: PlanSummary };
}

/** `GET /payments/:id` (company-scoped) — raw full row + enriched `company`/`subscription`/`invoice` includes (verified `PaymentService.findOne`), no envelope. */
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
  metadata: Record<string, unknown> | null;
  initiatedAt: string | null;
  succeededAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  company: CompanySummary | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    totalAmount: string;
    subtotal: string;
    discountAmount: string;
    taxAmount: string;
    currencyCode: string;
    dueAt: string;
    issuedAt: string | null;
    paidAt: string | null;
  };
  subscription: {
    id: string;
    billingCycle: BillingCycle;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    plan: PlanSummary;
  };
}

/** `GET /payments/:id/receipt` — same enriched row as `findOne`, only ever returned for a SUCCEEDED payment (verified `PaymentService.getReceipt`). */
export type CompanyPaymentReceipt = CompanyPaymentDetail;

/** `POST /payments` response — raw `{payment, gatewayPageUrl}` (verified payment.service.ts `create`), no envelope. */
export interface CreateCompanyPaymentResult {
  payment: { id: string; status: PaymentStatus; providerTransactionId: string };
  gatewayPageUrl: string;
}

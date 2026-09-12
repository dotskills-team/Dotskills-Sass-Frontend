import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { getCompanyDisplayName, getCompanyOwner } from "@/lib/company-summary";
import { getPaymentMethodLabel, getReceiptNumber, maskPaymentReference } from "@/lib/receipt";
import type { CompanyPaymentDetail } from "@/types/company-payment";

/**
 * Pure presentational — reused by both the Platform and Company "Download
 * Receipt" pages against the exact same enriched Payment shape
 * (`PaymentService.getReceipt()` only ever returns a SUCCEEDED payment,
 * verified backend). Every value here comes straight from that response;
 * nothing is computed beyond simple display formatting.
 */
export function ReceiptDocument({ payment }: { payment: CompanyPaymentDetail }) {
  const { invoice, subscription, company } = payment;
  const owner = getCompanyOwner(company);
  const companyName = getCompanyDisplayName(company);
  const planName = subscription.plan.name;

  return (
    <div className="mx-auto max-w-2xl bg-card p-8 text-sm text-foreground print:max-w-none print:p-0 print:shadow-none">
      <header className="mb-8 flex items-start justify-between border-b border-border pb-6">
        <div>
          <p className="font-heading text-lg font-semibold text-foreground">DotSkills</p>
          <p className="text-xs text-muted-foreground">Subscription billing receipt</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-base font-semibold text-foreground">Receipt</p>
          <p className="font-mono text-xs text-muted-foreground">{getReceiptNumber(invoice.invoiceNumber)}</p>
          <p className="text-xs text-muted-foreground">Date paid: {formatDate(payment.succeededAt)}</p>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bill From</p>
          <p className="font-medium text-foreground">DotSkills</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bill To</p>
          <p className="font-medium text-foreground">{companyName}</p>
          {owner && (
            <>
              <p className="text-foreground">{owner.name}</p>
              <p className="text-muted-foreground">{owner.email}</p>
            </>
          )}
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice</p>
        <div className="grid grid-cols-2 gap-4 rounded-md border border-border p-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Invoice #</p>
            <p className="font-mono text-foreground">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billing period</p>
            <p className="text-foreground">
              {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billing cycle</p>
            <p className="text-foreground">{subscription.billingCycle}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="text-foreground">{payment.currencyCode}</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3">
                <p className="text-foreground">{planName} plan</p>
                <p className="text-xs text-muted-foreground">{subscription.billingCycle} subscription</p>
              </td>
              <td className="py-3 text-center text-foreground">1</td>
              <td className="py-3 text-right text-foreground">
                {formatCurrency(invoice.subtotal, invoice.currencyCode)}
              </td>
              <td className="py-3 text-right text-foreground">
                {formatCurrency(invoice.subtotal, invoice.currencyCode)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="ml-auto mt-3 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrency(invoice.subtotal, invoice.currencyCode)}</span>
          </div>
          {Number(invoice.discountAmount) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-foreground">
                −{formatCurrency(invoice.discountAmount, invoice.currencyCode)}
              </span>
            </div>
          )}
          {Number(invoice.taxAmount) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">{formatCurrency(invoice.taxAmount, invoice.currencyCode)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1 font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatCurrency(invoice.totalAmount, invoice.currencyCode)}</span>
          </div>
          <div className="flex justify-between font-semibold text-success">
            <span>Amount paid</span>
            <span>{formatCurrency(payment.amount, payment.currencyCode)}</span>
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 rounded-md border border-border p-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Payment method</p>
          <p className="text-foreground">{getPaymentMethodLabel(payment.provider, payment.metadata)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Reference</p>
          <p className="font-mono text-foreground">{maskPaymentReference(payment.providerTransactionId)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Transaction ID</p>
          <p className="font-mono text-xs text-foreground">{payment.gatewayReference ?? payment.providerTransactionId}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Payment date</p>
          <p className="text-foreground">{formatDate(payment.succeededAt)}</p>
        </div>
      </section>

      <section className="mb-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment history</p>
        <ol className="space-y-1 text-xs text-muted-foreground">
          {payment.initiatedAt && <li>Initiated — {formatDateTime(payment.initiatedAt)}</li>}
          {payment.succeededAt && <li>Succeeded — {formatDateTime(payment.succeededAt)}</li>}
        </ol>
      </section>

      <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        Thank you for your business.
      </footer>
    </div>
  );
}

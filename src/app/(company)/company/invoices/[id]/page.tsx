"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetCompanyInvoiceQuery } from "@/features/company-invoice/api/company-invoice.api";
import { PayInvoiceDialog } from "@/features/company-payment/components/pay-invoice-dialog";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

/** Read-only details — company user-দের কোনো mutation route নেই (verified company-invoice.controller.ts)। */
export default function CompanyInvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("companyInvoices");
  const { data: invoice, isLoading, error, refetch } = useGetCompanyInvoiceQuery(params.id);

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.INVOICE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={invoice?.invoiceNumber ?? t("details.overview")} description={t("details.overview")} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/company/invoices")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !invoice ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <section className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-base font-medium text-foreground">{t("details.overview")}</h2>
              <div className="flex items-center gap-2">
                {invoice.status === "ISSUED" && (
                  <PayInvoiceDialog
                    invoiceId={invoice.id}
                    invoiceNumber={invoice.invoiceNumber}
                    amount={invoice.totalAmount}
                    currencyCode={invoice.currencyCode}
                  />
                )}
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">{t("details.plan")}</dt>
                <dd className="text-foreground">{invoice.subscription.plan.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.subtotal")}</dt>
                <dd className="text-foreground">{formatCurrency(invoice.subtotal, invoice.currencyCode)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.discount")}</dt>
                <dd className="text-foreground">{formatCurrency(invoice.discountAmount, invoice.currencyCode)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.tax")}</dt>
                <dd className="text-foreground">{formatCurrency(invoice.taxAmount, invoice.currencyCode)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.total")}</dt>
                <dd className="font-semibold text-foreground">
                  {formatCurrency(invoice.totalAmount, invoice.currencyCode)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.due")}</dt>
                <dd className="text-foreground">{formatDate(invoice.dueAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.issued")}</dt>
                <dd className="text-foreground">{invoice.issuedAt ? formatDate(invoice.issuedAt) : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.paid")}</dt>
                <dd className="text-foreground">{invoice.paidAt ? formatDate(invoice.paidAt) : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.billingPeriod")}</dt>
                <dd className="text-foreground">
                  {formatDate(invoice.billing.periodStart)} – {formatDate(invoice.billing.periodEnd)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("details.billingCycle")}</dt>
                <dd className="text-foreground">{invoice.billing.billingCycle}</dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

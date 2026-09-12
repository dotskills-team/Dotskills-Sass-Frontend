"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReceiptDocument } from "@/components/receipt/receipt-document";

import { useGetCompanyPaymentQuery } from "@/features/company-payment/api/company-payment.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { getPaymentMethodLabel, getReceiptNumber } from "@/lib/receipt";
import { downloadElementAsPdf } from "@/lib/pdf-download";

/**
 * Read-only — company controller-এ verify/cancel route নেই (verified)। Payment-এর প্রকৃত
 * চূড়ান্ত status সবসময় backend-এর gateway-verification থেকেই আসে (IPN/success callback,
 * server-to-server) — এই page শুধু সেই backend-confirmed state দেখায়, কখনো নিজে থেকে
 * success/failure decide করে না। Gateway থেকে ফিরে tab focus হলে auto-refetch হয়
 * (`refetchOnFocus`), সাথে manual Refresh button-ও আছে।
 */
export default function CompanyPaymentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("companyPayments");
  const {
    data: payment,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCompanyPaymentQuery(params.id, { refetchOnFocus: true });
  const hiddenReceiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * True single-click PDF download — `payment` already carries every field
   * the receipt needs, so this captures the off-screen `ReceiptDocument`
   * directly, no extra API call and no intermediate page.
   */
  async function handleDownloadReceipt() {
    if (!hiddenReceiptRef.current || !payment) return;
    setIsDownloading(true);
    try {
      await downloadElementAsPdf(hiddenReceiptRef.current, `${getReceiptNumber(payment.invoice.invoiceNumber)}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PAYMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={payment?.invoice.invoiceNumber ?? t("details.overview")} description={t("details.overview")} />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/company/payments")}>
            <ArrowLeft aria-hidden="true" />
            {t("details.backToList")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            {t("details.refresh")}
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !payment ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            {(payment.status === "PENDING" || payment.status === "PROCESSING") && (
              <Alert>
                <AlertDescription>{t("details.pendingNotice")}</AlertDescription>
              </Alert>
            )}
            {payment.status === "FAILED" && payment.failureReason && (
              <Alert variant="destructive">
                <AlertDescription>{payment.failureReason}</AlertDescription>
              </Alert>
            )}

            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium text-foreground">{t("details.overview")}</h2>
                <div className="flex items-center gap-2">
                  {payment.status === "SUCCEEDED" && (
                    <Button variant="outline" size="sm" onClick={handleDownloadReceipt} disabled={isDownloading}>
                      {isDownloading ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Download aria-hidden="true" />
                      )}
                      {t("details.downloadReceipt")}
                    </Button>
                  )}
                  <StatusBadge status={payment.status} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">{t("details.plan")}</dt>
                  <dd className="text-foreground">
                    {payment.subscription.plan.name}
                    <span className="block text-xs text-muted-foreground">{payment.subscription.billingCycle}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.invoice")}</dt>
                  <dd className="font-mono text-foreground">{payment.invoice.invoiceNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.amount")}</dt>
                  <dd className="font-semibold text-foreground">
                    {formatCurrency(payment.amount, payment.currencyCode)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.provider")}</dt>
                  <dd className="text-foreground">{getPaymentMethodLabel(payment.provider, payment.metadata)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.transactionId")}</dt>
                  <dd className="font-mono text-xs text-foreground">{payment.providerTransactionId}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.initiated")}</dt>
                  <dd className="text-foreground">{payment.initiatedAt ? formatDate(payment.initiatedAt) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.succeeded")}</dt>
                  <dd className="text-foreground">{payment.succeededAt ? formatDate(payment.succeededAt) : "—"}</dd>
                </div>
              </dl>
            </section>

            <div className="fixed left-[-9999px] top-0" aria-hidden="true">
              <div ref={hiddenReceiptRef}>
                <ReceiptDocument payment={payment} />
              </div>
            </div>
          </>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

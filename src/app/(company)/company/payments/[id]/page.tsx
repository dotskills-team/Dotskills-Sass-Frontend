"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useGetCompanyPaymentQuery } from "@/features/company-payment/api/company-payment.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

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
                <StatusBadge status={payment.status} />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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
                  <dd className="text-foreground">{payment.provider}</dd>
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
          </>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useGetPaymentQuery } from "@/features/payment/api/payment.api";
import { PaymentRowActions } from "@/features/payment/components/payment-actions";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

/**
 * Payment-এর প্রকৃত final state সবসময় backend-এর gateway-verification থেকে আসে — এই page
 * কখনো নিজে থেকে success/failure decide করে না, শুধু backend-confirmed state দেখায়।
 * Verify/Cancel action-দুটো (Platform-only) reuse করা হয়েছে `PaymentRowActions` থেকে —
 * company payment details page-এর মতো fake success declare করা হয় না।
 */
export default function PlatformPaymentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("payments");
  const { data: payment, isLoading, error, refetch } = useGetPaymentQuery(params.id);

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PAYMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={payment?.invoice.invoiceNumber ?? t("details.overview")} description={t("details.overview")} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/platform/payments")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !payment ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            {payment.status === "FAILED" && payment.failureReason && (
              <Alert variant="destructive">
                <AlertDescription>{payment.failureReason}</AlertDescription>
              </Alert>
            )}

            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium text-foreground">
                  {formatCurrency(payment.amount, payment.currencyCode)}
                </h2>
                <StatusBadge status={payment.status} />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">{t("details.invoice")}</dt>
                  <dd className="font-mono text-foreground">{payment.invoice.invoiceNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.provider")}</dt>
                  <dd className="text-foreground">{payment.provider}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.transactionId")}</dt>
                  <dd className="font-mono text-xs text-foreground">{payment.providerTransactionId}</dd>
                </div>
                {payment.gatewayReference && (
                  <div>
                    <dt className="text-muted-foreground">{t("details.gatewayReference")}</dt>
                    <dd className="font-mono text-xs text-foreground">{payment.gatewayReference}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">{t("details.initiated")}</dt>
                  <dd className="text-foreground">{payment.initiatedAt ? formatDate(payment.initiatedAt) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.succeeded")}</dt>
                  <dd className="text-foreground">{payment.succeededAt ? formatDate(payment.succeededAt) : "—"}</dd>
                </div>
              </dl>

              <div className="mt-4 border-t border-border pt-4">
                <PaymentRowActions payment={payment} />
              </div>
            </section>
          </>
        )}
      </div>
    </PlatformPermissionGate>
  );
}

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

import { useGetBillingQuery } from "@/features/billing/api/billing.api";
import { BillingRowActions } from "@/features/billing/components/billing-actions";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { getCompanyDisplayName, getCompanyOwner } from "@/lib/company-summary";

export default function PlatformBillingDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("billing");
  const { data: billing, isLoading, error, refetch } = useGetBillingQuery(params.id);
  const ownerInfo = billing ? getCompanyOwner(billing.company) : null;

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_READ} fallback={<PermissionDenied />}>
      <PageHeader
        title={billing ? formatCurrency(billing.amount, billing.currencyCode) : t("details.overview")}
        description={t("details.overview")}
      />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/platform/billing")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !billing ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium text-foreground">
                  {formatCurrency(billing.amount, billing.currencyCode)}
                </h2>
                <StatusBadge status={billing.status} />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">{t("details.company")}</dt>
                  <dd className="text-foreground">{getCompanyDisplayName(billing.company)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.owner")}</dt>
                  <dd className="text-foreground">
                    {ownerInfo ? (
                      <>
                        {ownerInfo.name}
                        <span className="block text-xs text-muted-foreground">{ownerInfo.email}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.plan")}</dt>
                  <dd className="text-foreground">{billing.subscription.plan.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.billingCycle")}</dt>
                  <dd className="text-foreground">{billing.billingCycle}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.period")}</dt>
                  <dd className="text-foreground">
                    {formatDate(billing.periodStart)} – {formatDate(billing.periodEnd)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.due")}</dt>
                  <dd className="text-foreground">{formatDate(billing.dueAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("actions.process")}/{t("details.processed")}</dt>
                  <dd className="text-foreground">{billing.processedAt ? formatDate(billing.processedAt) : "—"}</dd>
                </div>
              </dl>

              <div className="mt-4 border-t border-border pt-4">
                <BillingRowActions billing={billing} />
              </div>
            </section>

            <section className="rounded-lg border border-border p-4">
              <h2 className="mb-3 font-heading text-base font-medium text-foreground">{t("details.attempts")}</h2>
              {billing.attempts.length === 0 ? (
                <EmptyState title={t("details.attemptsEmpty")} />
              ) : (
                <ol className="space-y-3">
                  {billing.attempts.map((attempt) => (
                    <li
                      key={attempt.id}
                      className="flex items-start justify-between gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-foreground">
                          {t("details.attemptNumber", { number: attempt.attemptNumber })} — {attempt.status}
                        </p>
                        {attempt.failureMessage && (
                          <p className="text-xs text-destructive">{attempt.failureMessage}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(attempt.attemptedAt)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </PlatformPermissionGate>
  );
}

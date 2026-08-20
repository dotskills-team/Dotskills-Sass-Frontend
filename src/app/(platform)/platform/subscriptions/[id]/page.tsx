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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetSubscriptionQuery } from "@/features/subscription/api/subscription.api";
import { SubscriptionRowActions } from "@/features/subscription/components/subscription-actions";
import { useGetCompanyQuery } from "@/features/company/api/company.api";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

/**
 * `findOneForPlatform` কোনো company relation include করে না (verified) — company name
 * দেখানোর জন্য এখানে existing `useGetCompanyQuery` আলাদাভাবে call করা হয়েছে (দুটো
 * already-verified endpoint compose করা, কোনো নতুন backend endpoint invent করা হয়নি)।
 */
export default function PlatformSubscriptionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("subscriptions");
  const { data: subscription, isLoading, error, refetch } = useGetSubscriptionQuery(params.id);
  const { data: company } = useGetCompanyQuery(subscription?.companyId ?? "", {
    skip: !subscription?.companyId,
  });

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_READ} fallback={<PermissionDenied />}>
      <PageHeader title={subscription?.plan.name ?? t("details.overview")} description={t("details.overview")} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/platform/subscriptions")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !subscription ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-medium text-foreground">{subscription.plan.name}</h2>
                  <p className="text-xs text-muted-foreground">{subscription.plan.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={subscription.status} />
                  <Badge variant="outline">
                    {subscription.autoRenew ? t("details.autoRenewOn") : t("details.autoRenewOff")}
                  </Badge>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">{t("details.company")}</dt>
                  <dd className="text-foreground">{company?.tradeName || company?.legalName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.billingCycle")}</dt>
                  <dd className="text-foreground">{subscription.billingCycle}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.price")}</dt>
                  <dd className="font-semibold text-foreground">
                    {formatCurrency(subscription.priceSnapshot.amount, subscription.priceSnapshot.currencyCode)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.currentPeriod")}</dt>
                  <dd className="text-foreground">
                    {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.startsAt")}</dt>
                  <dd className="text-foreground">{formatDate(subscription.startsAt)}</dd>
                </div>

                {subscription.trialEndsAt && (
                  <div>
                    <dt className="text-muted-foreground">{t("details.trialEndsAt")}</dt>
                    <dd className="text-foreground">{formatDate(subscription.trialEndsAt)}</dd>
                  </div>
                )}
                {subscription.graceEndsAt && (
                  <div>
                    <dt className="text-muted-foreground">{t("details.graceEndsAt")}</dt>
                    <dd className="text-foreground">{formatDate(subscription.graceEndsAt)}</dd>
                  </div>
                )}
                {subscription.pastDueEndsAt && (
                  <div>
                    <dt className="text-muted-foreground">{t("details.pastDueEndsAt")}</dt>
                    <dd className="text-foreground">{formatDate(subscription.pastDueEndsAt)}</dd>
                  </div>
                )}
                {subscription.suspendedAt && (
                  <div>
                    <dt className="text-muted-foreground">{t("details.suspendedAt")}</dt>
                    <dd className="text-foreground">{formatDate(subscription.suspendedAt)}</dd>
                  </div>
                )}
                {subscription.cancelledAt && (
                  <div>
                    <dt className="text-muted-foreground">{t("details.cancelledAt")}</dt>
                    <dd className="text-foreground">{formatDate(subscription.cancelledAt)}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 border-t border-border pt-4">
                <SubscriptionRowActions subscription={subscription} />
              </div>
            </section>

            <section className="rounded-lg border border-border p-4">
              <h2 className="mb-3 font-heading text-base font-medium text-foreground">{t("details.eventsTitle")}</h2>
              {subscription.events.length === 0 ? (
                <EmptyState title={t("details.eventsEmpty")} />
              ) : (
                <ol className="space-y-3">
                  {subscription.events.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-start justify-between gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-foreground">
                          {event.fromStatus ? `${event.fromStatus} → ${event.toStatus}` : event.toStatus}
                        </p>
                        <p className="text-xs text-muted-foreground">{event.reason}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(event.createdAt)}</span>
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

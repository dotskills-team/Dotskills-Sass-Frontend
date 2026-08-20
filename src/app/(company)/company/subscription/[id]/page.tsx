"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetCompanySubscriptionQuery } from "@/features/company-subscription/api/company-subscription.api";
import { CurrentSubscriptionCard } from "@/features/company-subscription/components/current-subscription-card";
import { formatDate } from "@/lib/formatters/date";

export default function CompanySubscriptionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("companySubscription");
  const { data: subscription, isLoading, error, refetch } = useGetCompanySubscriptionQuery(params.id);

  return (
    <>
      <PageHeader title={subscription?.plan.name ?? t("details.overview")} description={t("details.overview")} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/company/subscription")}>
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
            <CurrentSubscriptionCard subscription={subscription} />

            <section className="rounded-lg border border-border p-4">
              <h2 className="mb-3 font-heading text-base font-medium text-foreground">{t("details.eventsTitle")}</h2>
              {subscription.events.length === 0 ? (
                <EmptyState title={t("details.eventsEmpty")} />
              ) : (
                <ol className="space-y-3">
                  {subscription.events.map((event) => (
                    <li key={event.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0">
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
    </>
  );
}

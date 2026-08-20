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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetPlanQuery } from "@/features/plan/api/plan.api";
import { PlanPricingSection } from "@/features/plan-price/components/plan-pricing-section";
import { PlanFeaturesSection } from "@/features/plan-feature/components/plan-features-section";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/**
 * Plan/PlanPrice/PlanFeature backend-এ আলাদা lifecycle API (Plan CRUD,
 * `/plans/:id/prices`, `/plans/:id/features` — সব আলাদা controller) —
 * তাই একটা giant form না বানিয়ে এই Details page-এ Overview + Pricing +
 * Features তিনটা independent section হিসেবে দেখানো হয়েছে, প্রতিটার
 * নিজস্ব RTK tag ("Plan"/"PlanPrice"/"PlanFeature") দিয়ে refresh হয়।
 */
export default function PlanDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("plans");
  const { data: plan, isLoading, error, refetch } = useGetPlanQuery(params.id);

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_READ} fallback={<PermissionDenied />}>
      <PageHeader
        title={plan?.name ?? t("details.overview")}
        description={plan?.code}
      />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/platform/plans")}>
          <ArrowLeft aria-hidden="true" />
          {t("details.backToList")}
        </Button>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !plan ? (
          <EmptyState title={t("details.notFound")} />
        ) : (
          <>
            <section className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium text-foreground">
                  {t("details.overview")}
                </h2>
                <StatusBadge status={plan.status} />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">{t("details.code")}</dt>
                  <dd className="font-mono text-foreground">{plan.code}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.trialDays")}</dt>
                  <dd className="text-foreground">{plan.trialDays}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("details.visibility")}</dt>
                  <dd>
                    <Badge variant="outline">{plan.isPublic ? t("form.isPublicTrue") : t("form.isPublicFalse")}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("title")}</dt>
                  <dd className="text-foreground">
                    {t("details.subscriptionsCount", { count: plan._count.subscriptions })}
                  </dd>
                </div>
              </dl>
              {plan.description && <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>}
            </section>

            <PlanPricingSection planId={plan.id} />
            <PlanFeaturesSection planId={plan.id} />
          </>
        )}
      </div>
    </PlatformPermissionGate>
  );
}

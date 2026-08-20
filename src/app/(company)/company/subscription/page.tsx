"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetCurrentSubscriptionQuery } from "@/features/company-subscription/api/company-subscription.api";
import { CurrentSubscriptionCard } from "@/features/company-subscription/components/current-subscription-card";
import { SubscriptionHistoryTable } from "@/features/company-subscription/components/subscription-history-table";

/**
 * Read route-এ কোনো specific permission নেই (verified — `CompanyPermissionsGuard` কোনো
 * `@RequireCompanyPermissions` decorator ছাড়া সব active company member-কে যেতে দেয়),
 * তাই এই page-এ কোনো `CompanyPermissionGate` wrapper নেই — শুধু ব্যক্তিগত action button-গুলো
 * (`SubscriptionActions`) তাদের real permission code দিয়ে gated।
 */
export default function CompanySubscriptionPage() {
  const t = useTranslations("companySubscription");
  const { data: current, isLoading, error, refetch } = useGetCurrentSubscriptionQuery();

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 p-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !current ? (
          <EmptyState title={t("noActiveSubscription")} />
        ) : (
          <CurrentSubscriptionCard subscription={current} />
        )}

        <SubscriptionHistoryTable />
      </div>
    </>
  );
}

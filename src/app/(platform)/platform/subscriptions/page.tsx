"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { DataTable } from "@/components/data-table/data-table";

import { useListSubscriptionsQuery } from "@/features/subscription/api/subscription.api";
import { subscriptionsColumns } from "@/features/subscription/components/subscriptions-columns";
import { CreateSubscriptionDialog } from "@/features/subscription/components/create-subscription-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";

/**
 * Backend `/platform/subscriptions`-এ কোনো pagination/filter/search
 * সমর্থন নেই (সর্বোচ্চ ১০০টা row, verified) — তাই এখানে কোনো fake
 * search box বা pagination control দেখানো হয়নি (section 8/22)।
 */
export default function SubscriptionsPage() {
  const t = useTranslations("subscriptions");
  const { data, isLoading, error, refetch } = useListSubscriptionsQuery();

  return (
    <PlatformPermissionGate
      permission={PLATFORM_PERMISSIONS.SUBSCRIPTION_READ}
      fallback={<PermissionDenied />}
    >
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <CreateSubscriptionDialog />
        </div>

        <DataTable
          columns={subscriptionsColumns}
          data={data?.items ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        />
      </div>
    </PlatformPermissionGate>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { StatusFilter } from "@/components/shared/status-filter";
import { DataTable } from "@/components/data-table/data-table";
import { Input } from "@/components/ui/input";

import { useListFeaturesQuery } from "@/features/feature/api/feature.api";
import { featuresColumns } from "@/features/feature/components/features-columns";
import { CreateFeatureDialog } from "@/features/feature/components/create-feature-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { FeatureStatus } from "@/types/platform";

const FEATURE_STATUSES: FeatureStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

/**
 * Backend `/platform/features`-এ pagination কার্যত কাজ করে না
 * (verified, feature.service.ts `findAll()` কোনো skip/take ব্যবহার
 * করে না) — তাই এখানে কোনো pagination control নেই (fake pagination
 * নয়)। search/status filter genuinely কাজ করে (backend `where` clause-এ
 * প্রয়োগ হয়), তাই সেগুলো রাখা হয়েছে।
 */
export default function FeaturesPage() {
  const t = useTranslations("features");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useListFeaturesQuery({
    search: debouncedSearch || undefined,
    status,
  });

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.FEATURE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <Input
              className="max-w-sm"
              placeholder={tCommon("search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <StatusFilter value={status} options={FEATURE_STATUSES} onChange={setStatus} />
          </div>
          <CreateFeatureDialog />
        </div>

        <DataTable
          columns={featuresColumns}
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          error={error}
          onRetry={refetch}
        />
      </div>
    </PlatformPermissionGate>
  );
}

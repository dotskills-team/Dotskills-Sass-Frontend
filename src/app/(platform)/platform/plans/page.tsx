"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

import { useListPlansQuery } from "@/features/plan/api/plan.api";
import { plansColumns } from "@/features/plan/components/plans-columns";
import { CreatePlanDialog } from "@/features/plan/components/create-plan-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function PlansPage() {
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useListPlansQuery({
    page,
    search: debouncedSearch || undefined,
  });

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PLAN_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Input
            className="max-w-sm"
            placeholder={tCommon("search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <CreatePlanDialog />
        </div>

        <DataTable
          columns={plansColumns}
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          error={error}
          onRetry={refetch}
          pagination={data?.meta ?? undefined}
        />

        {data?.meta && data.meta.totalPages > 1 && (
          <DataTablePagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </PlatformPermissionGate>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

import { useListIndustriesQuery } from "@/features/industry/api/industry.api";
import { industriesColumns } from "@/features/industry/components/industries-columns";
import { CreateIndustryDialog } from "@/features/industry/components/create-industry-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function IndustriesPage() {
  const t = useTranslations("industries");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useListIndustriesQuery({
    page,
    search: debouncedSearch || undefined,
  });

  return (
    <PlatformPermissionGate
      permission={PLATFORM_PERMISSIONS.INDUSTRY_READ}
      fallback={<PermissionDenied />}
    >
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
          <CreateIndustryDialog />
        </div>

        <DataTable
          columns={industriesColumns}
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

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { StatusFilter } from "@/components/shared/status-filter";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

import { useListBillingsQuery } from "@/features/billing/api/billing.api";
import { billingsColumns } from "@/features/billing/components/billings-columns";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { BillingStatus } from "@/types/platform";

const BILLING_STATUSES: BillingStatus[] = ["PENDING", "PROCESSING", "SUCCEEDED", "FAILED"];

export default function BillingPage() {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useListBillingsQuery({
    page,
    search: debouncedSearch || undefined,
    status,
  });

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.BILLING_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex gap-3">
          <Input
            className="max-w-sm"
            placeholder={tCommon("search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <StatusFilter
            value={status}
            options={BILLING_STATUSES}
            onChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
          />
        </div>

        <DataTable
          columns={billingsColumns}
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

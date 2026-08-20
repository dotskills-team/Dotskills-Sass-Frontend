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

import { useListCompaniesQuery } from "@/features/company/api/company.api";
import { companiesColumns } from "@/features/company/components/companies-columns";
import { CreateCompanyDialog } from "@/features/company/components/create-company-dialog";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CompanyStatus } from "@/types/platform";

const COMPANY_STATUSES: CompanyStatus[] = ["DRAFT", "ONBOARDING", "READY", "LIVE", "SUSPENDED", "CLOSED"];

export default function CompaniesPage() {
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useListCompaniesQuery({
    page,
    search: debouncedSearch || undefined,
    status,
  });

  return (
    <PlatformPermissionGate
      permission={PLATFORM_PERMISSIONS.COMPANY_READ}
      fallback={<PermissionDenied />}
    >
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
              options={COMPANY_STATUSES}
              onChange={(next) => {
                setStatus(next);
                setPage(1);
              }}
            />
          </div>
          <CreateCompanyDialog />
        </div>

        <DataTable
          columns={companiesColumns}
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

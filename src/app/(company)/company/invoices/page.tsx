"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { StatusFilter } from "@/components/shared/status-filter";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Input } from "@/components/ui/input";

import { useListCompanyInvoicesQuery } from "@/features/company-invoice/api/company-invoice.api";
import { companyInvoicesColumns } from "@/features/company-invoice/components/company-invoices-columns";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { InvoiceStatus } from "@/types/platform";

const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "ISSUED", "PAID", "VOID"];

/** Read-only — Invoice lifecycle সম্পূর্ণ Platform-controlled, company user শুধু নিজের invoice দেখতে পারে (verified)। */
export default function CompanyInvoicesPage() {
  const t = useTranslations("companyInvoices");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useListCompanyInvoicesQuery({
    page,
    search: debouncedSearch || undefined,
    status,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.INVOICE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
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
            options={INVOICE_STATUSES}
            onChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
          />
        </div>

        <DataTable
          columns={companyInvoicesColumns}
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
    </CompanyPermissionGate>
  );
}

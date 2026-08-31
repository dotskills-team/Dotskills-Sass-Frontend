"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSalesQuery } from "@/features/sale/api/sale.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListCustomersQuery } from "@/features/customer/api/customer.api";
import { buildSalesColumns } from "@/features/sale/components/sales-columns";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

const ALL_LOCATIONS = "__all__";

export default function SalesPage() {
  const t = useTranslations("sales");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);

  const { data, isLoading, isFetching, error, refetch } = useListSalesQuery(
    { companyId: companyId ?? "", page, locationId: locationId === ALL_LOCATIONS ? undefined : locationId },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: customers } = useListCustomersQuery(companyId ?? "", { skip: !companyId });

  const columns = buildSalesColumns(locations ?? [], customers ?? [], {
    saleNumber: t("columns.saleNumber"),
    location: t("columns.location"),
    customer: t("columns.customer"),
    total: t("columns.total"),
    status: t("columns.status"),
    date: t("columns.date"),
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Select
            value={locationId}
            onValueChange={(value) => {
              setLocationId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("locationFilterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS}>{t("allLocations")}</SelectItem>
              {(locations ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_CREATE}>
            <Button asChild>
              <Link href="/company/pos">
                <Plus aria-hidden="true" />
                {t("newSale")}
              </Link>
            </Button>
          </CompanyPermissionGate>
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={!companyId || isLoading || isFetching}
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

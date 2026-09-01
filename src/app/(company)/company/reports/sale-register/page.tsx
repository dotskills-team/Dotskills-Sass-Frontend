"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListCustomersQuery } from "@/features/customer/api/customer.api";
import { useGetSaleRegisterQuery, useLazyExportSaleRegisterQuery } from "@/features/reporting/api/reporting.api";
import { buildSaleRegisterColumns } from "@/features/reporting/components/sale-register-columns";
import { DateRangeFilter, ALL_LOCATIONS, getDefaultDateRange } from "@/features/reporting/components/date-range-filter";
import { downloadBlob } from "@/lib/download-blob";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function SaleRegisterReportPage() {
  const t = useTranslations("reports");
  const tPos = useTranslations("pos");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);
  const [{ dateFrom, dateTo }, setDateRange] = useState(getDefaultDateRange());

  const { data, isLoading, isFetching, error, refetch } = useGetSaleRegisterQuery(
    {
      companyId: companyId ?? "",
      dateFrom,
      dateTo,
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
      page,
    },
    { skip: !companyId || !dateFrom || !dateTo },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: customers } = useListCustomersQuery(companyId ?? "", { skip: !companyId });

  const [triggerExport, { isFetching: isExporting }] = useLazyExportSaleRegisterQuery();

  const columns = buildSaleRegisterColumns(locations ?? [], customers ?? [], {
    saleNumber: t("saleRegister.columns.saleNumber"),
    date: t("saleRegister.columns.date"),
    location: t("saleRegister.columns.location"),
    customer: t("saleRegister.columns.customer"),
    status: t("saleRegister.columns.status"),
    subtotal: t("saleRegister.columns.subtotal"),
    discount: t("saleRegister.columns.discount"),
    tax: t("saleRegister.columns.tax"),
    total: t("saleRegister.columns.total"),
  });

  async function handleExport() {
    if (!companyId) return;
    const result = await triggerExport({
      companyId,
      dateFrom,
      dateTo,
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
    });

    if (result.error || !result.data) {
      toast.error(t("exportFailed"));
      return;
    }

    downloadBlob(result.data, `sale-register_${dateFrom}_to_${dateTo}.csv`);
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.REPORT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("saleRegister.title")} description={t("saleRegister.description")} />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={(value) => {
              setDateRange((prev) => ({ ...prev, dateFrom: value }));
              setPage(1);
            }}
            onDateToChange={(value) => {
              setDateRange((prev) => ({ ...prev, dateTo: value }));
              setPage(1);
            }}
            locationId={locationId}
            onLocationChange={(value) => {
              setLocationId(value);
              setPage(1);
            }}
            locations={locations ?? []}
            labels={{
              dateFrom: t("dateFrom"),
              dateTo: t("dateTo"),
              locationPlaceholder: t("locationFilterPlaceholder"),
              allLocations: t("allLocations"),
            }}
          />

          <Button variant="outline" onClick={handleExport} disabled={!companyId || isExporting}>
            {isExporting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isExporting ? t("exporting") : t("exportButton")}
          </Button>
        </div>

        {data?.summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label={t("saleRegister.summary.completedSalesCount")}
              value={data.summary.completedSalesCount}
              icon={Receipt}
            />
            <StatCard
              label={t("saleRegister.summary.totalRevenue")}
              value={Number(data.summary.totalRevenue).toLocaleString()}
              icon={Wallet}
            />
          </div>
        )}

        {data?.summary && data.summary.paymentBreakdown.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("saleRegister.summary.paymentBreakdown")}:</span>
            {data.summary.paymentBreakdown.map((entry) => (
              <Badge key={entry.method} variant="outline" className="tabular-nums">
                {tPos(`paymentMethod.${entry.method}`)} — {Number(entry.amount).toLocaleString()}
              </Badge>
            ))}
          </div>
        )}

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

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Receipt, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useAssignedLocations } from "@/features/location/hooks/use-assigned-locations";
import { useGetProfitReportQuery, useLazyExportProfitReportQuery } from "@/features/reporting/api/reporting.api";
import { buildProfitReportColumns } from "@/features/reporting/components/profit-report-columns";
import { DateRangeFilter, ALL_LOCATIONS, getDefaultDateRange } from "@/features/reporting/components/date-range-filter";
import { downloadBlob } from "@/lib/download-blob";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/**
 * Gated on `PROFIT_REPORT_READ`, deliberately separate from `REPORT_READ`
 * — margin/profit visibility is the one figure an Owner may want hidden
 * from a Branch Manager even while every other report stays visible.
 */
export default function ProfitReportPage() {
  const t = useTranslations("reports");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);
  const [{ dateFrom, dateTo }, setDateRange] = useState(getDefaultDateRange());

  const { data, isLoading, isFetching, error, refetch } = useGetProfitReportQuery(
    {
      companyId: companyId ?? "",
      dateFrom,
      dateTo,
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
      page,
    },
    { skip: !companyId || !dateFrom || !dateTo },
  );
  const { locations } = useAssignedLocations(companyId);

  const [triggerExport, { isFetching: isExporting }] = useLazyExportProfitReportQuery();

  const columns = buildProfitReportColumns({
    date: t("profitReport.columns.date"),
    saleCount: t("profitReport.columns.saleCount"),
    revenue: t("profitReport.columns.revenue"),
    cogs: t("profitReport.columns.cogs"),
    grossProfit: t("profitReport.columns.grossProfit"),
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

    downloadBlob(result.data, `profit-report_${dateFrom}_to_${dateTo}.csv`);
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PROFIT_REPORT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("profitReport.title")} description={t("profitReport.description")} />

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
            locations={locations}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("profitReport.summary.saleCount")} value={data.summary.saleCount} icon={Receipt} />
            <StatCard
              label={t("profitReport.summary.revenue")}
              value={Number(data.summary.revenue).toLocaleString()}
              icon={Wallet}
            />
            <StatCard
              label={t("profitReport.summary.cogs")}
              value={Number(data.summary.cogs).toLocaleString()}
              icon={Wallet}
            />
            <StatCard
              label={t("profitReport.summary.grossProfit")}
              value={Number(data.summary.grossProfit).toLocaleString()}
              icon={TrendingUp}
            />
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

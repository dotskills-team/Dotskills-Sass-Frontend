"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Loader2, Wallet } from "lucide-react";
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
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { useGetPurchaseRegisterQuery, useLazyExportPurchaseRegisterQuery } from "@/features/reporting/api/reporting.api";
import { buildPurchaseRegisterColumns } from "@/features/reporting/components/purchase-register-columns";
import { DateRangeFilter, ALL_LOCATIONS, getDefaultDateRange } from "@/features/reporting/components/date-range-filter";
import { downloadBlob } from "@/lib/download-blob";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function PurchaseRegisterReportPage() {
  const t = useTranslations("reports");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);
  const [{ dateFrom, dateTo }, setDateRange] = useState(getDefaultDateRange());

  const { data, isLoading, isFetching, error, refetch } = useGetPurchaseRegisterQuery(
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
  const { data: suppliers } = useListSuppliersQuery(companyId ?? "", { skip: !companyId });

  const [triggerExport, { isFetching: isExporting }] = useLazyExportPurchaseRegisterQuery();

  const columns = buildPurchaseRegisterColumns(locations, suppliers ?? [], {
    orderNumber: t("purchaseRegister.columns.orderNumber"),
    date: t("purchaseRegister.columns.date"),
    location: t("purchaseRegister.columns.location"),
    supplier: t("purchaseRegister.columns.supplier"),
    status: t("purchaseRegister.columns.status"),
    total: t("purchaseRegister.columns.total"),
    receipts: t("purchaseRegister.columns.receipts"),
    returns: t("purchaseRegister.columns.returns"),
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

    downloadBlob(result.data, `purchase-register_${dateFrom}_to_${dateTo}.csv`);
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.REPORT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("purchaseRegister.title")} description={t("purchaseRegister.description")} />

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label={t("purchaseRegister.summary.activeOrdersCount")}
              value={data.summary.activeOrdersCount}
              icon={ClipboardList}
            />
            <StatCard
              label={t("purchaseRegister.summary.totalOrderedValue")}
              value={Number(data.summary.totalOrderedValue).toLocaleString()}
              icon={Wallet}
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

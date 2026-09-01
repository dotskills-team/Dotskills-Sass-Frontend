"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListStockReportQuery, useLazyExportStockReportQuery } from "@/features/stock-report/api/stock-report.api";
import { buildStockReportColumns } from "@/features/reporting/components/stock-report-columns";
import { ALL_LOCATIONS } from "@/features/reporting/components/date-range-filter";
import { downloadBlob } from "@/lib/download-blob";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/**
 * Full, paginated Stock Report — reuses the exact `useListStockReportQuery`
 * the Location-wise Stock Visibility micro-chunk built, just without its
 * 200-row quick-view cap. The Product→Locations / Location→Products
 * dialogs from that micro-chunk are untouched — this screen is additive.
 */
export default function StockReportPage() {
  const t = useTranslations("reports");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);
  const [belowReorderOnly, setBelowReorderOnly] = useState(false);

  const { data, isLoading, isFetching, error, refetch } = useListStockReportQuery(
    {
      companyId: companyId ?? "",
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
      belowReorderOnly: belowReorderOnly || undefined,
      page,
      limit: 50,
    },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });

  const [triggerExport, { isFetching: isExporting }] = useLazyExportStockReportQuery();

  const columns = buildStockReportColumns({
    product: t("stockReport.columns.product"),
    sku: t("stockReport.columns.sku"),
    location: t("stockReport.columns.location"),
    quantity: t("stockReport.columns.quantity"),
    lowStock: t("stockReport.lowStock"),
  });

  async function handleExport() {
    if (!companyId) return;
    const result = await triggerExport({
      companyId,
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
      belowReorderOnly: belowReorderOnly || undefined,
    });

    if (result.error || !result.data) {
      toast.error(t("exportFailed"));
      return;
    }

    downloadBlob(result.data, "stock-report.csv");
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.REPORT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("stockReport.title")} description={t("stockReport.description")} />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <Select
              value={locationId}
              onValueChange={(value) => {
                setLocationId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56">
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

            <div className="flex items-center gap-2">
              <Switch
                id="below-reorder-only"
                checked={belowReorderOnly}
                onCheckedChange={(checked) => {
                  setBelowReorderOnly(checked);
                  setPage(1);
                }}
              />
              <Label htmlFor="below-reorder-only">{t("stockReport.belowReorderOnly")}</Label>
            </div>
          </div>

          <Button variant="outline" onClick={handleExport} disabled={!companyId || isExporting}>
            {isExporting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isExporting ? t("exporting") : t("exportButton")}
          </Button>
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

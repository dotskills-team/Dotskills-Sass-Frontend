"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, TrendingDown } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
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
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListStockAdjustmentsQuery } from "@/features/stock-adjustment/api/stock-adjustment.api";
import { buildStockAdjustmentsColumns } from "@/features/stock-adjustment/components/stock-adjustments-columns";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import type { StockAdjustmentReason } from "@/types/stock-adjustment";

const ALL_LOCATIONS = "__all__";
const ALL_REASONS = "__all__";
const REASONS: StockAdjustmentReason[] = [
  "COUNT_MISMATCH",
  "DAMAGE",
  "THEFT_SHRINKAGE",
  "EXPIRED",
  "OPENING_STOCK",
  "OTHER",
];

/** Only these 3 are ever counted as a financial loss — COUNT_MISMATCH is a correction (could go either direction), OPENING_STOCK is never a loss. Mirrors the backend's own `LOSS_REASONS` exactly. */
const LOSS_REASONS = ["DAMAGE", "THEFT_SHRINKAGE", "EXPIRED"] as const;

export default function StockAdjustmentsPage() {
  const t = useTranslations("stockAdjustments");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);
  const [reason, setReason] = useState(ALL_REASONS);

  const { data, isLoading, isFetching, error, refetch } = useListStockAdjustmentsQuery(
    {
      companyId: companyId ?? "",
      page,
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
      reason: reason === ALL_REASONS ? undefined : (reason as StockAdjustmentReason),
    },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });

  const columns = buildStockAdjustmentsColumns({
    id: t("history.columns.id"),
    createdAt: t("history.columns.createdAt"),
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_ADJUSTMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        {data?.summary && (
          <div className="mb-6 space-y-3">
            <StatCard
              label={t("history.totalValueLost")}
              value={Number(data.summary.totalValueLost).toLocaleString()}
              icon={TrendingDown}
            />
            <div className="flex flex-wrap items-center gap-2">
              {LOSS_REASONS.map((lossReason) => (
                <Badge key={lossReason} variant="outline" className="tabular-nums">
                  {t(`reason.${lossReason}`)} — {Number(data.summary.valueLostByReason[lossReason]).toLocaleString()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Select
              value={locationId}
              onValueChange={(value) => {
                setLocationId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t("history.locationFilterPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS}>{t("history.allLocations")}</SelectItem>
                {(locations ?? []).map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={reason}
              onValueChange={(value) => {
                setReason(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t("history.reasonFilterPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_REASONS}>{t("history.allReasons")}</SelectItem>
                {REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {t(`reason.${reasonOption}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_ADJUSTMENT_CREATE}>
            <Button asChild>
              <Link href="/company/stock-adjustments/new">
                <Plus aria-hidden="true" />
                {t("newAdjustment")}
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

"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { DataTable } from "@/components/data-table/data-table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSalesQuery } from "@/features/sale/api/sale.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { buildNeedsReviewColumns } from "@/features/sale/components/needs-review-columns";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

/**
 * Owner/Manager inbox for offline-replayed sales whose stock check failed
 * at sync time (see the Offline-Sale feature) — gated behind `SALE_VOID`,
 * the same tier that can approve/reject them, mirroring the backend's own
 * permission choice.
 */
export default function NeedsReviewSalesPage() {
  const t = useTranslations("sales");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data, isLoading, isFetching, error, refetch } = useListSalesQuery(
    { companyId: companyId ?? "", status: "NEEDS_REVIEW" },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });

  const columns = buildNeedsReviewColumns(companyId ?? "", locations ?? [], {
    saleNumber: t("columns.saleNumber"),
    location: t("columns.location"),
    total: t("columns.total"),
    date: t("columns.date"),
    actions: t("needsReview.columns.actions"),
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_VOID} fallback={<PermissionDenied />}>
      <PageHeader title={t("needsReview.title")} description={t("needsReview.description")} />

      <div className="p-6">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={!companyId || isLoading || isFetching}
          error={error}
          onRetry={refetch}
        />
      </div>
    </CompanyPermissionGate>
  );
}

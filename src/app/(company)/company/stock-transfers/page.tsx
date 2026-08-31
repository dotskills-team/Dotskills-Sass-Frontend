"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListStockTransfersQuery } from "@/features/stock-transfer/api/stock-transfer.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListProductsQuery } from "@/features/product/api/product.api";
import { buildStockTransfersColumns } from "@/features/stock-transfer/components/stock-transfers-columns";
import { CreateStockTransferDialog } from "@/features/stock-transfer/components/create-stock-transfer-dialog";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function StockTransfersPage() {
  const t = useTranslations("stockTransfers");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error, refetch } = useListStockTransfersQuery(
    { companyId: companyId ?? "", page },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: products } = useListProductsQuery({ companyId: companyId ?? "", limit: 200 }, { skip: !companyId });

  const columns = buildStockTransfersColumns(companyId ?? "", locations ?? [], products?.items ?? [], {
    product: t("columns.product"),
    fromLocation: t("columns.fromLocation"),
    toLocation: t("columns.toLocation"),
    quantity: t("columns.quantity"),
    status: t("columns.status"),
    createdAt: t("columns.createdAt"),
    actions: t("columns.actions"),
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_TRANSFER_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <CreateStockTransferDialog companyId={companyId ?? ""} locations={locations ?? []} products={products?.items ?? []} />
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

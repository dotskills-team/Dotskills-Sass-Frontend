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

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListPurchaseOrdersQuery } from "@/features/purchase-order/api/purchase-order.api";
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { buildPurchaseOrdersColumns } from "@/features/purchase-order/components/purchase-orders-columns";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function PurchaseOrdersPage() {
  const t = useTranslations("purchaseOrders");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error, refetch } = useListPurchaseOrdersQuery(
    { companyId: companyId ?? "", page },
    { skip: !companyId },
  );
  const { data: suppliers } = useListSuppliersQuery(companyId ?? "", { skip: !companyId });
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });

  const columns = buildPurchaseOrdersColumns(suppliers ?? [], locations ?? [], {
    orderNumber: t("columns.orderNumber"),
    supplier: t("columns.supplier"),
    location: t("columns.location"),
    orderDate: t("columns.orderDate"),
    totalAmount: t("columns.totalAmount"),
    status: t("columns.status"),
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_CREATE}>
            <Button asChild>
              <Link href="/company/purchase-orders/new">
                <Plus aria-hidden="true" />
                {t("createTrigger")}
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

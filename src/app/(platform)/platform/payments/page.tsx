"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { PlatformPermissionGate } from "@/components/shared/permission-gate";
import { StatusFilter } from "@/components/shared/status-filter";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useListPaymentsQuery } from "@/features/payment/api/payment.api";
import { paymentsColumns } from "@/features/payment/components/payments-columns";
import { PLATFORM_PERMISSIONS } from "@/constants/permissions";
import type { PaymentStatus } from "@/types/platform";

const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELLED"];

/** Backend `/platform/payments`-এ `search` param নেই (শুধু status/invoiceId), তাই search box নেই। */
export default function PaymentsPage() {
  const t = useTranslations("payments");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching, error, refetch } = useListPaymentsQuery({ page, status });

  return (
    <PlatformPermissionGate permission={PLATFORM_PERMISSIONS.PAYMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4">
          <StatusFilter
            value={status}
            options={PAYMENT_STATUSES}
            onChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
          />
        </div>

        <DataTable
          columns={paymentsColumns}
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
    </PlatformPermissionGate>
  );
}

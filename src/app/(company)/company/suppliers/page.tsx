"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { CreateSupplierDialog } from "@/features/supplier/components/create-supplier-dialog";
import { SupplierRowActions } from "@/features/supplier/components/supplier-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function SuppliersPage() {
  const t = useTranslations("suppliers");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: suppliers, isLoading, error, refetch } = useListSuppliersQuery(companyId ?? "", {
    skip: !companyId,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUPPLIER_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end gap-2">
          <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUPPLIER_PAYMENT_READ}>
            <Button variant="outline" asChild>
              <Link href="/company/supplier-payments">{t("viewPaymentLedger")}</Link>
            </Button>
          </CompanyPermissionGate>
          {companyId && <CreateSupplierDialog companyId={companyId} />}
        </div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !suppliers || suppliers.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.phone")}</TableHead>
                  <TableHead className="text-right">{t("columns.payableBalance")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium text-foreground">{supplier.name}</TableCell>
                    <TableCell className="text-muted-foreground">{supplier.phone ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {Number(supplier.payableBalance).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={supplier.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <SupplierRowActions companyId={companyId} supplier={supplier} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

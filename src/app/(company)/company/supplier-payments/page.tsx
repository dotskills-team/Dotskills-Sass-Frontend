"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/formatters/date";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { useListSupplierPaymentsQuery } from "@/features/supplier-payment/api/supplier-payment.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

const ALL_SUPPLIERS = "__all__";

export default function SupplierPaymentsPage() {
  const t = useTranslations("supplierPayments");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const [supplierId, setSupplierId] = useState<string>(ALL_SUPPLIERS);

  const { data: suppliers } = useListSuppliersQuery(companyId ?? "", { skip: !companyId });
  const { data: entries, isLoading, error, refetch } = useListSupplierPaymentsQuery(
    { companyId: companyId ?? "", supplierId: supplierId === ALL_SUPPLIERS ? undefined : supplierId },
    { skip: !companyId },
  );

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SUPPLIER_PAYMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SUPPLIERS}>{t("allSuppliers")}</SelectItem>
              {(suppliers ?? []).map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !entries || entries.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.date")}</TableHead>
                  <TableHead>{t("columns.supplier")}</TableHead>
                  <TableHead>{t("columns.type")}</TableHead>
                  <TableHead className="text-right">{t("columns.amount")}</TableHead>
                  <TableHead>{t("columns.note")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {suppliers?.find((s) => s.id === entry.supplierId)?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`entryType.${entry.entryType}`)}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(entry.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.note ?? "—"}</TableCell>
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

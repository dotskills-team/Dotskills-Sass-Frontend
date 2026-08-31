"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListCustomersQuery } from "@/features/customer/api/customer.api";
import { CreateCustomerDialog } from "@/features/customer/components/create-customer-dialog";
import { CustomerRowActions } from "@/features/customer/components/customer-actions";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function CustomersPage() {
  const t = useTranslations("customers");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: customers, isLoading, error, refetch } = useListCustomersQuery(companyId ?? "", {
    skip: !companyId,
  });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CUSTOMER_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">{companyId && <CreateCustomerDialog companyId={companyId} />}</div>

        {!companyId || isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !customers || customers.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.phone")}</TableHead>
                  <TableHead>{t("columns.type")}</TableHead>
                  <TableHead className="text-right">{t("columns.dueBalance")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`type.${customer.customerType}`)}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {Number(customer.dueBalance).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={customer.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <CustomerRowActions companyId={companyId} customer={customer} />
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

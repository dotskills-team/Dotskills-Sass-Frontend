"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useListCustomersQuery } from "@/features/customer/api/customer.api";
import { useListCustomerPaymentsQuery } from "@/features/customer-payment/api/customer-payment.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

const ALL_CUSTOMERS = "__all__";

export default function CustomerPaymentsPage() {
  return (
    <Suspense fallback={null}>
      <CustomerPaymentsPageContent />
    </Suspense>
  );
}

function CustomerPaymentsPageContent() {
  const t = useTranslations("customerPayments");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;
  const searchParams = useSearchParams();
  const [customerId, setCustomerId] = useState<string>(() => searchParams.get("customerId") ?? ALL_CUSTOMERS);

  const { data: customers } = useListCustomersQuery(companyId ?? "", { skip: !companyId });
  const { data: entries, isLoading, error, refetch } = useListCustomerPaymentsQuery(
    { companyId: companyId ?? "", customerId: customerId === ALL_CUSTOMERS ? undefined : customerId },
    { skip: !companyId },
  );

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.CUSTOMER_PAYMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="p-6">
        <div className="mb-4 flex justify-end">
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CUSTOMERS}>{t("allCustomers")}</SelectItem>
              {(customers ?? []).map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
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
                  <TableHead>{t("columns.customer")}</TableHead>
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
                      {customers?.find((c) => c.id === entry.customerId)?.name ?? "—"}
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

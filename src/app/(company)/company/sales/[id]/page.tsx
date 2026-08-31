"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Receipt as ReceiptIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/lib/formatters/date";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListCustomersQuery } from "@/features/customer/api/customer.api";
import { useGetSaleQuery, useListSaleReturnsQuery } from "@/features/sale/api/sale.api";
import { VoidSaleDialog } from "@/features/sale/components/void-sale-dialog";
import { CreateSaleReturnDialog } from "@/features/sale/components/create-sale-return-dialog";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function SaleDetailPage() {
  const t = useTranslations("sales");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: sale, isLoading, error, refetch } = useGetSaleQuery(
    { companyId: companyId ?? "", id: params.id },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: customers } = useListCustomersQuery(companyId ?? "", { skip: !companyId });
  const { data: returns } = useListSaleReturnsQuery(
    { companyId: companyId ?? "", saleId: params.id },
    { skip: !companyId },
  );

  const location = locations?.find((l) => l.id === sale?.locationId);
  const customer = customers?.find((c) => c.id === sale?.customerId);

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={sale?.saleNumber ?? t("title")} description={customer?.name} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/company/sales")}>
          <ArrowLeft aria-hidden="true" />
          {t("detail.backToList")}
        </Button>

        {!companyId || isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !sale ? (
          <EmptyState title={t("empty")} />
        ) : (
          <>
            {sale.status === "VOIDED" && (
              <Alert variant="destructive">
                <AlertTitle>{t("detail.voidAction")}</AlertTitle>
                <AlertDescription>
                  {t("detail.voidedNotice", { date: formatDate(sale.voidedAt), reason: sale.voidReason ?? "" })}
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{sale.saleNumber}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/company/sales/${sale.id}/receipt`}>
                      <ReceiptIcon aria-hidden="true" />
                      {t("detail.receiptAction")}
                    </Link>
                  </Button>
                  {sale.status === "COMPLETED" && (
                    <>
                      <CreateSaleReturnDialog companyId={companyId} sale={sale} />
                      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_VOID}>
                        <VoidSaleDialog companyId={companyId} sale={sale} />
                      </CompanyPermissionGate>
                    </>
                  )}
                  <StatusBadge status={sale.status} />
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-muted-foreground">{t("columns.location")}</dt>
                    <dd className="text-foreground">{location?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("columns.customer")}</dt>
                    <dd className="text-foreground">{customer?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("columns.date")}</dt>
                    <dd className="text-foreground">{formatDate(sale.saleDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("columns.total")}</dt>
                    <dd className="tabular-nums text-foreground">{Number(sale.totalAmount).toLocaleString()}</dd>
                  </div>
                  {sale.note && (
                    <div className="col-span-2 sm:col-span-4">
                      <dt className="text-muted-foreground">{t("detail.noteLabel")}</dt>
                      <dd className="text-foreground">{sale.note}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("detail.itemsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("receipt.item")}</TableHead>
                      <TableHead>{t("receipt.quantity")}</TableHead>
                      <TableHead>{t("receipt.unitPrice")}</TableHead>
                      <TableHead>{t("receipt.lineTotal")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="tabular-nums">{item.quantity}</TableCell>
                        <TableCell className="tabular-nums">{Number(item.unitPrice).toLocaleString()}</TableCell>
                        <TableCell className="tabular-nums">{Number(item.subtotal).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("detail.paymentsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {sale.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="tabular-nums">{Number(payment.amount).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("detail.returnsTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                {!returns || returns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("detail.noReturns")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("columns.date")}</TableHead>
                        <TableHead>{t("returnDialog.reason")}</TableHead>
                        <TableHead>{t("returnDialog.refundAmount")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returns.map((saleReturn) => (
                        <TableRow key={saleReturn.id}>
                          <TableCell>{formatDate(saleReturn.returnDate)}</TableCell>
                          <TableCell>{saleReturn.reason}</TableCell>
                          <TableCell className="tabular-nums">{Number(saleReturn.refundAmount).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

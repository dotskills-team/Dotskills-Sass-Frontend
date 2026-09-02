"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListProductsQuery } from "@/features/product/api/product.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useGetStockAdjustmentQuery } from "@/features/stock-adjustment/api/stock-adjustment.api";
import { formatDateTime } from "@/lib/formatters/date";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function StockAdjustmentDetailPage() {
  const t = useTranslations("stockAdjustments");
  const params = useParams<{ id: string }>();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: batch, isLoading, error, refetch } = useGetStockAdjustmentQuery(
    { companyId: companyId ?? "", id: params.id },
    { skip: !companyId },
  );
  const { data: products } = useListProductsQuery({ companyId: companyId ?? "", limit: 200 }, { skip: !companyId });
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.STOCK_ADJUSTMENT_READ} fallback={<PermissionDenied />}>
      <PageHeader
        title={t("detail.batchTitle")}
        actions={
          <Button variant="outline" asChild>
            <Link href="/company/stock-adjustments">
              <ChevronLeft aria-hidden="true" />
              {t("detail.backToList")}
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {!companyId || isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : batch ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {t("detail.createdAt")}: {formatDateTime(batch.createdAt)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("detail.columns.product")}</TableHead>
                    <TableHead>{t("detail.columns.location")}</TableHead>
                    <TableHead>{t("detail.columns.change")}</TableHead>
                    <TableHead>{t("detail.columns.balanceAfter")}</TableHead>
                    <TableHead>{t("detail.columns.reason")}</TableHead>
                    <TableHead>{t("detail.columns.note")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        {products?.items.find((p) => p.id === line.productId)?.name ?? line.productId}
                      </TableCell>
                      <TableCell>
                        {locations?.find((l) => l.id === line.locationId)?.name ?? line.locationId}
                      </TableCell>
                      <TableCell className="tabular-nums">{Number(line.changeQty).toLocaleString()}</TableCell>
                      <TableCell className="tabular-nums">{Number(line.balanceAfter).toLocaleString()}</TableCell>
                      <TableCell>{t(`reason.${line.reason}`)}</TableCell>
                      <TableCell className="max-w-xs truncate">{line.note ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </CompanyPermissionGate>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/formatters/date";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useGetSaleQuery } from "@/features/sale/api/sale.api";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function SaleReceiptPage() {
  const t = useTranslations("sales");
  const params = useParams<{ id: string }>();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: sale, isLoading, error, refetch } = useGetSaleQuery(
    { companyId: companyId ?? "", id: params.id },
    { skip: !companyId },
  );
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const location = locations?.find((l) => l.id === sale?.locationId);

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.SALE_READ} fallback={<PermissionDenied />}>
      <PageHeader title={t("receipt.confirmedTitle")} />

      <div className="space-y-4 p-6">
        {!companyId || isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !sale ? (
          <EmptyState title={t("receipt.notFoundTitle")} />
        ) : (
          <>
            <Alert>
              <AlertTitle>{t("receipt.confirmedTitle")}</AlertTitle>
              <AlertDescription>{t("receipt.confirmedDescription", { saleNumber: sale.saleNumber })}</AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => window.print()}>
                <Printer aria-hidden="true" />
                {t("receipt.printButton")}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/company/sales/${sale.id}`}>{t("receipt.backToDetail")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/company/pos">{t("receipt.newSaleButton")}</Link>
              </Button>
            </div>

            <div className="print-area mx-auto max-w-sm rounded-lg border border-border bg-card p-4 text-sm shadow-sm">
              <div className="mb-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage src={company?.logoUrl ?? undefined} alt={company?.companyName ?? ""} />
                    <AvatarFallback>{(company?.companyName?.trim()[0] ?? "?").toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{company?.companyName}</span>
                </div>
                <div className="text-base font-semibold">{location?.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{sale.saleNumber}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(sale.saleDate)}</div>
              </div>

              <div className="space-y-1 border-t border-dashed border-border py-2">
                {sale.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="tabular-nums">{Number(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-t border-dashed border-border py-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("receipt.subtotal")}</span>
                  <span className="tabular-nums">{Number(sale.subtotal).toLocaleString()}</span>
                </div>
                {Number(sale.itemDiscountTotal) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("receipt.itemDiscount")}</span>
                    <span className="tabular-nums">-{Number(sale.itemDiscountTotal).toLocaleString()}</span>
                  </div>
                )}
                {Number(sale.saleDiscountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("receipt.saleDiscount")}</span>
                    <span className="tabular-nums">-{Number(sale.saleDiscountAmount).toLocaleString()}</span>
                  </div>
                )}
                {Number(sale.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("receipt.tax")}</span>
                    <span className="tabular-nums">{Number(sale.taxAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold">
                  <span>{t("receipt.total")}</span>
                  <span className="tabular-nums">{Number(sale.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1 border-t border-dashed border-border py-2">
                <div className="font-medium">{t("receipt.paymentsTitle")}</div>
                {sale.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between">
                    <span className="text-muted-foreground">{payment.method}</span>
                    <span className="tabular-nums">{Number(payment.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-center text-xs text-muted-foreground">{t("receipt.thankYou")}</div>
            </div>
          </>
        )}
      </div>
    </CompanyPermissionGate>
  );
}

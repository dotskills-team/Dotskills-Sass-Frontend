"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

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
import { formatDate } from "@/lib/formatters/date";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListProductsQuery } from "@/features/product/api/product.api";
import { useGetPurchaseOrderQuery, useListPurchaseReturnsQuery } from "@/features/purchase-order/api/purchase-order.api";
import { CancelPurchaseOrderDialog } from "@/features/purchase-order/components/cancel-purchase-order-dialog";
import { ReceiveGoodsDialog } from "@/features/purchase-order/components/receive-goods-dialog";
import { CreatePurchaseReturnDialog } from "@/features/purchase-order/components/create-purchase-return-dialog";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

export default function PurchaseOrderDetailPage() {
  const t = useTranslations("purchaseOrders");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: order, isLoading, error, refetch } = useGetPurchaseOrderQuery(
    { companyId: companyId ?? "", id: params.id },
    { skip: !companyId },
  );
  const { data: suppliers } = useListSuppliersQuery(companyId ?? "", { skip: !companyId });
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: products } = useListProductsQuery({ companyId: companyId ?? "", limit: 200 }, { skip: !companyId });
  const { data: returns } = useListPurchaseReturnsQuery(
    { companyId: companyId ?? "", purchaseOrderId: params.id },
    { skip: !companyId },
  );

  const supplier = suppliers?.find((s) => s.id === order?.supplierId);
  const location = locations?.find((l) => l.id === order?.locationId);

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_READ} fallback={<PermissionDenied />}>
      <PageHeader title={order?.orderNumber ?? t("title")} description={supplier?.name} />

      <div className="space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/company/purchase-orders")}>
          <ArrowLeft aria-hidden="true" />
          {t("detail.backToList")}
        </Button>

        {!companyId || isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !order ? (
          <EmptyState title={t("empty")} />
        ) : (
          <>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{order.orderNumber}</CardTitle>
                <div className="flex items-center gap-2">
                  {order.status === "DRAFT" && (
                    <>
                      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_UPDATE}>
                        <Button variant="outline" asChild>
                          <Link href={`/company/purchase-orders/${order.id}/edit`}>{t("detail.editTitle")}</Link>
                        </Button>
                      </CompanyPermissionGate>
                      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_CANCEL}>
                        <CancelPurchaseOrderDialog companyId={companyId} order={order} />
                      </CompanyPermissionGate>
                    </>
                  )}
                  {/* Backend only rejects receiving against CANCELLED — DRAFT is receivable too (verified purchase-order.service.ts's receive()), the dialog itself self-hides once nothing remains. */}
                  {order.status !== "CANCELLED" && products && (
                    <ReceiveGoodsDialog companyId={companyId} order={order} products={products.items} />
                  )}
                  {products && <CreatePurchaseReturnDialog companyId={companyId} order={order} products={products.items} />}
                  <StatusBadge status={order.status} />
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-muted-foreground">{t("columns.supplier")}</dt>
                    <dd className="text-foreground">{supplier?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("columns.location")}</dt>
                    <dd className="text-foreground">{location?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("columns.orderDate")}</dt>
                    <dd className="text-foreground">{formatDate(order.orderDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("columns.totalAmount")}</dt>
                    <dd className="tabular-nums text-foreground">{Number(order.totalAmount).toLocaleString()}</dd>
                  </div>
                  {order.note && (
                    <div className="col-span-2 sm:col-span-4">
                      <dt className="text-muted-foreground">{t("detail.noteLabel")}</dt>
                      <dd className="text-foreground">{order.note}</dd>
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
                      <TableHead>{t("form.product")}</TableHead>
                      <TableHead>{t("form.orderedQty")}</TableHead>
                      <TableHead>{t("form.unitCost")}</TableHead>
                      <TableHead>{t("form.lineTotal")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => {
                      const product = products?.items.find((p) => p.id === item.productId);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{product?.name ?? item.productId}</TableCell>
                          <TableCell className="tabular-nums">
                            {t("detail.orderedVsReceived", { received: item.receivedQty, ordered: item.orderedQty })}
                          </TableCell>
                          <TableCell className="tabular-nums">{Number(item.unitCost).toLocaleString()}</TableCell>
                          <TableCell className="tabular-nums">
                            {(Number(item.orderedQty) * Number(item.unitCost)).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                        <TableHead>{t("columns.orderDate")}</TableHead>
                        <TableHead>{t("returnDialog.reason")}</TableHead>
                        <TableHead>{t("returnDialog.refundAmount")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returns.map((purchaseReturn) => (
                        <TableRow key={purchaseReturn.id}>
                          <TableCell>{formatDate(purchaseReturn.returnDate)}</TableCell>
                          <TableCell>{purchaseReturn.reason}</TableCell>
                          <TableCell className="tabular-nums">{Number(purchaseReturn.refundAmount).toLocaleString()}</TableCell>
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

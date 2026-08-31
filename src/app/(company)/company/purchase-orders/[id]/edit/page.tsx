"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListProductsQuery } from "@/features/product/api/product.api";
import { useGetPurchaseOrderQuery, useUpdatePurchaseOrderMutation } from "@/features/purchase-order/api/purchase-order.api";
import { PurchaseOrderForm } from "@/features/purchase-order/components/purchase-order-form";
import { toPurchaseOrderPayload } from "@/features/purchase-order/lib/purchase-order-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PurchaseOrderFormValues } from "@/features/purchase-order/schemas/purchase-order.schema";

/** Only reachable for a DRAFT order server-side (`Only a DRAFT purchase order can be edited`) — the update call surfaces that via the Gap 3 translation layer if reached out of state. */
export default function EditPurchaseOrderPage() {
  const t = useTranslations("purchaseOrders");
  const tCommon = useTranslations("common");
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
  const [updatePurchaseOrder, { isLoading: isSubmitting }] = useUpdatePurchaseOrderMutation();

  async function handleSubmit(values: PurchaseOrderFormValues) {
    if (!companyId || !order) return;
    const payload = toPurchaseOrderPayload(values);
    const result = await updatePurchaseOrder({
      companyId,
      id: order.id,
      body: { locationId: payload.locationId, orderDate: payload.orderDate, note: payload.note, items: payload.items },
    });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.editSuccess"));
    router.push(`/company/purchase-orders/${order.id}`);
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_UPDATE} fallback={<PermissionDenied />}>
      <PageHeader title={order ? t("detail.editTitle") : t("title")} description={order?.orderNumber} />

      <div className="mx-auto max-w-3xl p-6">
        {!companyId || isLoading || !suppliers || !locations || !products ? (
          <Skeleton className="h-96 w-full" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : order ? (
          <PurchaseOrderForm
            defaultValues={{
              supplierId: order.supplierId,
              locationId: order.locationId,
              orderDate: order.orderDate ? order.orderDate.slice(0, 10) : "",
              note: order.note ?? "",
              items: order.items.map((item) => ({
                productId: item.productId,
                orderedQty: item.orderedQty,
                unitCost: item.unitCost,
              })),
            }}
            suppliers={suppliers}
            locations={locations}
            products={products.items}
            isSupplierEditable={false}
            isSubmitting={isSubmitting}
            submitLabel={t("form.submitEdit")}
            cancelLabel={tCommon("cancel")}
            onCancel={() => router.push(`/company/purchase-orders/${order.id}`)}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </CompanyPermissionGate>
  );
}

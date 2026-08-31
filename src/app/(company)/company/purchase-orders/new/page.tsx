"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { Skeleton } from "@/components/ui/skeleton";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { useListSuppliersQuery } from "@/features/supplier/api/supplier.api";
import { useListLocationsQuery } from "@/features/location/api/location.api";
import { useListProductsQuery } from "@/features/product/api/product.api";
import { useCreatePurchaseOrderMutation } from "@/features/purchase-order/api/purchase-order.api";
import { PurchaseOrderForm } from "@/features/purchase-order/components/purchase-order-form";
import { toPurchaseOrderPayload } from "@/features/purchase-order/lib/purchase-order-form-mapper";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";
import { normalizeApiError } from "@/lib/api-error";
import type { PurchaseOrderFormValues } from "@/features/purchase-order/schemas/purchase-order.schema";

const EMPTY_VALUES: PurchaseOrderFormValues = {
  supplierId: "",
  locationId: "",
  orderDate: "",
  note: "",
  items: [{ productId: "", orderedQty: "", unitCost: "" }],
};

/** Full page, not a Dialog — a deliberate departure from every other entity's create flow (see Frontend Phase 2 plan) since a variable-length item list needs real vertical space. */
export default function NewPurchaseOrderPage() {
  const t = useTranslations("purchaseOrders");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const { data: suppliers } = useListSuppliersQuery(companyId ?? "", { skip: !companyId });
  const { data: locations } = useListLocationsQuery(companyId ?? "", { skip: !companyId });
  const { data: products } = useListProductsQuery({ companyId: companyId ?? "", limit: 200 }, { skip: !companyId });
  const [createPurchaseOrder, { isLoading }] = useCreatePurchaseOrderMutation();

  async function handleSubmit(values: PurchaseOrderFormValues) {
    if (!companyId) return;
    const result = await createPurchaseOrder({ companyId, body: toPurchaseOrderPayload(values) });

    if ("error" in result) {
      toast.error(normalizeApiError(result.error).message);
      return;
    }

    toast.success(t("form.createSuccess"));
    router.push(`/company/purchase-orders/${result.data.id}`);
  }

  return (
    <CompanyPermissionGate permission={COMPANY_PERMISSIONS.PURCHASE_ORDER_CREATE} fallback={<PermissionDenied />}>
      <PageHeader title={t("form.createTitle")} description={t("form.createDescription")} />

      <div className="mx-auto max-w-3xl p-6">
        {!companyId || !suppliers || !locations || !products ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <PurchaseOrderForm
            defaultValues={EMPTY_VALUES}
            suppliers={suppliers}
            locations={locations}
            products={products.items}
            isSupplierEditable
            isSubmitting={isLoading}
            submitLabel={t("form.submit")}
            cancelLabel={tCommon("cancel")}
            onCancel={() => router.push("/company/purchase-orders")}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </CompanyPermissionGate>
  );
}

import type { PurchaseOrderFormValues } from "@/features/purchase-order/schemas/purchase-order.schema";

export interface PurchaseOrderMutationPayload {
  supplierId: string;
  locationId: string;
  orderDate?: string;
  note?: string;
  items: { productId: string; orderedQty: number; unitCost: number }[];
}

export function toPurchaseOrderPayload(values: PurchaseOrderFormValues): PurchaseOrderMutationPayload {
  return {
    supplierId: values.supplierId,
    locationId: values.locationId,
    orderDate: values.orderDate || undefined,
    note: values.note?.trim() || undefined,
    items: values.items.map((item) => ({
      productId: item.productId,
      orderedQty: Number(item.orderedQty),
      unitCost: Number(item.unitCost),
    })),
  };
}

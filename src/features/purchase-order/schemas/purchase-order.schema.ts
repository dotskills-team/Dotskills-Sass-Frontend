import { z } from "zod";

/** Backend `CreatePurchaseOrderDto`/`PurchaseOrderItemInputDto` mirrored exactly (verified purchase-order/dto/purchase-order.dto.ts). */
export interface PurchaseOrderFormMessages {
  supplierRequired: string;
  locationRequired: string;
  itemsMinOne: string;
  productRequired: string;
  orderedQtyPositive: string;
  unitCostNonNegative: string;
}

export function createPurchaseOrderSchema(messages: PurchaseOrderFormMessages) {
  return z.object({
    supplierId: z.string({ error: messages.supplierRequired }).min(1, { error: messages.supplierRequired }),
    locationId: z.string({ error: messages.locationRequired }).min(1, { error: messages.locationRequired }),
    orderDate: z.string().optional().or(z.literal("")),
    note: z.string().max(2000).optional().or(z.literal("")),
    items: z
      .array(
        z.object({
          productId: z.string({ error: messages.productRequired }).min(1, { error: messages.productRequired }),
          orderedQty: z
            .string()
            .min(1, { error: messages.orderedQtyPositive })
            .refine((value) => Number(value) > 0, { error: messages.orderedQtyPositive }),
          unitCost: z
            .string()
            .min(1, { error: messages.unitCostNonNegative })
            .refine((value) => Number(value) >= 0, { error: messages.unitCostNonNegative }),
        }),
      )
      .min(1, { error: messages.itemsMinOne }),
  });
}

export type PurchaseOrderFormValues = z.infer<ReturnType<typeof createPurchaseOrderSchema>>;

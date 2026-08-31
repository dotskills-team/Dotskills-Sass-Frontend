import { z } from "zod";

/** Backend `CreateStockTransferDto` mirrored exactly (verified stock-transfer.dto.ts): fromLocationId/toLocationId/productId UUID, quantity > 0 (max 4 decimals) and must differ from toLocationId (service-level check, re-asserted client-side for immediate feedback). */
export interface StockTransferFormMessages {
  fromLocationRequired: string;
  toLocationRequired: string;
  sameLocation: string;
  productRequired: string;
  quantityPositive: string;
}

export function createStockTransferSchema(messages: StockTransferFormMessages) {
  return z
    .object({
      fromLocationId: z.string().min(1, { error: messages.fromLocationRequired }),
      toLocationId: z.string().min(1, { error: messages.toLocationRequired }),
      productId: z.string().min(1, { error: messages.productRequired }),
      quantity: z
        .string()
        .min(1, { error: messages.quantityPositive })
        .refine((value) => Number(value) > 0, { error: messages.quantityPositive }),
    })
    .refine((data) => !data.fromLocationId || data.fromLocationId !== data.toLocationId, {
      error: messages.sameLocation,
      path: ["toLocationId"],
    });
}

export type StockTransferFormValues = z.infer<ReturnType<typeof createStockTransferSchema>>;

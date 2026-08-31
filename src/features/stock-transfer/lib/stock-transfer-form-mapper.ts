import type { StockTransferFormValues } from "@/features/stock-transfer/schemas/stock-transfer.schema";

export interface StockTransferMutationPayload {
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  quantity: number;
}

export function toStockTransferPayload(values: StockTransferFormValues): StockTransferMutationPayload {
  return {
    fromLocationId: values.fromLocationId,
    toLocationId: values.toLocationId,
    productId: values.productId,
    quantity: Number(values.quantity),
  };
}

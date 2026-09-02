import type { CreateStockAdjustmentLineInput, StockAdjustmentReason } from "@/types/stock-adjustment";
import type { BulkStockAdjustmentLineValues } from "@/features/stock-adjustment/schemas/bulk-stock-adjustment.schema";

export function toBulkStockAdjustmentPayload(
  values: BulkStockAdjustmentLineValues[],
): CreateStockAdjustmentLineInput[] {
  return values.map((line) => ({
    productId: line.productId,
    locationId: line.locationId,
    ...(line.mode === "newQuantity"
      ? { newQuantity: Number(line.newQuantity) }
      : { changeQuantity: Number(line.changeQuantity) }),
    reason: line.reason as StockAdjustmentReason,
    note: line.note?.trim() || undefined,
  }));
}

export type StockAdjustmentReason =
  | "DAMAGE"
  | "THEFT_SHRINKAGE"
  | "COUNT_MISMATCH"
  | "EXPIRED"
  | "OPENING_STOCK"
  | "OTHER";

/** `POST /companies/:companyId/stock-adjustments` request line — exactly one of `newQuantity`/`changeQuantity`. */
export interface CreateStockAdjustmentLineInput {
  productId: string;
  locationId: string;
  newQuantity?: number;
  changeQuantity?: number;
  reason: StockAdjustmentReason;
  note?: string;
}

/** Per-line outcome (verified `StockAdjustmentService.applyLine()`) — a bulk submission's expected shape is a mix of both. */
export interface StockAdjustmentLineResult {
  index: number;
  productId: string;
  locationId: string;
  status: "APPLIED" | "ERROR";
  errorMessage?: string;
  beforeQuantity?: string;
  afterQuantity?: string;
  changeQty?: string;
  movementId?: string;
}

export interface CreateStockAdjustmentResult {
  batchId: string;
  lines: StockAdjustmentLineResult[];
  summary: { appliedCount: number; errorCount: number };
}

/** `GET /companies/:companyId/stock-adjustments` item — the batch header (verified `stock-adjustment.service.ts`). */
export interface StockAdjustmentBatch {
  id: string;
  tenantId: string;
  companyId: string;
  actorUserId: string | null;
  createdAt: string;
}

/** One `StockMovement` row (`movementType: ADJUSTMENT`) as returned in a batch's `lines[]`. */
export interface StockAdjustmentMovementLine {
  id: string;
  productId: string;
  locationId: string;
  movementType: "ADJUSTMENT";
  changeQty: string;
  balanceAfter: string;
  unitCost: string | null;
  reason: StockAdjustmentReason;
  referenceId: string;
  actorUserId: string | null;
  note: string | null;
  createdAt: string;
}

export interface StockAdjustmentBatchDetail extends StockAdjustmentBatch {
  lines: StockAdjustmentMovementLine[];
}

/** `list()`'s `summary` field — quantity×cost for the 3 loss reasons only (DAMAGE/THEFT_SHRINKAGE/EXPIRED), respecting whatever locationId/productId/reason filter is active. */
export interface StockAdjustmentValueLostSummary {
  totalValueLost: string;
  valueLostByReason: {
    DAMAGE: string;
    THEFT_SHRINKAGE: string;
    EXPIRED: string;
  };
}

export interface ListStockAdjustmentsResult {
  items: StockAdjustmentBatch[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  summary: StockAdjustmentValueLostSummary;
}

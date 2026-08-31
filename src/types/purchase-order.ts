export type PurchaseOrderStatus = "DRAFT" | "PARTIALLY_RECEIVED" | "FULLY_RECEIVED" | "CANCELLED";

/** `PurchaseOrderItem` as nested in `PO_SELECT` (verified purchase-order.service.ts). */
export interface PurchaseOrderItem {
  id: string;
  productId: string;
  orderedQty: string;
  receivedQty: string;
  unitCost: string;
}

/** `GET /companies/:companyId/purchase-orders` item / `findOne` (verified `PO_SELECT`). */
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  locationId: string;
  orderNumber: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  totalAmount: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
}

/** `receive()`'s created row (verified purchase-order.service.ts — full row, no select). */
export interface GoodsReceipt {
  id: string;
  tenantId: string;
  companyId: string;
  purchaseOrderId: string;
  receivedDate: string;
  billImageUrl: string | null;
  actorUserId: string | null;
  createdAt: string;
}

/** `GET /companies/:companyId/purchase-orders/returns` item / `createReturn()`'s created row (verified — full row, no select). */
export interface PurchaseReturn {
  id: string;
  tenantId: string;
  companyId: string;
  purchaseOrderId: string;
  reason: string;
  refundAmount: string;
  returnDate: string;
  actorUserId: string | null;
  createdAt: string;
}

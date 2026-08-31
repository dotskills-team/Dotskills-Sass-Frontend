export type StockTransferStatus = "PENDING" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";

/** `GET /companies/:companyId/stock-transfers` item (verified `TRANSFER_SELECT` in stock-transfer.service.ts). */
export interface StockTransfer {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  quantity: string;
  status: StockTransferStatus;
  dispatchedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

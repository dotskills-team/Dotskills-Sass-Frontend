/** `GET /companies/:companyId/reports/stock` item (verified `StockReportService.getStockReport()` — `?locationId=`/`?productId=` filter either direction). */
export interface StockReportEntry {
  id: string;
  productId: string;
  locationId: string;
  quantity: string;
  product: {
    name: string;
    sku: string;
    reorderLevel: string;
    status: string;
  };
  location: {
    name: string;
  };
  belowReorderLevel: boolean;
}

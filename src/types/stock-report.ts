/** `GET /companies/:companyId/reports/stock` item (verified `StockReportService.getStockReport()` — `?locationId=`/`?productId=` filter either direction). */
export interface StockReportSales {
  soldQuantity: string; // Prisma Decimal JSON-e string hoye ashe
  soldAmount: string;
  saleCount: number;
  avgSellingPrice: string | null;
}


export interface StockReportEntry {
  id: string;
  productId: string;
  variantId: string | null;
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
  /** "T-Shirt — Red / S" for a variant row, "T-Shirt" for a plain product — computed server-side, always prefer this over `product.name` for display. */
  displayName: string;
  belowReorderLevel: boolean;
    sales?: StockReportSales; // dateFrom + dateTo dile tabei thakbe

}

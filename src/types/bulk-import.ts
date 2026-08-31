export interface BulkImportProductRow {
  sku?: string;
  name?: string;
  categoryName?: string;
  unitCode?: string;
  barcode?: string;
  costPrice?: string;
  salePrice?: string;
  reorderLevel?: string;
  sellByWeight?: string;
}

export type BulkImportRowStatus = "CREATE" | "UPDATE" | "ERROR";

/** Backend `BulkImportRowResult` mirrored exactly (verified product-bulk-import.service.ts). */
export interface BulkImportRowResult {
  rowIndex: number;
  status: BulkImportRowStatus;
  sku?: string;
  errorMessage?: string;
  resolvedProductId?: string;
  categoryWillBeCreated?: boolean;
}

export interface BulkImportSummary {
  results: BulkImportRowResult[];
  createdCount: number;
  updatedCount: number;
  errorCount: number;
}

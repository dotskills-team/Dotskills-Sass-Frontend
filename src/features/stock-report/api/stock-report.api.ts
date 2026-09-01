import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { StockReportEntry } from "@/types/stock-report";

export interface ListStockReportParams {
  companyId: string;
  productId?: string;
  locationId?: string;
  /** Frontend Phase 5's full Stock Report screen — real pagination, not the micro-chunk dialogs' 200-row quick-view cap. */
  page?: number;
  belowReorderOnly?: boolean;
  limit?: number;
}

export type ExportStockReportParams = Omit<ListStockReportParams, "page" | "limit">;

/**
 * `companies/:companyId/reports/stock` — the Location-wise Stock
 * Visibility micro-chunk's read path, reusing the already-correct
 * `StockReportService` (Backend Phase 6) with one mirrored additive
 * filter (`productId`, alongside the existing `locationId`). No RTK tag:
 * a pure read with nothing anywhere invalidating it.
 */
export const stockReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listStockReport: builder.query<ListResult<StockReportEntry>, ListStockReportParams>({
      query: ({ companyId, productId, locationId, page, belowReorderOnly, limit }) => ({
        url: `/companies/${companyId}/reports/stock`,
        params: { productId, locationId, page, belowReorderOnly, limit },
      }),
      transformResponse: (response: { data: StockReportEntry[]; pagination: ListResult<StockReportEntry>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
    }),

    /** Streams the full filtered result (never paginated) — reuses the exact same filters as `listStockReport`. */
    exportStockReport: builder.query<Blob, ExportStockReportParams>({
      query: ({ companyId, productId, locationId, belowReorderOnly }) => ({
        url: `/companies/${companyId}/reports/stock/export`,
        params: { productId, locationId, belowReorderOnly },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const { useListStockReportQuery, useLazyExportStockReportQuery } = stockReportApi;

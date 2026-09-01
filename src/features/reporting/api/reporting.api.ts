import { baseApi } from "@/store/api/base-api";
import type { SaleRegisterResult } from "@/types/sale-register";
import type { PurchaseRegisterResult } from "@/types/purchase-register";
import type { ProfitReportResult } from "@/types/profit-report";
import type { CustomerDueSummaryEntry, SupplierPayableSummaryEntry } from "@/types/ledger-summary";
import type { ListResult } from "@/types/list-result";

export interface DateRangeReportParams {
  companyId: string;
  dateFrom: string;
  dateTo: string;
  locationId?: string;
  page?: number;
  limit?: number;
}

/** Export routes stream the full range (no pagination) — `page`/`limit` are never sent. */
export type DateRangeExportParams = Omit<DateRangeReportParams, "page" | "limit">;

export interface LedgerSummaryParams {
  companyId: string;
  page?: number;
  limit?: number;
}

interface BackendReportListResponse<TItem, TSummary> {
  success: boolean;
  data: TItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary: TSummary;
}

interface BackendPaginatedResponse<TItem> {
  success: boolean;
  data: TItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * `companies/:companyId/reports/*` — pure read/export UI over Backend
 * Phase 6's already-correct, already-live-verified report services. Export
 * endpoints reuse `baseQueryWithReauth`'s existing auth-header/401-refresh
 * plumbing via `responseHandler: 'blob'`, rather than a hand-rolled
 * parallel `fetch()` — see Frontend Phase 5 plan, question 3. Every export
 * is a plain `query` (not `mutation`) triggered through `useLazy*Query`,
 * since a CSV download reads data, it doesn't change it.
 */
export const reportingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSaleRegister: builder.query<SaleRegisterResult, DateRangeReportParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/sale-register`,
        params,
      }),
      transformResponse: (response: BackendReportListResponse<SaleRegisterResult["items"][number], SaleRegisterResult["summary"]>) => ({
        items: response.data,
        meta: response.pagination,
        summary: response.summary,
      }),
    }),

    exportSaleRegister: builder.query<Blob, DateRangeExportParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/sale-register/export`,
        params,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    getPurchaseRegister: builder.query<PurchaseRegisterResult, DateRangeReportParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/purchase-register`,
        params,
      }),
      transformResponse: (
        response: BackendReportListResponse<PurchaseRegisterResult["items"][number], PurchaseRegisterResult["summary"]>,
      ) => ({
        items: response.data,
        meta: response.pagination,
        summary: response.summary,
      }),
    }),

    exportPurchaseRegister: builder.query<Blob, DateRangeExportParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/purchase-register/export`,
        params,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    getProfitReport: builder.query<ProfitReportResult, DateRangeReportParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/profit`,
        params,
      }),
      transformResponse: (
        response: BackendReportListResponse<ProfitReportResult["items"][number], ProfitReportResult["summary"]>,
      ) => ({
        items: response.data,
        meta: response.pagination,
        summary: response.summary,
      }),
    }),

    exportProfitReport: builder.query<Blob, DateRangeExportParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/profit/export`,
        params,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    getCustomerDueSummary: builder.query<ListResult<CustomerDueSummaryEntry>, LedgerSummaryParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/customer-due-summary`,
        params,
      }),
      transformResponse: (response: BackendPaginatedResponse<CustomerDueSummaryEntry>) => ({
        items: response.data,
        meta: response.pagination,
      }),
    }),

    exportCustomerDueSummary: builder.query<Blob, { companyId: string }>({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/reports/customer-due-summary/export`,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    getSupplierPayableSummary: builder.query<ListResult<SupplierPayableSummaryEntry>, LedgerSummaryParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/reports/supplier-payable-summary`,
        params,
      }),
      transformResponse: (response: BackendPaginatedResponse<SupplierPayableSummaryEntry>) => ({
        items: response.data,
        meta: response.pagination,
      }),
    }),

    exportSupplierPayableSummary: builder.query<Blob, { companyId: string }>({
      query: ({ companyId }) => ({
        url: `/companies/${companyId}/reports/supplier-payable-summary/export`,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetSaleRegisterQuery,
  useLazyExportSaleRegisterQuery,
  useGetPurchaseRegisterQuery,
  useLazyExportPurchaseRegisterQuery,
  useGetProfitReportQuery,
  useLazyExportProfitReportQuery,
  useGetCustomerDueSummaryQuery,
  useLazyExportCustomerDueSummaryQuery,
  useGetSupplierPayableSummaryQuery,
  useLazyExportSupplierPayableSummaryQuery,
} = reportingApi;

import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { Sale, SaleReturn, SaleStatus } from "@/types/sale";

export interface ListSalesParams {
  companyId: string;
  page?: number;
  limit?: number;
  locationId?: string;
  status?: SaleStatus;
}

export interface SaleItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
  serialNote?: string;
}

export interface SalePaymentInput {
  method: "CASH" | "CARD" | "BKASH" | "NAGAD" | "DUE";
  amount: number;
}

export interface CreateSalePayload {
  locationId: string;
  customerId?: string;
  items: SaleItemInput[];
  saleDiscountAmount?: number;
  payments: SalePaymentInput[];
  note?: string;
  /** Sent only when replaying a sale that was queued offline — omit for a normal, real-time sale. */
  idempotencyKey?: string;
}

export interface CreateSaleResult {
  sale: Sale;
  warnings: string[];
}

export interface CreateSaleReturnPayload {
  reason: string;
  refundAmount?: number;
  items: { productId: string; variantId?: string; quantity: number }[];
}

/** `companies/:companyId/sales` — paginated (backend Frontend Phase 3 addition, mirrors PurchaseOrder/StockTransfer's shape). */
export const saleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSales: builder.query<ListResult<Sale>, ListSalesParams>({
      query: ({ companyId, page, limit, locationId, status }) => ({
        url: `/companies/${companyId}/sales`,
        params: { page, limit, locationId, status },
      }),
      transformResponse: (response: { data: Sale[]; pagination: ListResult<Sale>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
      providesTags: ["Sale", "CompanyScoped"],
    }),

    getSale: builder.query<Sale, { companyId: string; id: string }>({
      query: ({ companyId, id }) => `/companies/${companyId}/sales/${id}`,
      transformResponse: (response: { data: Sale }) => response.data,
      providesTags: ["Sale"],
    }),

    createSale: builder.mutation<CreateSaleResult, { companyId: string; body: CreateSalePayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/sales`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: Sale; warnings?: string[] }) => ({
        sale: response.data,
        warnings: response.warnings ?? [],
      }),
      invalidatesTags: ["Sale", "Product", "Dashboard"],
    }),

    voidSale: builder.mutation<Sale, { companyId: string; id: string; body: { reason: string } }>({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/sales/${id}/void`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: Sale }) => response.data,
      invalidatesTags: ["Sale", "Product", "Dashboard"],
    }),

    approveNeedsReviewSale: builder.mutation<Sale, { companyId: string; id: string }>({
      query: ({ companyId, id }) => ({
        url: `/companies/${companyId}/sales/${id}/approve`,
        method: "POST",
      }),
      transformResponse: (response: { data: Sale }) => response.data,
      invalidatesTags: ["Sale", "Product", "Dashboard"],
    }),

    rejectNeedsReviewSale: builder.mutation<Sale, { companyId: string; id: string; body: { reason: string } }>({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/sales/${id}/reject`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: Sale }) => response.data,
      invalidatesTags: ["Sale", "Customer", "Dashboard"],
    }),

    createSaleReturn: builder.mutation<SaleReturn, { companyId: string; id: string; body: CreateSaleReturnPayload }>({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/sales/${id}/returns`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: SaleReturn }) => response.data,
      invalidatesTags: ["Sale", "SaleReturn", "Product", "Dashboard"],
    }),

    listSaleReturns: builder.query<SaleReturn[], { companyId: string; saleId?: string }>({
      query: ({ companyId, saleId }) => ({
        url: `/companies/${companyId}/sales/returns`,
        params: saleId ? { saleId } : undefined,
      }),
      transformResponse: (response: { data: SaleReturn[] }) => response.data,
      providesTags: ["SaleReturn"],
    }),
  }),
});

export const {
  useListSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useVoidSaleMutation,
  useApproveNeedsReviewSaleMutation,
  useRejectNeedsReviewSaleMutation,
  useCreateSaleReturnMutation,
  useListSaleReturnsQuery,
} = saleApi;

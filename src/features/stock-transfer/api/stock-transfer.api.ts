import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { StockTransfer } from "@/types/stock-transfer";
import type { StockTransferMutationPayload } from "@/features/stock-transfer/lib/stock-transfer-form-mapper";

export interface ListStockTransfersParams {
  companyId: string;
  page?: number;
  limit?: number;
}

/** `companies/:companyId/stock-transfers` — paginated (backend Frontend Phase 2 addition, mirrors PurchaseOrder's shape). */
export const stockTransferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listStockTransfers: builder.query<ListResult<StockTransfer>, ListStockTransfersParams>({
      query: ({ companyId, page, limit }) => ({
        url: `/companies/${companyId}/stock-transfers`,
        params: { page, limit },
      }),
      transformResponse: (response: { data: StockTransfer[]; pagination: ListResult<StockTransfer>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
      providesTags: ["StockTransfer", "CompanyScoped"],
    }),

    createStockTransfer: builder.mutation<StockTransfer, { companyId: string; body: StockTransferMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/stock-transfers`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: StockTransfer }) => response.data,
      invalidatesTags: ["StockTransfer"],
    }),

    dispatchStockTransfer: builder.mutation<StockTransfer, { companyId: string; id: string }>({
      query: ({ companyId, id }) => ({
        url: `/companies/${companyId}/stock-transfers/${id}/dispatch`,
        method: "POST",
      }),
      transformResponse: (response: { data: StockTransfer }) => response.data,
      invalidatesTags: ["StockTransfer", "Product"],
    }),

    receiveStockTransfer: builder.mutation<StockTransfer, { companyId: string; id: string }>({
      query: ({ companyId, id }) => ({
        url: `/companies/${companyId}/stock-transfers/${id}/receive`,
        method: "POST",
      }),
      transformResponse: (response: { data: StockTransfer }) => response.data,
      invalidatesTags: ["StockTransfer", "Product"],
    }),
  }),
});

export const {
  useListStockTransfersQuery,
  useCreateStockTransferMutation,
  useDispatchStockTransferMutation,
  useReceiveStockTransferMutation,
} = stockTransferApi;

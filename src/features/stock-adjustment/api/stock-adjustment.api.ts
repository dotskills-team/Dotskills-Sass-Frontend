import { baseApi } from "@/store/api/base-api";
import type { ListResult } from "@/types/list-result";
import type {
  CreateStockAdjustmentLineInput,
  CreateStockAdjustmentResult,
  ListStockAdjustmentsResult,
  StockAdjustmentBatch,
  StockAdjustmentBatchDetail,
  StockAdjustmentReason,
  StockAdjustmentValueLostSummary,
} from "@/types/stock-adjustment";

export interface ListStockAdjustmentsParams {
  companyId: string;
  page?: number;
  limit?: number;
  locationId?: string;
  productId?: string;
  reason?: StockAdjustmentReason;
}

export const stockAdjustmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listStockAdjustments: builder.query<ListStockAdjustmentsResult, ListStockAdjustmentsParams>({
      query: ({ companyId, ...params }) => ({
        url: `/companies/${companyId}/stock-adjustments`,
        params,
      }),
      transformResponse: (response: {
        data: StockAdjustmentBatch[];
        pagination: ListResult<StockAdjustmentBatch>["meta"];
        summary: StockAdjustmentValueLostSummary;
      }) => ({
        items: response.data,
        meta: response.pagination!,
        summary: response.summary,
      }),
      providesTags: ["StockAdjustment"],
    }),

    getStockAdjustment: builder.query<
      StockAdjustmentBatchDetail,
      { companyId: string; id: string; locationId?: string; productId?: string; reason?: StockAdjustmentReason }
    >({
      query: ({ companyId, id, ...params }) => ({
        url: `/companies/${companyId}/stock-adjustments/${id}`,
        params,
      }),
      transformResponse: (response: { data: StockAdjustmentBatchDetail }) => response.data,
      providesTags: ["StockAdjustment"],
    }),

    createStockAdjustment: builder.mutation<
      CreateStockAdjustmentResult,
      { companyId: string; items: CreateStockAdjustmentLineInput[] }
    >({
      query: ({ companyId, items }) => ({
        url: `/companies/${companyId}/stock-adjustments`,
        method: "POST",
        body: { items },
      }),
      transformResponse: (response: { data: CreateStockAdjustmentResult }) => response.data,
      invalidatesTags: ["StockAdjustment"],
    }),
  }),
});

export const {
  useListStockAdjustmentsQuery,
  useGetStockAdjustmentQuery,
  useCreateStockAdjustmentMutation,
} = stockAdjustmentApi;

import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { GoodsReceipt, PurchaseOrder, PurchaseReturn } from "@/types/purchase-order";
import type { PurchaseOrderMutationPayload } from "@/features/purchase-order/lib/purchase-order-form-mapper";

export interface ListPurchaseOrdersParams {
  companyId: string;
  page?: number;
  limit?: number;
}

export interface ReceiveGoodsPayload {
  receivedDate?: string;
  items: { purchaseOrderItemId: string; receivedQty: number }[];
}

export interface CreatePurchaseReturnPayload {
  reason: string;
  refundAmount?: number;
  items: { productId: string; quantity: number }[];
}

/** `companies/:companyId/purchase-orders` — paginated (backend Frontend Phase 2 addition, mirrors Product's shape). */
export const purchaseOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPurchaseOrders: builder.query<ListResult<PurchaseOrder>, ListPurchaseOrdersParams>({
      query: ({ companyId, page, limit }) => ({
        url: `/companies/${companyId}/purchase-orders`,
        params: { page, limit },
      }),
      transformResponse: (response: { data: PurchaseOrder[]; pagination: ListResult<PurchaseOrder>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
      providesTags: ["PurchaseOrder", "CompanyScoped"],
    }),

    getPurchaseOrder: builder.query<PurchaseOrder, { companyId: string; id: string }>({
      query: ({ companyId, id }) => `/companies/${companyId}/purchase-orders/${id}`,
      transformResponse: (response: { data: PurchaseOrder }) => response.data,
      providesTags: ["PurchaseOrder"],
    }),

    createPurchaseOrder: builder.mutation<PurchaseOrder, { companyId: string; body: PurchaseOrderMutationPayload }>({
      query: ({ companyId, body }) => ({
        url: `/companies/${companyId}/purchase-orders`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: PurchaseOrder }) => response.data,
      invalidatesTags: ["PurchaseOrder"],
    }),

    updatePurchaseOrder: builder.mutation<
      PurchaseOrder,
      { companyId: string; id: string; body: Partial<Omit<PurchaseOrderMutationPayload, "supplierId">> }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/purchase-orders/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: { data: PurchaseOrder }) => response.data,
      invalidatesTags: ["PurchaseOrder"],
    }),

    cancelPurchaseOrder: builder.mutation<PurchaseOrder, { companyId: string; id: string }>({
      query: ({ companyId, id }) => ({
        url: `/companies/${companyId}/purchase-orders/${id}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: { data: PurchaseOrder }) => response.data,
      invalidatesTags: ["PurchaseOrder"],
    }),

    receiveGoods: builder.mutation<
      { order: PurchaseOrder; receipt: GoodsReceipt },
      { companyId: string; id: string; body: ReceiveGoodsPayload }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/purchase-orders/${id}/receive`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: { order: PurchaseOrder; receipt: GoodsReceipt } }) => response.data,
      invalidatesTags: ["PurchaseOrder", "Product", "SupplierPayment"],
    }),

    createPurchaseReturn: builder.mutation<
      PurchaseReturn,
      { companyId: string; id: string; body: CreatePurchaseReturnPayload }
    >({
      query: ({ companyId, id, body }) => ({
        url: `/companies/${companyId}/purchase-orders/${id}/returns`,
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: PurchaseReturn }) => response.data,
      invalidatesTags: ["PurchaseOrder", "PurchaseReturn", "Product", "SupplierPayment"],
    }),

    listPurchaseReturns: builder.query<PurchaseReturn[], { companyId: string; purchaseOrderId?: string }>({
      query: ({ companyId, purchaseOrderId }) => ({
        url: `/companies/${companyId}/purchase-orders/returns`,
        params: purchaseOrderId ? { purchaseOrderId } : undefined,
      }),
      transformResponse: (response: { data: PurchaseReturn[] }) => response.data,
      providesTags: ["PurchaseReturn"],
    }),
  }),
});

export const {
  useListPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useReceiveGoodsMutation,
  useCreatePurchaseReturnMutation,
  useListPurchaseReturnsQuery,
} = purchaseOrderApi;

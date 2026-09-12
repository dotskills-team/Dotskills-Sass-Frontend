import { baseApi } from "@/store/api/base-api";
import type { PlatformBilling } from "@/types/platform";
import type { PlatformBillingDetail } from "@/types/platform-billing";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

export interface ListBillingsParams {
  status?: string;
  billingCycle?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listBillings: builder.query<ListResult<PlatformBilling>, ListBillingsParams | void>({
      query: (params) => ({ url: "/platform/billings", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<PlatformBilling>,
      providesTags: ["Billing"],
    }),

    /** `findOne` raw row + `subscription.plan` + `attempts[]`, no envelope (verified). */
    getBilling: builder.query<PlatformBillingDetail, string>({
      query: (id) => `/platform/billings/${id}`,
      providesTags: ["Billing"],
    }),

    processBilling: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/billings/${id}/process`, method: "POST" }),
      invalidatesTags: ["Billing"],
    }),

    retryBilling: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/billings/${id}/retry`, method: "POST" }),
      invalidatesTags: ["Billing"],
    }),
  }),
});

export const {
  useListBillingsQuery,
  useGetBillingQuery,
  useProcessBillingMutation,
  useRetryBillingMutation,
} = billingApi;

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

    /** `CreateBillingDto` — শুধু `{subscriptionId, periodStart, periodEnd, dueAt}`; amount/currency সবসময় `subscription.priceSnapshot` থেকে backend derive করে (verified `BillingService.create`)। */
    createBilling: builder.mutation<
      unknown,
      { subscriptionId: string; periodStart: string; periodEnd: string; dueAt: string }
    >({
      query: (body) => ({ url: "/platform/billings", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),

    processBilling: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/billings/${id}/process`, method: "POST" }),
      invalidatesTags: ["Billing"],
    }),

    retryBilling: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/billings/${id}/retry`, method: "POST" }),
      invalidatesTags: ["Billing"],
    }),

    cancelBilling: builder.mutation<unknown, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/platform/billings/${id}/cancel`,
        method: "POST",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["Billing"],
    }),

    skipBilling: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/billings/${id}/skip`, method: "POST" }),
      invalidatesTags: ["Billing"],
    }),

    markBillingSucceeded: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/billings/${id}/mark-succeeded`, method: "POST" }),
      invalidatesTags: ["Billing"],
    }),

    markBillingFailed: builder.mutation<
      unknown,
      { id: string; failureCode?: string; failureMessage?: string }
    >({
      query: ({ id, failureCode, failureMessage }) => ({
        url: `/platform/billings/${id}/mark-failed`,
        method: "POST",
        body: { failureCode: failureCode || undefined, failureMessage: failureMessage || undefined },
      }),
      invalidatesTags: ["Billing"],
    }),
  }),
});

export const {
  useListBillingsQuery,
  useGetBillingQuery,
  useCreateBillingMutation,
  useProcessBillingMutation,
  useRetryBillingMutation,
  useCancelBillingMutation,
  useSkipBillingMutation,
  useMarkBillingSucceededMutation,
  useMarkBillingFailedMutation,
} = billingApi;

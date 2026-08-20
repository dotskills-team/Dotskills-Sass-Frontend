import { baseApi } from "@/store/api/base-api";
import type { PlatformPayment } from "@/types/platform";
import type { CompanyPaymentDetail } from "@/types/company-payment";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

export interface ListPaymentsParams {
  status?: string;
  invoiceId?: string;
  page?: number;
  limit?: number;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPayments: builder.query<ListResult<PlatformPayment>, ListPaymentsParams | void>({
      query: (params) => ({ url: "/platform/payments", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<PlatformPayment>,
      providesTags: ["Payment"],
    }),

    /** Platform `findOne` company-scoped `findOne`-এর same underlying service call (no scope) — একই `CompanyPaymentDetail` shape reuse করা হয়েছে (verified `payment.controller.ts`)। */
    getPayment: builder.query<CompanyPaymentDetail, string>({
      query: (id) => `/platform/payments/${id}`,
      providesTags: ["Payment"],
    }),

    verifyPayment: builder.mutation<unknown, { id: string; valId: string }>({
      query: ({ id, valId }) => ({
        url: `/platform/payments/${id}/verify`,
        method: "POST",
        body: { valId },
      }),
      invalidatesTags: ["Payment"],
    }),

    cancelPayment: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/payments/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useListPaymentsQuery,
  useGetPaymentQuery,
  useVerifyPaymentMutation,
  useCancelPaymentMutation,
} = paymentApi;

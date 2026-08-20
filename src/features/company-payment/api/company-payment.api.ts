import { baseApi } from "@/store/api/base-api";
import type { CompanyPayment, CompanyPaymentDetail, CreateCompanyPaymentResult } from "@/types/company-payment";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

export interface ListCompanyPaymentsParams {
  invoiceId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * `@Controller('payments')` + `CompanyContextGuard` — Invoice module-এর মতোই company scope
 * সবসময় `x-company-id` header থেকে resolve হয় (verified payment.service.ts `findAll`/`findOne`
 * — `scope` param query tenantId/companyId সম্পূর্ণ override করে), তাই এখানে সেগুলো param
 * হিসেবে পাঠানো হয় না।
 *
 * Company-scoped controller-এ `verify`/`cancel` route নেই (verified company-payment.controller.ts)
 * — সেগুলো শুধু Platform controller এবং gateway callback controller-এ থাকে। Gateway-এর
 * success/fail/cancel/IPN callback সরাসরি backend hit করে (JWT ছাড়া, server-to-server বা
 * browser redirect) — frontend কখনো নিজে payment "verify" করে না, শুধু backend-confirmed state
 * fetch/refetch করে দেখায় (verifyAndSettle-এর ফলাফল)।
 */
export const companyPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCompanyPayments: builder.query<ListResult<CompanyPayment>, ListCompanyPaymentsParams | void>({
      query: (params) => ({ url: "/payments", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<CompanyPayment>,
      providesTags: ["Payment"],
    }),

    getCompanyPayment: builder.query<CompanyPaymentDetail, string>({
      query: (id) => `/payments/${id}`,
      providesTags: ["Payment"],
    }),

    /** `CreatePaymentDto` শুধু `invoiceId` নেয় — amount/currency সবসময় backend Invoice থেকে derive করে (verified)। */
    createCompanyPayment: builder.mutation<CreateCompanyPaymentResult, { invoiceId: string }>({
      query: (body) => ({ url: "/payments", method: "POST", body }),
      invalidatesTags: ["Payment", "Invoice"],
    }),
  }),
});

export const { useListCompanyPaymentsQuery, useGetCompanyPaymentQuery, useCreateCompanyPaymentMutation } =
  companyPaymentApi;

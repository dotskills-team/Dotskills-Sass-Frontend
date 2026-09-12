import { baseApi } from "@/store/api/base-api";
import type { PlatformInvoice } from "@/types/platform";
import type { CompanyInvoiceDetail } from "@/types/company-invoice";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

export interface ListInvoicesParams {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listInvoices: builder.query<ListResult<PlatformInvoice>, ListInvoicesParams | void>({
      query: (params) => ({ url: "/platform/invoices", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<PlatformInvoice>,
      providesTags: ["Invoice"],
    }),

    /** Platform `findOne` company-scoped `findOne`-এর same underlying service call (no scope) — একই `CompanyInvoiceDetail` shape reuse করা হয়েছে (verified `invoice.controller.ts`)। */
    getInvoice: builder.query<CompanyInvoiceDetail, string>({
      query: (id) => `/platform/invoices/${id}`,
      providesTags: ["Invoice"],
    }),

    issueInvoice: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/invoices/${id}/issue`, method: "POST" }),
      invalidatesTags: ["Invoice"],
    }),

    voidInvoice: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/invoices/${id}/void`, method: "POST" }),
      invalidatesTags: ["Invoice"],
    }),
  }),
});

export const {
  useListInvoicesQuery,
  useGetInvoiceQuery,
  useIssueInvoiceMutation,
  useVoidInvoiceMutation,
} = invoiceApi;

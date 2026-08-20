import { baseApi } from "@/store/api/base-api";
import type { CompanyInvoice, CompanyInvoiceDetail } from "@/types/company-invoice";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

export interface ListCompanyInvoicesParams {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * `@Controller('invoices')` + `CompanyContextGuard` — company scope (`tenantId`/`companyId`)
 * request থেকে না নিয়ে সবসময় authenticated `x-company-id` header থেকে resolve হয়
 * (verified invoice.service.ts `findAll`/`findOne` — `scope` param query-এর tenantId/companyId
 * সম্পূর্ণ override করে), তাই এখানে companyId/tenantId param হিসেবে পাঠানো হয় না — `base-api.ts`-এর
 * `prepareHeaders` আগে থেকেই Redux `company.currentCompanyId` থেকে সেই header attach করে।
 * Read-only — Invoice lifecycle (issue/cancel/void/mark-paid) সম্পূর্ণ Platform-controlled,
 * company-scoped controller-এ কোনো mutation route নেই (verified)।
 */
export const companyInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCompanyInvoices: builder.query<ListResult<CompanyInvoice>, ListCompanyInvoicesParams | void>({
      query: (params) => ({ url: "/invoices", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<CompanyInvoice>,
      providesTags: ["Invoice"],
    }),

    getCompanyInvoice: builder.query<CompanyInvoiceDetail, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: ["Invoice"],
    }),
  }),
});

export const { useListCompanyInvoicesQuery, useGetCompanyInvoiceQuery } = companyInvoiceApi;

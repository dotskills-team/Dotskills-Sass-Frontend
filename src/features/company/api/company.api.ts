import { baseApi } from "@/store/api/base-api";
import type { CompanyMembership } from "@/types/company";
import type { Company, CompanyDetail, CompanyStatus } from "@/types/platform";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

interface MyCompaniesResponse {
  success: boolean;
  companies: CompanyMembership[];
}

export interface ListCompaniesParams {
  search?: string;
  status?: string;
  industryId?: string;
  page?: number;
  limit?: number;
}

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCompanies: builder.query<CompanyMembership[], void>({
      query: () => "/auth/me/companies",
      transformResponse: (response: MyCompaniesResponse) => response.companies,
      providesTags: ["Company"],
    }),

    listCompanies: builder.query<ListResult<Company>, ListCompaniesParams | void>({
      query: (params) => ({ url: "/platform/companies", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<Company>,
      providesTags: ["Company"],
    }),

    /** `findOne` raw company object return করে — কোনো `{success,data}` envelope নেই (verified)। */
    getCompany: builder.query<CompanyDetail, string>({
      query: (id) => `/platform/companies/${id}`,
      providesTags: ["Company"],
    }),

    createCompany: builder.mutation<
      unknown,
      {
        tenantId: string;
        industryId: string;
        code: string;
        legalName: string;
        tradeName?: string;
        email?: string;
        phone?: string;
        taxId?: string;
        registrationNo?: string;
        baseCurrencyCode?: string;
        timezone?: string;
      }
    >({
      query: (body) => ({ url: "/platform/companies", method: "POST", body }),
      invalidatesTags: ["Company"],
    }),

    updateCompany: builder.mutation<
      unknown,
      {
        id: string;
        industryId?: string;
        legalName?: string;
        tradeName?: string;
        email?: string;
        phone?: string;
        taxId?: string;
        registrationNo?: string;
        baseCurrencyCode?: string;
        timezone?: string;
      }
    >({
      query: ({ id, ...body }) => ({ url: `/platform/companies/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Company"],
    }),

    activateCompany: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/companies/${id}/activate`, method: "POST" }),
      invalidatesTags: ["Company"],
    }),

    suspendCompany: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/companies/${id}/suspend`, method: "POST" }),
      invalidatesTags: ["Company"],
    }),

    updateCompanyStatus: builder.mutation<unknown, { id: string; status: CompanyStatus }>({
      query: ({ id, status }) => ({
        url: `/platform/companies/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useGetMyCompaniesQuery,
  useListCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useActivateCompanyMutation,
  useSuspendCompanyMutation,
  useUpdateCompanyStatusMutation,
} = companyApi;

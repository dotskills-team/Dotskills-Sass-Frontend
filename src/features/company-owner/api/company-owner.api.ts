import { baseApi } from "@/store/api/base-api";
import type { CompanyOwnership } from "@/types/company-owner";
import type { CompanyMembershipStatus } from "@/types/platform";

export interface CreateCompanyOwnerBody {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  designation?: string;
}

export interface UpdateCompanyOwnerBody {
  email?: string;
  fullName?: string;
  phone?: string;
  designation?: string;
}

export const companyOwnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** `findAll` `{success, items, total}` return করে — কোনো pagination নেই (verified company-owner.service.ts)। */
    listCompanyOwners: builder.query<CompanyOwnership[], string>({
      query: (companyId) => `/platform/companies/${companyId}/owner`,
      transformResponse: (response: { items: CompanyOwnership[] }) => response.items,
      providesTags: ["CompanyOwner"],
    }),

    createCompanyOwner: builder.mutation<
      { data: { credentials: { email: string; password: string } | null } },
      { companyId: string; body: CreateCompanyOwnerBody }
    >({
      query: ({ companyId, body }) => ({
        url: `/platform/companies/${companyId}/owner`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CompanyOwner", "Company"],
    }),

    updateCompanyOwner: builder.mutation<
      unknown,
      { companyId: string; ownerMemberId: string; body: UpdateCompanyOwnerBody }
    >({
      query: ({ companyId, ownerMemberId, body }) => ({
        url: `/platform/companies/${companyId}/owner/${ownerMemberId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CompanyOwner"],
    }),

    changePrimaryCompanyOwner: builder.mutation<unknown, { companyId: string; ownerMemberId: string }>({
      query: ({ companyId, ownerMemberId }) => ({
        url: `/platform/companies/${companyId}/owner/${ownerMemberId}/primary`,
        method: "POST",
      }),
      invalidatesTags: ["CompanyOwner"],
    }),

    updateCompanyOwnerStatus: builder.mutation<
      unknown,
      { companyId: string; ownerMemberId: string; status: CompanyMembershipStatus }
    >({
      query: ({ companyId, ownerMemberId, status }) => ({
        url: `/platform/companies/${companyId}/owner/${ownerMemberId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["CompanyOwner"],
    }),
  }),
});

export const {
  useListCompanyOwnersQuery,
  useCreateCompanyOwnerMutation,
  useUpdateCompanyOwnerMutation,
  useChangePrimaryCompanyOwnerMutation,
  useUpdateCompanyOwnerStatusMutation,
} = companyOwnerApi;

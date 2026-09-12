import { baseApi } from "@/store/api/base-api";
import type { Tenant, TenantStatus } from "@/types/platform";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";

export interface ListTenantsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const tenantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTenants: builder.query<ListResult<Tenant>, ListTenantsParams | void>({
      query: (params) => ({ url: "/platform/tenants", params: params ?? undefined }),
      transformResponse: normalizeItemsEnvelope<Tenant>,
      providesTags: ["Tenant"],
    }),

    getTenant: builder.query<Tenant, string>({
      query: (id) => `/platform/tenants/${id}`,
      transformResponse: (response: { data: Tenant }) => response.data,
      providesTags: ["Tenant"],
    }),

    createTenant: builder.mutation<unknown, { name: string }>({
      query: (body) => ({ url: "/platform/tenants", method: "POST", body }),
      invalidatesTags: ["Tenant"],
    }),

    updateTenant: builder.mutation<unknown, { id: string; name?: string }>({
      query: ({ id, ...body }) => ({
        url: `/platform/tenants/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tenant"],
    }),

    updateTenantStatus: builder.mutation<unknown, { id: string; status: TenantStatus }>({
      query: ({ id, status }) => ({
        url: `/platform/tenants/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Tenant"],
    }),

    cancelTenant: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/tenants/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tenant"],
    }),
  }),
});

export const {
  useListTenantsQuery,
  useGetTenantQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useUpdateTenantStatusMutation,
  useCancelTenantMutation,
} = tenantApi;

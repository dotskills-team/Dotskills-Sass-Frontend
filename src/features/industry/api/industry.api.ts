import { baseApi } from "@/store/api/base-api";
import type { Industry, IndustryStatus } from "@/types/platform";
import { normalizeDataEnvelope, type ListResult } from "@/types/list-result";

export interface ListIndustriesParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const industryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listIndustries: builder.query<ListResult<Industry>, ListIndustriesParams | void>({
      query: (params) => ({ url: "/platform/industries", params: params ?? undefined }),
      transformResponse: normalizeDataEnvelope<Industry>,
      providesTags: ["Industry"],
    }),

    activateIndustry: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/industries/${id}/activate`, method: "PATCH" }),
      invalidatesTags: ["Industry"],
    }),

    deactivateIndustry: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/industries/${id}/deactivate`, method: "PATCH" }),
      invalidatesTags: ["Industry"],
    }),

    archiveIndustry: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/industries/${id}/archive`, method: "PATCH" }),
      invalidatesTags: ["Industry"],
    }),

    updateIndustryStatus: builder.mutation<unknown, { id: string; status: IndustryStatus }>({
      query: ({ id, status }) => ({
        url: `/platform/industries/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Industry"],
    }),

    createIndustry: builder.mutation<unknown, { code: string; name: string; description?: string }>({
      query: (body) => ({ url: "/platform/industries", method: "POST", body }),
      invalidatesTags: ["Industry"],
    }),

    updateIndustry: builder.mutation<
      unknown,
      { id: string; code: string; name: string; description?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/platform/industries/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Industry"],
    }),
  }),
});

export const {
  useListIndustriesQuery,
  useActivateIndustryMutation,
  useDeactivateIndustryMutation,
  useArchiveIndustryMutation,
  useUpdateIndustryStatusMutation,
  useCreateIndustryMutation,
  useUpdateIndustryMutation,
} = industryApi;

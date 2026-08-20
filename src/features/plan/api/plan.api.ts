import { baseApi } from "@/store/api/base-api";
import type { Plan, PlanDetail, PlanStatus } from "@/types/platform";
import { normalizeSuccessEnvelope, type ListResult } from "@/types/list-result";

export interface ListPlansParams {
  status?: string;
  isPublic?: "true" | "false";
  search?: string;
  page?: number;
  limit?: number;
}

export const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlans: builder.query<ListResult<Plan>, ListPlansParams | void>({
      // route: GET /plans — কোনো /platform/ prefix নেই (verified, plan.controller.ts)
      query: (params) => ({ url: "/plans", params: params ?? undefined }),
      transformResponse: normalizeSuccessEnvelope<Plan>,
      providesTags: ["Plan"],
    }),

    updatePlanStatus: builder.mutation<unknown, { id: string; status: PlanStatus }>({
      query: ({ id, status }) => ({
        url: `/plans/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Plan"],
    }),

    archivePlan: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["Plan"],
    }),

    getPlan: builder.query<PlanDetail, string>({
      query: (id) => `/plans/${id}`,
      transformResponse: (response: { data: PlanDetail }) => response.data,
      providesTags: ["Plan", "PlanPrice", "PlanFeature"],
    }),

    createPlan: builder.mutation<
      unknown,
      { code: string; name: string; description?: string; trialDays: number; isPublic: boolean }
    >({
      query: (body) => ({ url: "/plans", method: "POST", body }),
      invalidatesTags: ["Plan"],
    }),

    updatePlan: builder.mutation<
      unknown,
      { id: string; code: string; name: string; description?: string; trialDays: number; isPublic: boolean }
    >({
      query: ({ id, ...body }) => ({ url: `/plans/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const {
  useListPlansQuery,
  useUpdatePlanStatusMutation,
  useArchivePlanMutation,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
} = planApi;

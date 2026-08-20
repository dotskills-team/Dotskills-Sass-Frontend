import { baseApi } from "@/store/api/base-api";
import type { PlanFeatureAssignment } from "@/types/platform";

export interface AssignPlanFeatureArgs {
  planId: string;
  featureId: string;
  enabled?: boolean;
  limits?: Record<string, unknown>;
}

export interface UpdatePlanFeatureArgs {
  planId: string;
  featureId: string;
  enabled?: boolean;
  limits?: Record<string, unknown>;
}

export const planFeatureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlanFeatures: builder.query<PlanFeatureAssignment[], string>({
      query: (planId) => `/plans/${planId}/features`,
      transformResponse: (response: { data: PlanFeatureAssignment[] }) => response.data,
      providesTags: ["PlanFeature"],
    }),

    assignPlanFeature: builder.mutation<unknown, AssignPlanFeatureArgs>({
      query: ({ planId, ...body }) => ({
        url: `/plans/${planId}/features`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlanFeature", "Plan"],
    }),

    updatePlanFeature: builder.mutation<unknown, UpdatePlanFeatureArgs>({
      query: ({ planId, featureId, ...body }) => ({
        url: `/plans/${planId}/features/${featureId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlanFeature", "Plan"],
    }),

    removePlanFeature: builder.mutation<unknown, { planId: string; featureId: string }>({
      query: ({ planId, featureId }) => ({
        url: `/plans/${planId}/features/${featureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PlanFeature", "Plan"],
    }),
  }),
});

export const {
  useListPlanFeaturesQuery,
  useAssignPlanFeatureMutation,
  useUpdatePlanFeatureMutation,
  useRemovePlanFeatureMutation,
} = planFeatureApi;

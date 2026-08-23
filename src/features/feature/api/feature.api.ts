import { baseApi } from "@/store/api/base-api";
import type { Feature, FeatureConfigField, FeatureStatus } from "@/types/platform";
import { normalizeRawArray, type ListResult } from "@/types/list-result";

/**
 * `QueryFeatureDto`-তে page/limit param আছে (verified), কিন্তু
 * `feature.service.ts`-এর `findAll()` সেগুলো ব্যবহার করে না (কোনো
 * skip/take নেই, `meta.total` আসলে returned array-এর length মাত্র,
 * প্রকৃত DB count নয়) — backend কার্যত pagination support করে না।
 * তাই এখানে page/limit পাঠানো হয় না এবং কোনো pagination UI বানানো
 * হয়নি (fake pagination নয়, Subscriptions page-এর একই নীতি)।
 */
export interface ListFeaturesParams {
  search?: string;
  status?: string;
  module?: string;
}

export const featureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listFeatures: builder.query<ListResult<Feature>, ListFeaturesParams | void>({
      query: (params) => ({ url: "/platform/features", params: params ?? undefined }),
      transformResponse: (response: { data: Feature[] }): ListResult<Feature> =>
        normalizeRawArray(response.data),
      providesTags: ["Feature"],
    }),

    createFeature: builder.mutation<
      unknown,
      {
        code: string;
        name: string;
        module: string;
        description?: string;
        configSchema?: FeatureConfigField[];
      }
    >({
      query: (body) => ({ url: "/platform/features", method: "POST", body }),
      invalidatesTags: ["Feature"],
    }),

    updateFeature: builder.mutation<
      unknown,
      {
        id: string;
        code: string;
        name: string;
        module: string;
        description?: string;
        configSchema?: FeatureConfigField[];
      }
    >({
      query: ({ id, ...body }) => ({ url: `/platform/features/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Feature"],
    }),

    updateFeatureStatus: builder.mutation<unknown, { id: string; status: FeatureStatus }>({
      query: ({ id, status }) => ({
        url: `/platform/features/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Feature"],
    }),

    activateFeature: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/features/${id}/activate`, method: "PATCH" }),
      invalidatesTags: ["Feature"],
    }),

    deactivateFeature: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/features/${id}/deactivate`, method: "PATCH" }),
      invalidatesTags: ["Feature"],
    }),

    archiveFeature: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/platform/features/${id}/archive`, method: "PATCH" }),
      invalidatesTags: ["Feature"],
    }),
  }),
});

export const {
  useListFeaturesQuery,
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useUpdateFeatureStatusMutation,
  useActivateFeatureMutation,
  useDeactivateFeatureMutation,
  useArchiveFeatureMutation,
} = featureApi;

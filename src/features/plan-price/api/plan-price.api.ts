import { baseApi } from "@/store/api/base-api";
import type { PlanPrice, BillingCycle } from "@/types/platform";

export interface ListPlanPricesParams {
  planId: string;
  billingCycle?: BillingCycle;
  isActive?: "true" | "false";
}

export interface CreatePlanPriceArgs {
  planId: string;
  billingCycle: BillingCycle;
  currencyCode?: string;
  amount: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface UpdatePlanPriceArgs {
  planId: string;
  priceId: string;
  amount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

export const planPriceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPlanPrices: builder.query<PlanPrice[], ListPlanPricesParams>({
      query: ({ planId, ...params }) => ({ url: `/plans/${planId}/prices`, params }),
      providesTags: ["PlanPrice"],
    }),

    createPlanPrice: builder.mutation<unknown, CreatePlanPriceArgs>({
      query: ({ planId, ...body }) => ({
        url: `/plans/${planId}/prices`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlanPrice", "Plan"],
    }),

    updatePlanPrice: builder.mutation<unknown, UpdatePlanPriceArgs>({
      query: ({ planId, priceId, ...body }) => ({
        url: `/plans/${planId}/prices/${priceId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PlanPrice", "Plan"],
    }),

    activatePlanPrice: builder.mutation<unknown, { planId: string; priceId: string }>({
      query: ({ planId, priceId }) => ({
        url: `/plans/${planId}/prices/${priceId}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["PlanPrice", "Plan"],
    }),

    deactivatePlanPrice: builder.mutation<unknown, { planId: string; priceId: string }>({
      query: ({ planId, priceId }) => ({
        url: `/plans/${planId}/prices/${priceId}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ["PlanPrice", "Plan"],
    }),
  }),
});

export const {
  useListPlanPricesQuery,
  useCreatePlanPriceMutation,
  useUpdatePlanPriceMutation,
  useActivatePlanPriceMutation,
  useDeactivatePlanPriceMutation,
} = planPriceApi;

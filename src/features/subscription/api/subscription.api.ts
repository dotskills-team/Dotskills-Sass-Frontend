import { baseApi } from "@/store/api/base-api";
import type { BillingCycle, PlatformSubscription } from "@/types/platform";
import type { CompanySubscriptionDetail } from "@/types/company-subscription";
import { normalizeRawArray, type ListResult } from "@/types/list-result";

/**
 * Backend-এর `GET /platform/subscriptions` কোনো query param নেয় না এবং
 * raw array (no pagination envelope) ফেরত দেয়, সর্বোচ্চ ১০০টা row
 * (`SUBSCRIPTION_CONSTANTS.MAX_HISTORY_LIMIT`) — verified,
 * platform-subscription.controller.ts + subscription.service.ts।
 * অন্য সব list endpoint-এর মতো filter/pagination দেওয়া হচ্ছে না, কারণ
 * backend সেটা support করে না — fake filter বানানো হয়নি (section 8/22)।
 */
interface AdminSubscriptionActionArgs {
  id: string;
  reason: string;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSubscriptions: builder.query<ListResult<PlatformSubscription>, void>({
      query: () => "/platform/subscriptions",
      transformResponse: normalizeRawArray<PlatformSubscription>,
      providesTags: ["Subscription"],
    }),

    /** `findOneForPlatform` — company-এর নিজস্ব `findOne`-এর সাথে exact একই shape (`plan.features` + `events`, verified), তাই একই `CompanySubscriptionDetail` type reuse করা হয়েছে। */
    getSubscription: builder.query<CompanySubscriptionDetail, string>({
      query: (id) => `/platform/subscriptions/${id}`,
      providesTags: ["Subscription"],
    }),

    /**
     * `POST /platform/subscriptions` — verified `PlatformSubscriptionController.create`:
     * body-তে `dto.companyId` লাগে, এবং সেটা `x-company-id` header-এর সাথে exact match করতে হয়
     * (দুটোই backend নিজেই check করে)। এই একটাই endpoint যেখানে platform staff-কে manually
     * target company-র id header হিসেবে পাঠাতে হয় — `base-api.ts`-এর `prepareHeaders` platform
     * staff-এর জন্য কোনো `x-company-id` set করে না (Redux `company.currentCompanyId` শুধু
     * company portal-এ populate হয়), তাই এখানে endpoint-level header override safely কাজ করে।
     */
    createSubscription: builder.mutation<
      unknown,
      { companyId: string; planId: string; billingCycle: BillingCycle }
    >({
      query: ({ companyId, planId, billingCycle }) => ({
        url: "/platform/subscriptions",
        method: "POST",
        headers: { "x-company-id": companyId },
        body: { companyId, planId, billingCycle },
      }),
      invalidatesTags: ["Subscription"],
    }),

    suspendSubscription: builder.mutation<unknown, AdminSubscriptionActionArgs>({
      query: ({ id, reason }) => ({
        url: `/platform/subscriptions/${id}/suspend`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Subscription"],
    }),

    reactivateSubscription: builder.mutation<unknown, AdminSubscriptionActionArgs>({
      query: ({ id, reason }) => ({
        url: `/platform/subscriptions/${id}/reactivate`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Subscription"],
    }),

    cancelSubscription: builder.mutation<unknown, AdminSubscriptionActionArgs>({
      query: ({ id, reason }) => ({
        url: `/platform/subscriptions/${id}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Subscription"],
    }),

    expireSubscription: builder.mutation<unknown, AdminSubscriptionActionArgs>({
      query: ({ id, reason }) => ({
        url: `/platform/subscriptions/${id}/expire`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useListSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useSuspendSubscriptionMutation,
  useReactivateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useExpireSubscriptionMutation,
} = subscriptionApi;

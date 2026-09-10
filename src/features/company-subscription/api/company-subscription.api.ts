import { baseApi } from "@/store/api/base-api";
import type {
  CheckoutSubscriptionResult,
  CompanySubscriptionCurrent,
  CompanySubscriptionDetail,
  CompanySubscriptionListItem,
  EligiblePlan,
} from "@/types/company-subscription";
import type { BillingCycle } from "@/types/platform";

/**
 * `@Controller('subscriptions')` + `CompanyContextGuard` — company scope সবসময় `x-company-id`
 * header থেকে resolve হয় (verified subscription.controller.ts `context()`), তাই কোনো
 * tenantId/companyId param পাঠানো হয় না।
 *
 * Read route (`current`/`all`/`:id`)-এ কোনো `@RequireCompanyPermissions` decorator নেই —
 * `CompanyPermissionsGuard.canActivate` verified করা হয়েছে: `if (!required?.length) return
 * true` — অর্থাৎ backend যেকোনো active company member-কে subscription দেখতে দেয়, নির্দিষ্ট
 * permission ছাড়াই। তাই এই read endpoint-গুলো frontend-এ কোনো `CompanyPermissionGate` দিয়ে
 * আটকানো হয়নি (backend contract-এর সাথে exact match) — শুধু mutation action-গুলো (auto-renew/
 * cancel/reactivate) তাদের real permission code দিয়ে gated।
 *
 * `GET /subscriptions` raw array, কোনো pagination/envelope নেই, সর্বোচ্চ ১০০টা row
 * (`SUBSCRIPTION_CONSTANTS.MAX_HISTORY_LIMIT`, verified) — platform subscription list-এর
 * `normalizeRawArray` pattern-ই এখানে প্রযোজ্য কিন্তু company history table-এ pagination UI
 * দরকার নেই যেহেতু backend নিজেই দেয় না।
 */
export const companySubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentSubscription: builder.query<CompanySubscriptionCurrent | null, void>({
      query: () => "/subscriptions/current",
      providesTags: ["Subscription"],
    }),

    listCompanySubscriptions: builder.query<CompanySubscriptionListItem[], void>({
      query: () => "/subscriptions",
      providesTags: ["Subscription"],
    }),

    getCompanySubscription: builder.query<CompanySubscriptionDetail, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: ["Subscription"],
    }),

    updateSubscriptionAutoRenew: builder.mutation<unknown, { id: string; autoRenew: boolean }>({
      query: ({ id, autoRenew }) => ({
        url: `/subscriptions/${id}/auto-renew`,
        method: "PATCH",
        body: { autoRenew },
      }),
      invalidatesTags: ["Subscription"],
    }),

    cancelCompanySubscription: builder.mutation<unknown, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/subscriptions/${id}/cancel`,
        method: "POST",
        body: { reason: reason || undefined },
      }),
      invalidatesTags: ["Subscription"],
    }),

    reactivateCompanySubscription: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/subscriptions/${id}/reactivate`, method: "POST" }),
      invalidatesTags: ["Subscription"],
    }),

    /**
     * `GET /subscriptions/plans` — server-scoped to this company's `x-company-id` (its own
     * `baseCurrencyCode` resolves the eligible prices), returns only ACTIVE+isPublic plans with
     * at least one eligible price (verified `SubscriptionService.getEligiblePlans`). No query
     * params, no client-side filtering — the catalog is consumed exactly as returned.
     */
    listEligiblePlans: builder.query<EligiblePlan[], void>({
      query: () => "/subscriptions/plans",
      providesTags: ["Plan"],
    }),

    /**
     * `POST /subscriptions/:id/checkout` — the single system-generated entry point for first
     * paid subscription, resubscribing after expiry, renewing the current plan early, and plan
     * change. `CheckoutSubscriptionDto` takes only `{planId?, billingCycle?}` (verified) — omit
     * both to pay for the current plan, provide both to change plan. Returns the (possibly
     * reused) Invoice, which the caller hands straight to the existing pay flow
     * (`useCreateCompanyPaymentMutation` / `PayInvoiceDialog`) — this endpoint never itself
     * charges anything.
     */
    checkoutSubscription: builder.mutation<
      CheckoutSubscriptionResult,
      { id: string; planId?: string; billingCycle?: BillingCycle }
    >({
      query: ({ id, planId, billingCycle }) => ({
        url: `/subscriptions/${id}/checkout`,
        method: "POST",
        body: { planId, billingCycle },
      }),
      invalidatesTags: ["Subscription", "Invoice"],
    }),
  }),
});

export const {
  useGetCurrentSubscriptionQuery,
  useListCompanySubscriptionsQuery,
  useGetCompanySubscriptionQuery,
  useUpdateSubscriptionAutoRenewMutation,
  useCancelCompanySubscriptionMutation,
  useReactivateCompanySubscriptionMutation,
  useListEligiblePlansQuery,
  useCheckoutSubscriptionMutation,
} = companySubscriptionApi;

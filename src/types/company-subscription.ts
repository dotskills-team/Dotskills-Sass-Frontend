import type { BillingCycle, Plan, PlanFeatureAssignment, SubscriptionStatus } from "@/types/platform";

/** `priceSnapshot` JSON shape captured on create/changePlan (verified subscription.service.ts `PriceSnapshot`). */
export interface SubscriptionPriceSnapshot {
  planId: string;
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  currencyCode: string;
  amount: string;
  capturedAt: string;
}

/** `SubscriptionEvent` row — findOne includes the last 100 (verified). */
export interface SubscriptionEvent {
  id: string;
  fromStatus: SubscriptionStatus | null;
  toStatus: SubscriptionStatus;
  reason: string;
  source: string;
  createdAt: string;
}

/** `plan: { include: { features: { include: { feature } } } }` — verified `getCurrent`/`findOne`. */
export interface CompanySubscriptionPlan extends Plan {
  features: PlanFeatureAssignment[];
}

/** Base subscription fields shared by every response shape (verified `Subscription` model). */
export interface CompanySubscriptionBase {
  id: string;
  tenantId: string;
  companyId: string | null;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startsAt: string;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  graceEndsAt: string | null;
  pastDueEndsAt: string | null;
  suspendedAt: string | null;
  suspensionExpiresAt: string | null;
  cancelledAt: string | null;
  autoRenew: boolean;
  priceSnapshot: SubscriptionPriceSnapshot;
  createdAt: string;
}

/** `GET /subscriptions/current` — raw object or `null` if none exists (verified). */
export interface CompanySubscriptionCurrent extends CompanySubscriptionBase {
  plan: CompanySubscriptionPlan;
}

/** `GET /subscriptions` — raw array, `plan: true` (flat, no features), no envelope, capped at 100 (verified). */
export interface CompanySubscriptionListItem extends CompanySubscriptionBase {
  plan: Plan;
}

/** `GET /subscriptions/:id` — same as current + last 100 `events` (verified). */
export interface CompanySubscriptionDetail extends CompanySubscriptionBase {
  plan: CompanySubscriptionPlan;
  events: SubscriptionEvent[];
}

/** `EligiblePlanPrice` — one entry of `GET /subscriptions/plans`'s `prices[]` (verified `getEligiblePlans`). */
export interface EligiblePlanPrice {
  id: string;
  billingCycle: BillingCycle;
  currencyCode: string;
  amount: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

/**
 * `GET /subscriptions/plans` — raw array (verified `SubscriptionService.getEligiblePlans`).
 * Already server-filtered to ACTIVE + isPublic plans with at least one ACTIVE, currently-effective
 * price in the company's own base currency — no client-side eligibility filtering needed or done.
 */
export interface EligiblePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  trialDays: number;
  prices: EligiblePlanPrice[];
}

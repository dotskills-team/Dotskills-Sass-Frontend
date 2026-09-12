import type { BillingCycle, BillingStatus, CompanySummary, Plan, SubscriptionStatus } from "@/types/platform";

export type BillingAttemptStatus = "STARTED" | "SUCCEEDED" | "FAILED";

/** `BillingAttempt` row — `findOne` includes all, ordered by `attemptNumber` (verified billing.service.ts). */
export interface BillingAttempt {
  id: string;
  attemptNumber: number;
  status: BillingAttemptStatus;
  attemptedAt: string;
  completedAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
}

/** `GET /platform/billings/:id` — raw row + `subscription.plan` + `attempts[]` (verified `BillingService.findOne`). */
export interface PlatformBillingDetail {
  id: string;
  tenantId: string;
  companyId: string | null;
  subscriptionId: string;
  status: BillingStatus;
  billingCycle: BillingCycle;
  currencyCode: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  dueAt: string;
  processedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  attemptCount: number;
  nextAttemptAt: string | null;
  createdAt: string;
  company: CompanySummary | null;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    plan: Plan;
  };
  attempts: BillingAttempt[];
}

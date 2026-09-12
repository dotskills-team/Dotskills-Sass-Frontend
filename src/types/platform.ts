/** Backend-এর প্রকৃত response field mirror — কোনোটা invent করা হয়নি। */

export type CompanyStatus = "DRAFT" | "ONBOARDING" | "READY" | "LIVE" | "SUSPENDED" | "CLOSED";
export type IndustryStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "GRACE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";
export type BillingStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "VOID";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
export type FeatureStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type TenantStatus = "DRAFT" | "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";

export interface Industry {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: IndustryStatus;
  createdAt: string;
  updatedAt: string;
  _count: { companies: number };
}

export interface Company {
  id: string;
  tenantId: string;
  industryId: string;
  code: string;
  legalName: string;
  tradeName: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  registrationNo: string | null;
  baseCurrencyCode: string;
  timezone: string;
  status: CompanyStatus;
  goLiveAt: string | null;
  createdAt: string;
  updatedAt: string;
  industry: Industry;
}

export type CompanyMembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";

/** `GET /platform/companies/:id`-এ nested — active members ও active ownerships (verified company-management.service.ts `findOne`)। */
export interface CompanyDetailMember {
  id: string;
  userId: string;
  employeeCode: string | null;
  designation: string | null;
  status: CompanyMembershipStatus;
  activatedAt: string | null;
}

export interface CompanyDetailOwnership {
  id: string;
  companyMemberId: string;
  isPrimary: boolean;
  startedAt: string;
}

export interface CompanyDetail extends Company {
  members: CompanyDetailMember[];
  ownerships: CompanyDetailOwnership[];
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  trialDays: number;
  isPublic: boolean;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  _count: { features: number; prices: number; subscriptions: number };
}

export interface PlatformSubscription {
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
  autoRenew: boolean;
  priceSnapshot: { amount?: string; currencyCode?: string; planName?: string } | null;
  createdAt: string;
  plan: { id: string; code: string; name: string };
  company?: CompanySummary | null;
}

/**
 * Shared Company + primary-owner projection returned alongside every
 * Platform Billing/Invoice/Payment row (verified `companyWithOwnerSelect`,
 * backend `src/common/prisma/company-with-owner.select.ts`) — `null` only
 * for the rare row whose Company has since been deleted (`companyId` is
 * nullable on all three models). `ownerships` is always 0 or 1 entries
 * (the current primary owner).
 */
export interface CompanySummary {
  id: string;
  legalName: string;
  tradeName: string | null;
  ownerships: { companyMember: { user: { fullName: string; email: string | null } } }[];
}

/** Minimal Plan reference attached to Subscription includes across Billing/Invoice/Payment. */
export interface PlanSummary {
  id: string;
  name: string;
  code: string;
}

export interface PlatformBilling {
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
  attemptCount: number;
  createdAt: string;
  company: CompanySummary | null;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    plan: PlanSummary;
  };
}

export interface PlatformInvoice {
  id: string;
  tenantId: string;
  companyId: string | null;
  subscriptionId: string;
  billingId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currencyCode: string;
  totalAmount: string;
  issuedAt: string | null;
  dueAt: string;
  paidAt: string | null;
  createdAt: string;
  company: CompanySummary | null;
  billing: { id: string; status: BillingStatus; billingCycle: BillingCycle; periodStart: string; periodEnd: string };
  subscription: { id: string; status: SubscriptionStatus; plan: PlanSummary };
}

export type FeatureConfigFieldType = "NUMBER" | "BOOLEAN" | "STRING" | "SELECT" | "MULTI_SELECT";

export interface FeatureConfigFieldOption {
  value: string;
  label: string;
}

/**
 * Feature-এর নিজস্ব configuration definition (verified: `Feature.configSchema Json?`,
 * `feature-config-field.dto.ts`) — কোন human-friendly field-গুলো PlanFeature.limits-এ
 * configure করা যাবে সেটা এখানে define হয়। Nullable — schema না থাকলে (legacy Feature)
 * Plan Feature assign/edit generic key/value editor-এ fallback করে।
 */
export interface FeatureConfigField {
  key: string;
  label: string;
  description?: string;
  type: FeatureConfigFieldType;
  required?: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  options?: FeatureConfigFieldOption[];
}

/** Platform-wide reusable master entity — many Plans reference the same Feature via PlanFeature (verified: feature.service.ts `_count.planFeatures`). */
export interface Feature {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string | null;
  status: FeatureStatus;
  configSchema: FeatureConfigField[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanPrice {
  id: string;
  planId: string;
  billingCycle: BillingCycle;
  currencyCode: string;
  amount: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  createdAt: string;
}

/** `limits` is a free-form JSON object on the backend (`Record<string, unknown>`, no fixed shape) — not invented here. */
export interface PlanFeatureAssignment {
  planId: string;
  featureId: string;
  enabled: boolean;
  limits: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  feature: Pick<Feature, "id" | "code" | "name" | "module" | "status" | "configSchema"> & {
    description?: string | null;
  };
}

/** `GET /plans/:id` response shape — includes nested features/prices (verified plan.service.ts `findOne`). */
export interface PlanDetail extends Plan {
  features: Omit<PlanFeatureAssignment, "planId" | "featureId">[];
  prices: Omit<PlanPrice, "planId">[];
}

/** `platform/tenants` list/detail response entity (verified tenant-management.service.ts `findAll`/`findOne`). */
export interface Tenant {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: TenantStatus;
  trialEndsAt: string | null;
  activatedAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { companies: number; members: number; subscriptions: number; invitations: number; ownerships?: number };
}

export interface PlatformPayment {
  id: string;
  tenantId: string;
  companyId: string | null;
  invoiceId: string;
  provider: string;
  status: PaymentStatus;
  currencyCode: string;
  amount: string;
  providerTransactionId: string;
  gatewayReference: string | null;
  failureReason: string | null;
  succeededAt: string | null;
  createdAt: string;
  company: CompanySummary | null;
  invoice: { id: string; invoiceNumber: string; status: InvoiceStatus };
  subscription: { id: string; billingCycle: BillingCycle; plan: PlanSummary };
}

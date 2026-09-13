/** Mirrors backend `src/modules/platform-dashboard/platform-dashboard.service.ts`'s response shape exactly. */

export interface PlatformDashboardCompanySnapshot {
  total: number;
  active: number;
}

export interface PlatformDashboardCompanyGrowth {
  newCompanies: number;
  activated: number;
  closed: number;
}

export interface PlatformDashboardMrr {
  current: string;
  arr: string;
  activeSubscriptionCount: number;
  newMrr: string;
  churnedMrr: string;
}

export interface PlatformDashboardCashCollected {
  total: string;
  paymentCount: number;
}

export interface PlatformDashboardSubscriptionActivityCounts {
  newSubscriptions: number;
  renewals: number;
  planChanges: number;
  expired: number;
  cancelled: number;
}

export interface PlatformDashboardPlanPerformance {
  planId: string;
  planCode: string;
  planName: string;
  activeSubscriptions: number;
  mrr: string;
}

export interface PlatformDashboardIndustryPerformance {
  industryId: string;
  industryName: string;
  companyCount: number;
  mrr: string;
}

export interface PlatformDashboardTrialOverview {
  active: number;
  started: number;
  converted: number;
  expired: number;
  conversionRate: number | null;
  expiringSoon: { in3Days: number; in7Days: number; in30Days: number };
}

export interface PlatformDashboardUpcomingExpiry {
  subscriptionId: string;
  companyId: string | null;
  companyName: string;
  planName: string;
  status: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface PlatformDashboardStatusBreakdown {
  [status: string]: { count: number; amount: string };
}

export interface PlatformDashboardPaymentHealth {
  byStatus: PlatformDashboardStatusBreakdown;
  successRate: number | null;
}

export interface PlatformDashboardInvoiceHealth {
  byStatus: PlatformDashboardStatusBreakdown;
}

export interface PlatformDashboardBillingHealth {
  byStatus: Record<string, number>;
  failureRate: number | null;
}

export interface PlatformDashboardActionRequired {
  recentPaymentFailures: number;
  expiringSoon: number;
  expiredCount: number;
  pendingBilling: number;
  awaitingActivation: number;
}

export interface PlatformDashboardRecentCompany {
  companyId: string;
  code: string;
  name: string;
  industryName: string;
  planName: string | null;
  status: string;
  createdAt: string;
}

export interface PlatformDashboardRecentPayment {
  paymentId: string;
  companyId: string | null;
  companyName: string;
  amount: string;
  currencyCode: string;
  provider: string;
  status: string;
  createdAt: string;
}

export interface PlatformDashboardSubscriptionActivityItem {
  eventId: string;
  companyId: string | null;
  companyName: string;
  planName: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string;
  createdAt: string;
}

export interface PlatformDashboardActivityItem {
  id: string;
  action: string;
  entityType: string;
  companyId: string | null;
  createdAt: string;
}

export interface PlatformDashboardRevenuePoint {
  date: string;
  revenue: string;
}

export interface PlatformDashboardCompanyGrowthPoint {
  date: string;
  newCompanies: number;
}

export interface PlatformDashboardExpiryBuckets {
  within7: number;
  within30: number;
  within60: number;
  expired: number;
}

export interface PlatformDashboardOverview {
  currencyCode: string;
  otherCurrencyCompanyCount: number;
  companySnapshot: PlatformDashboardCompanySnapshot;
  companyGrowth: PlatformDashboardCompanyGrowth;
  subscriptionStatusCounts: Record<string, number>;
  mrr: PlatformDashboardMrr;
  cashCollected: PlatformDashboardCashCollected;
  subscriptionActivityCounts: PlatformDashboardSubscriptionActivityCounts;
  planPerformance: PlatformDashboardPlanPerformance[];
  industryPerformance: PlatformDashboardIndustryPerformance[];
  trialOverview: PlatformDashboardTrialOverview;
  upcomingExpiry: PlatformDashboardUpcomingExpiry[];
  paymentHealth: PlatformDashboardPaymentHealth;
  invoiceHealth: PlatformDashboardInvoiceHealth;
  billingHealth: PlatformDashboardBillingHealth;
  actionRequired: PlatformDashboardActionRequired;
  recentCompanies: PlatformDashboardRecentCompany[];
  recentPayments: PlatformDashboardRecentPayment[];
  subscriptionActivity: PlatformDashboardSubscriptionActivityItem[];
  platformActivity: PlatformDashboardActivityItem[];
  platformHealth: { database: boolean };
  revenueSeries: PlatformDashboardRevenuePoint[];
  companyGrowthSeries: PlatformDashboardCompanyGrowthPoint[];
  expiryBuckets: PlatformDashboardExpiryBuckets;
}

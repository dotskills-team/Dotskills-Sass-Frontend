// "use client";

// import { useTranslations } from "next-intl";
// import { Building2, CheckCircle2, CreditCard, FileText, Receipt, Wallet } from "lucide-react";

// import { PageHeader } from "@/components/shared/page-header";
// import { StatCard } from "@/components/shared/stat-card";
// import { UserGreeting } from "@/features/auth/components/user-greeting";

// import { useListCompaniesQuery } from "@/features/company/api/company.api";
// import { useListSubscriptionsQuery } from "@/features/subscription/api/subscription.api";
// import { useListBillingsQuery } from "@/features/billing/api/billing.api";
// import { useListInvoicesQuery } from "@/features/invoice/api/invoice.api";
// import { useListPaymentsQuery } from "@/features/payment/api/payment.api";

// /**
//  * প্রতিটা card real backend data থেকে — কোনো fake statistic নেই।
//  *
//  * "Active Subscriptions" card-টা একটা সততার সাথে-disclosed সীমাবদ্ধতা
//  * বহন করে: backend-এর `/platform/subscriptions` কোনো filter/pagination
//  * সমর্থন করে না এবং সর্বোচ্চ ১০০টা row দেয় (verified) — তাই এই সংখ্যা
//  * "সাম্প্রতিক ১০০টার মধ্যে active" (client-side filter করা), সব
//  * company-র প্রকৃত মোট active subscription সংখ্যা নয়। বাকি সব card
//  * সরাসরি backend-এর `meta.total` থেকে আসে (authoritative)।
//  */
// export default function PlatformDashboardPage() {
//   const t = useTranslations("dashboard");

//   const companies = useListCompaniesQuery({ limit: 1 });
//   const activeCompanies = useListCompaniesQuery({ limit: 1, status: "LIVE" });
//   const subscriptions = useListSubscriptionsQuery();
//   const pendingBilling = useListBillingsQuery({ limit: 1, status: "PENDING" });
//   const outstandingInvoices = useListInvoicesQuery({ limit: 1, status: "ISSUED" });
//   const successfulPayments = useListPaymentsQuery({ limit: 1, status: "SUCCEEDED" });

//   const activeSubscriptionsCount = subscriptions.data?.items.filter(
//     (s) => s.status === "ACTIVE",
//   ).length;

//   return (
//     <div>
//       <PageHeader title={t("title")} description={t("description")} />

//       <div className="p-6">
//         <UserGreeting />

//         <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           <StatCard
//             label={t("totalCompanies")}
//             value={companies.data?.meta?.total ?? "—"}
//             icon={Building2}
//             isLoading={companies.isLoading}
//           />
//           <StatCard
//             label={t("activeCompanies")}
//             value={activeCompanies.data?.meta?.total ?? "—"}
//             icon={CheckCircle2}
//             isLoading={activeCompanies.isLoading}
//           />
//           <StatCard
//             label={t("activeSubscriptions")}
//             value={activeSubscriptionsCount ?? "—"}
//             icon={CreditCard}
//             isLoading={subscriptions.isLoading}
//           />
//           <StatCard
//             label={t("pendingBilling")}
//             value={pendingBilling.data?.meta?.total ?? "—"}
//             icon={Receipt}
//             isLoading={pendingBilling.isLoading}
//           />
//           <StatCard
//             label={t("outstandingInvoices")}
//             value={outstandingInvoices.data?.meta?.total ?? "—"}
//             icon={FileText}
//             isLoading={outstandingInvoices.isLoading}
//           />
//           <StatCard
//             label={t("successfulPayments")}
//             value={successfulPayments.data?.meta?.total ?? "—"}
//             icon={Wallet}
//             isLoading={successfulPayments.isLoading}
//           />
//         </div>

//         <p className="mt-4 text-xs text-muted-foreground">{t("activeSubscriptionsCaveat")}</p>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Receipt,
  Server,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { UserGreeting } from "@/features/auth/components/user-greeting";

const summaryCards = [
  {
    label: "Total Companies",
    value: "248",
    change: "+18 this month",
    icon: Building2,
  },
  {
    label: "Active Companies",
    value: "221",
    change: "+12 this month",
    icon: CheckCircle2,
  },
  {
    label: "Active Subscriptions",
    value: "205",
    change: "+9 this month",
    icon: CreditCard,
  },
  {
    label: "Monthly Revenue",
    value: "৳8,45,000",
    change: "+14.8%",
    icon: DollarSign,
  },
  {
    label: "Past Due",
    value: "12",
    change: "Needs attention",
    icon: AlertTriangle,
  },
  {
    label: "Trial Companies",
    value: "24",
    change: "8 expire this week",
    icon: Users,
  },
];

const subscriptionStats = [
  { label: "Active", value: 205, percentage: 82 },
  { label: "Trialing", value: 24, percentage: 10 },
  { label: "Past Due", value: 12, percentage: 5 },
  { label: "Grace", value: 4, percentage: 2 },
  { label: "Suspended", value: 5, percentage: 2 },
  { label: "Cancelled", value: 8, percentage: 3 },
];

const revenueData = [
  { month: "Jan", value: 520000 },
  { month: "Feb", value: 580000 },
  { month: "Mar", value: 620000 },
  { month: "Apr", value: 690000 },
  { month: "May", value: 730000 },
  { month: "Jun", value: 790000 },
  { month: "Jul", value: 845000 },
];

const industries = [
  { name: "Super Shop", companies: 92, percentage: 37 },
  { name: "Pharmacy", companies: 58, percentage: 23 },
  { name: "Restaurant", companies: 41, percentage: 17 },
  { name: "Fashion", companies: 32, percentage: 13 },
  { name: "Service Business", companies: 25, percentage: 10 },
];

const plans = [
  {
    name: "PRO",
    companies: 102,
    revenue: "৳4,85,000",
    growth: "+18%",
  },
  {
    name: "BASIC",
    companies: 86,
    revenue: "৳2,15,000",
    growth: "+9%",
  },
  {
    name: "PREMIUM",
    companies: 43,
    revenue: "৳1,45,000",
    growth: "+24%",
  },
];

const alerts = [
  {
    title: "12 subscriptions are Past Due",
    description: "Payment action may be required",
    type: "danger",
  },
  {
    title: "4 subscriptions are in Grace Period",
    description: "Review before suspension",
    type: "warning",
  },
  {
    title: "5 companies are Suspended",
    description: "Review company status",
    type: "danger",
  },
  {
    title: "7 payments failed today",
    description: "Payment gateway requires attention",
    type: "warning",
  },
];

const recentCompanies = [
  {
    name: "Fresh Restaurant",
    plan: "PRO",
    status: "Active",
    time: "10 min ago",
  },
  {
    name: "ABC Pharmacy",
    plan: "BASIC",
    status: "Trial",
    time: "35 min ago",
  },
  {
    name: "Smart Fashion",
    plan: "PRO",
    status: "Active",
    time: "1 hour ago",
  },
  {
    name: "Daily Super Shop",
    plan: "PREMIUM",
    status: "Active",
    time: "2 hours ago",
  },
];

const recentInvoices = [
  {
    id: "INV-1024",
    company: "Fresh Restaurant",
    amount: "৳2,500",
    status: "Paid",
  },
  {
    id: "INV-1023",
    company: "ABC Pharmacy",
    amount: "৳5,000",
    status: "Pending",
  },
  {
    id: "INV-1022",
    company: "Smart Super Shop",
    amount: "৳10,000",
    status: "Paid",
  },
  {
    id: "INV-1021",
    company: "Smart Fashion",
    amount: "৳7,500",
    status: "Paid",
  },
];

const activities = [
  {
    title: "Company activated",
    description: "Fresh Restaurant was activated",
    time: "2 min ago",
  },
  {
    title: "Plan price updated",
    description: "PRO yearly price was updated",
    time: "18 min ago",
  },
  {
    title: "Auto-renew enabled",
    description: "Subscription auto-renew was enabled",
    time: "32 min ago",
  },
  {
    title: "Company suspended",
    description: "ABC Store was suspended",
    time: "1 hour ago",
  },
];

const modules = [
  { name: "POS", usage: 184 },
  { name: "Inventory", usage: 172 },
  { name: "Sales", usage: 165 },
  { name: "Purchase", usage: 151 },
  { name: "Accounting", usage: 128 },
];

function formatRevenue(value: number) {
  return `${Math.round(value / 1000)}k`;
}

export default function PlatformDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <PageHeader
        title="Platform Dashboard"
        description="Monitor your DotSkills SaaS platform"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Header */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <UserGreeting />

              <p className="mt-1 text-sm text-muted-foreground">
                Here&apos;s what&apos;s happening across your platform today.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
                Today
              </button>

              <button className="rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
                All Companies
              </button>

              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90">
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Cards */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-xl border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {card.label}
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {card.change}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Revenue + Company Growth */}

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            {/* Revenue */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Revenue Overview
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Monthly platform revenue
                  </p>
                </div>

                <div className="flex rounded-lg border bg-muted/30 p-1 text-xs">
                  <button className="rounded-md bg-background px-3 py-1.5 font-medium shadow-sm">
                    7M
                  </button>

                  <button className="px-3 py-1.5 text-muted-foreground">
                    12M
                  </button>

                  <button className="px-3 py-1.5 text-muted-foreground">
                    Year
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-end gap-4">
                <div>
                  <p className="text-3xl font-bold">৳8,45,000</p>

                  <p className="mt-1 text-sm text-emerald-600">
                    +14.8% from last month
                  </p>
                </div>
              </div>

              <div className="flex h-[260px] items-end gap-3 sm:gap-5">
                {revenueData.map((item) => {
                  const height = (item.value / 900000) * 100;

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="mb-2 text-center text-[10px] text-muted-foreground">
                        ৳{formatRevenue(item.value)}
                      </div>

                      <div className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-lg bg-primary/80 transition hover:bg-primary"
                          style={{ height: `${height}%` }}
                        />
                      </div>

                      <div className="mt-3 text-center text-xs text-muted-foreground">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Company Growth */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  Company Growth
                </h2>

                <p className="text-sm text-muted-foreground">
                  Platform company statistics
                </p>
              </div>

              <div className="space-y-5">
                <GrowthRow
                  label="Total Companies"
                  value="248"
                  percentage="100%"
                  width="100%"
                />

                <GrowthRow
                  label="Active Companies"
                  value="221"
                  percentage="89%"
                  width="89%"
                />

                <GrowthRow
                  label="Trial Companies"
                  value="24"
                  percentage="10%"
                  width="35%"
                />

                <GrowthRow
                  label="Suspended"
                  value="5"
                  percentage="2%"
                  width="12%"
                />
              </div>

              <div className="mt-7 rounded-lg bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold">
                      +18 new companies
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Added this month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription + Industry */}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Subscription */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Subscription Overview
                </h2>

                <p className="text-sm text-muted-foreground">
                  Current subscription lifecycle
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {subscriptionStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border p-4"
                  >
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {item.value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.percentage}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Industry Distribution
                </h2>

                <p className="text-sm text-muted-foreground">
                  Companies by industry
                </p>
              </div>

              <div className="space-y-4">
                {industries.map((industry) => (
                  <div key={industry.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{industry.name}</span>

                      <span className="font-medium">
                        {industry.companies}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${industry.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Critical Alerts
                </h2>

                <p className="text-sm text-muted-foreground">
                  Items that need platform admin attention
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                {alerts.length} Alerts
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="flex gap-3 rounded-lg border p-4"
                >
                  {alert.type === "danger" ? (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                  )}

                  <div>
                    <p className="text-sm font-medium">
                      {alert.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Plan Performance
              </h2>

              <p className="text-sm text-muted-foreground">
                Subscription and revenue by plan
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">
                      Companies
                    </th>
                    <th className="pb-3 font-medium">Revenue</th>
                    <th className="pb-3 font-medium">Growth</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {plans.map((plan) => (
                    <tr key={plan.name}>
                      <td className="py-4 font-semibold">
                        {plan.name}
                      </td>

                      <td className="py-4">
                        {plan.companies}
                      </td>

                      <td className="py-4 font-medium">
                        {plan.revenue}
                      </td>

                      <td className="py-4 font-semibold text-emerald-600">
                        {plan.growth}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Companies + Invoices */}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Companies */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recent Companies
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Recently registered companies
                  </p>
                </div>

                <button className="text-sm font-medium text-primary hover:underline">
                  View All →
                </button>
              </div>

              <div className="divide-y">
                {recentCompanies.map((company) => (
                  <div
                    key={company.name}
                    className="flex items-center gap-3 py-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {company.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {company.plan} · {company.time}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        company.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                          : "bg-orange-50 text-orange-600 dark:bg-orange-950/30"
                      }`}
                    >
                      {company.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recent Invoices
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Latest platform invoices
                  </p>
                </div>

                <button className="text-sm font-medium text-primary hover:underline">
                  View All →
                </button>
              </div>

              <div className="divide-y">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center gap-3 py-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {invoice.id}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {invoice.company}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {invoice.amount}
                      </p>

                      <p
                        className={`text-xs ${
                          invoice.status === "Paid"
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }`}
                      >
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Health */}

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Payment & Billing Health
              </h2>

              <p className="text-sm text-muted-foreground">
                Current payment processing overview
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <HealthCard
                icon={CheckCircle2}
                label="Successful Payments"
                value="৳7,82,000"
                description="94.2% success rate"
              />

              <HealthCard
                icon={Receipt}
                label="Pending Billing"
                value="৳42,000"
                description="18 pending records"
              />

              <HealthCard
                icon={XCircle}
                label="Failed Payments"
                value="৳21,000"
                description="7 failed today"
              />

              <HealthCard
                icon={Wallet}
                label="Outstanding"
                value="৳68,500"
                description="24 outstanding invoices"
              />
            </div>
          </div>

          {/* Activity + Modules */}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Activity */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Recent Platform Activity
                </h2>

                <p className="text-sm text-muted-foreground">
                  Latest administrative actions
                </p>
              </div>

              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={`${activity.title}-${activity.time}`}
                    className="flex gap-3"
                  >
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Usage */}

            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Feature & Module Usage
                </h2>

                <p className="text-sm text-muted-foreground">
                  Most used platform features
                </p>
              </div>

              <div className="space-y-4">
                {modules.map((module) => {
                  const percentage = Math.round(
                    (module.usage / 205) * 100,
                  );

                  return (
                    <div key={module.name}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{module.name}</span>

                        <span className="font-medium">
                          {module.usage} companies
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* System Health */}

          <div className="rounded-xl border bg-background p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                System Health
              </h2>

              <p className="text-sm text-muted-foreground">
                Platform infrastructure status
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SystemStatus label="API" />
              <SystemStatus label="Database" />
              <SystemStatus label="Redis" />
              <SystemStatus label="Authentication" />
              <SystemStatus label="Payment Gateway" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function GrowthRow({
  label,
  value,
  percentage,
  width,
}: {
  label: string;
  value: string;
  percentage: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>

        <span className="font-semibold">
          {value} · {percentage}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function HealthCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-emerald-600" />

        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SystemStatus({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Server className="h-5 w-5 text-muted-foreground" />

        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Operational
      </div>
    </div>
  );
}

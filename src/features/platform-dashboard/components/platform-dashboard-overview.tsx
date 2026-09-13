"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Layers,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { DATE_PRESETS, resolvePresetRange, type DatePreset } from "@/features/dashboard/lib/date-presets";
import { useGetPlatformDashboardOverviewQuery } from "@/features/platform-dashboard/api/platform-dashboard.api";
import { RevenueAnalyticsChart } from "@/features/platform-dashboard/components/revenue-analytics-chart";
import { CompanyGrowthChart } from "@/features/platform-dashboard/components/company-growth-chart";
import { StatusDonutChart } from "@/features/platform-dashboard/components/status-donut-chart";
import { PlanPerformanceChart } from "@/features/platform-dashboard/components/plan-performance-chart";
import { IndustryPerformanceChart } from "@/features/platform-dashboard/components/industry-performance-chart";
import { TrialFunnel } from "@/features/platform-dashboard/components/trial-funnel";
import { ExpiryBuckets } from "@/features/platform-dashboard/components/expiry-buckets";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { normalizeApiError } from "@/lib/api-error";

const PRESET_LABEL: Record<DatePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7Days: "Last 7 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisYear: "This Year",
  custom: "Custom Range",
};

export function PlatformDashboardOverview() {
  const [preset, setPreset] = useState<DatePreset>("thisMonth");
  const [{ dateFrom, dateTo }, setRange] = useState(() => resolvePresetRange("thisMonth")!);

  const { data, isLoading, isFetching, error, refetch } = useGetPlatformDashboardOverviewQuery({ dateFrom, dateTo });

  function handlePresetChange(value: DatePreset) {
    setPreset(value);
    const resolved = resolvePresetRange(value);
    if (resolved) setRange(resolved);
  }

  if (isLoading) return <PlatformDashboardSkeleton />;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{normalizeApiError(error).message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const currency = data.currencyCode;
  const money = (value: string) => formatCurrency(value, currency);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Platform Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">How the entire DotSkills SaaS platform is performing.</p>
          {data.otherCurrencyCompanyCount > 0 && (
            <p className="mt-1 text-xs text-warning">
              Money figures below are shown in {currency} only — {data.otherCurrencyCompanyCount} compan
              {data.otherCurrencyCompanyCount === 1 ? "y uses" : "ies use"} a different currency and are excluded to
              avoid mixing currencies.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-info/5 p-3 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Date range
            </Label>
            <Select value={preset} onValueChange={(value) => handlePresetChange(value as DatePreset)}>
              <SelectTrigger className="w-40 border-primary/25 bg-primary/5 focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PRESET_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-info">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              From
            </Label>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(event) => {
                setPreset("custom");
                setRange((prev) => ({ ...prev, dateFrom: event.target.value }));
              }}
              className="w-40 border-info/25 bg-info/5 focus-visible:border-info focus-visible:ring-info/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-info">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              To
            </Label>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(event) => {
                setPreset("custom");
                setRange((prev) => ({ ...prev, dateTo: event.target.value }));
              }}
              className="w-40 border-info/25 bg-info/5 focus-visible:border-info focus-visible:ring-info/30"
            />
          </div>

          <Button
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-success text-success-foreground shadow-sm hover:bg-success/90"
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Wallet} label="MRR" value={money(data.mrr.current)} helperText="Current snapshot" tone="primary" />
        <KpiCard icon={TrendingUp} label="ARR" value={money(data.mrr.arr)} helperText="Current snapshot" tone="info" />
        <KpiCard
          icon={Building2}
          label="Active Companies"
          value={String(data.companySnapshot.active)}
          helperText="Current snapshot"
          tone="success"
        />
        <KpiCard
          icon={Building2}
          label="New Companies"
          value={String(data.companyGrowth.newCompanies)}
          helperText="Selected period"
          tone="success"
        />
        <KpiCard icon={TrendingUp} label="New MRR" value={money(data.mrr.newMrr)} helperText="Selected period" tone="primary" />
        <KpiCard
          icon={Banknote}
          label="Cash Collected"
          value={money(data.cashCollected.total)}
          helperText="Selected period"
          tone="warning"
        />
      </div>

      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily successful-payment revenue for the selected period. Kept separate from MRR below — revenue is cash
            actually collected, MRR is the recurring-value snapshot; the two are never conflated.
          </p>
        </CardHeader>
        <CardContent>
          {data.revenueSeries.length === 0 ? (
            <EmptyState title="No successful payments in this period." icon={Banknote} />
          ) : (
            <RevenueAnalyticsChart data={data.revenueSeries} currencyCode={currency} />
          )}
        </CardContent>
      </Card>

      {/* MRR Performance */}
      <Card>
        <CardHeader>
          <CardTitle>MRR Performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Only movements reliably derivable from subscription status transitions are shown — Expansion/Contraction/
            Reactivation MRR are not computed (no historical price-at-event data exists to derive them accurately).
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat label="Current MRR" value={money(data.mrr.current)} />
          <MiniStat label="New MRR (period)" value={money(data.mrr.newMrr)} tone="success" />
          <MiniStat label="Churned MRR (period)" value={money(data.mrr.churnedMrr)} tone="destructive" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Company Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="New" value={String(data.companyGrowth.newCompanies)} tone="success" />
              <MiniStat label="Activated" value={String(data.companyGrowth.activated)} />
              <MiniStat label="Closed (total)" value={String(data.companyGrowth.closed)} tone="destructive" />
            </div>
            {data.companyGrowthSeries.length === 0 ? (
              <EmptyState title="No new companies in this period." icon={Building2} />
            ) : (
              <CompanyGrowthChart data={data.companyGrowthSeries} />
            )}
          </CardContent>
        </Card>

        {/* Subscription Health */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusDonutChart
              slices={Object.entries(data.subscriptionStatusCounts).map(([status, count]) => ({ status, count }))}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
              <MiniStat label="New" value={String(data.subscriptionActivityCounts.newSubscriptions)} compact />
              <MiniStat label="Renewals" value={String(data.subscriptionActivityCounts.renewals)} compact />
              <MiniStat label="Plan Changes" value={String(data.subscriptionActivityCounts.planChanges)} compact />
              <MiniStat label="Expired" value={String(data.subscriptionActivityCounts.expired)} compact tone="destructive" />
              <MiniStat label="Cancelled" value={String(data.subscriptionActivityCounts.cancelled)} compact tone="destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.planPerformance.length === 0 ? (
              <EmptyState title="No active subscriptions yet" icon={Layers} />
            ) : (
              <PlanPerformanceChart data={data.planPerformance} currencyCode={currency} />
            )}
          </CardContent>
        </Card>

        {/* Industry Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.industryPerformance.length === 0 ? (
              <EmptyState title="No companies yet" icon={Building2} />
            ) : (
              <IndustryPerformanceChart data={data.industryPerformance} currencyCode={currency} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Active Trials" value={String(data.trialOverview.active)} />
            <MiniStat label="Expiring in 3 Days" value={String(data.trialOverview.expiringSoon.in3Days)} tone="destructive" />
            <MiniStat label="Expiring in 7 Days" value={String(data.trialOverview.expiringSoon.in7Days)} tone="warning" />
            <MiniStat label="Expiring in 30 Days" value={String(data.trialOverview.expiringSoon.in30Days)} />
          </div>
          <TrialFunnel data={data.trialOverview} />
        </CardContent>
      </Card>

      {/* Expiry / Renewal */}
      <Card>
        <CardHeader>
          <CardTitle>Expiry &amp; Renewal</CardTitle>
          <p className="text-sm text-muted-foreground">Current snapshot of active-subscription expiry windows.</p>
        </CardHeader>
        <CardContent>
          <ExpiryBuckets data={data.expiryBuckets} />
        </CardContent>
      </Card>

      {/* Upcoming Expiry */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Subscription Expiry</CardTitle>
          <p className="text-sm text-muted-foreground">Active subscriptions renewing/expiring in the next 30 days.</p>
        </CardHeader>
        <CardContent>
          {data.upcomingExpiry.length === 0 ? (
            <EmptyState title="No upcoming subscription expiries." icon={Clock} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Expiry Date</th>
                    <th className="pb-2 font-medium">Auto Renew</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.upcomingExpiry.map((row) => (
                    <tr key={row.subscriptionId}>
                      <td className="py-2 font-medium">
                        {row.companyId ? (
                          <Link href={`/platform/companies/${row.companyId}`} className="text-primary hover:underline">
                            {row.companyName}
                          </Link>
                        ) : (
                          row.companyName
                        )}
                      </td>
                      <td className="py-2">{row.planName}</td>
                      <td className="py-2">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-2">{formatDate(row.expiresAt)}</td>
                      <td className="py-2">{row.autoRenew ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment / Invoice / Billing Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Payment Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(data.paymentHealth.byStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments found for this period.</p>
            ) : (
              <>
                <StatusDonutChart
                  slices={Object.entries(data.paymentHealth.byStatus).map(([status, info]) => ({
                    status,
                    count: info.count,
                  }))}
                />
                <div className="space-y-1">
                  {Object.entries(data.paymentHealth.byStatus).map(([status, info]) => (
                    <div key={status} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{status}</span>
                      <span>{money(info.amount)}</span>
                    </div>
                  ))}
                </div>
                {data.paymentHealth.successRate !== null && (
                  <p className="pt-1 text-xs text-muted-foreground">Success rate: {data.paymentHealth.successRate}%</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(data.invoiceHealth.byStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices found for this period.</p>
            ) : (
              <>
                <StatusDonutChart
                  slices={Object.entries(data.invoiceHealth.byStatus).map(([status, info]) => ({
                    status,
                    count: info.count,
                  }))}
                />
                <div className="space-y-1">
                  {Object.entries(data.invoiceHealth.byStatus).map(([status, info]) => (
                    <div key={status} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{status}</span>
                      <span>{money(info.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(data.billingHealth.byStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No billing attempts found for this period.</p>
            ) : (
              <>
                {Object.entries(data.billingHealth.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <StatusBadge status={status} />
                    <span>{count}</span>
                  </div>
                ))}
                {data.billingHealth.failureRate !== null && (
                  <p className="pt-2 text-xs text-muted-foreground">Failure rate: {data.billingHealth.failureRate}%</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Required */}
      <Card>
        <CardHeader>
          <CardTitle>Action Required</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.values(data.actionRequired).every((count) => count === 0) ? (
            <EmptyState title="Nothing needs your attention right now." icon={CheckCircle2} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ActionItem count={data.actionRequired.recentPaymentFailures} label="payment failures (last 7 days)" href="/platform/payments" />
              <ActionItem count={data.actionRequired.expiringSoon} label="subscriptions expiring within 7 days" href="/platform/subscriptions" />
              <ActionItem count={data.actionRequired.expiredCount} label="expired subscriptions" href="/platform/subscriptions" />
              <ActionItem count={data.actionRequired.pendingBilling} label="pending billing attempts" href="/platform/billing" />
              <ActionItem count={data.actionRequired.awaitingActivation} label="companies awaiting activation" href="/platform/companies" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentCompanies.length === 0 ? (
              <EmptyState title="No companies yet." icon={Building2} />
            ) : (
              <ul className="divide-y">
                {data.recentCompanies.map((company) => (
                  <li key={company.companyId} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/platform/companies/${company.companyId}`} className="truncate font-medium text-primary hover:underline">
                        {company.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {company.code} · {company.industryName} {company.planName ? `· ${company.planName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={company.status} />
                      <span className="text-xs text-muted-foreground">{formatDate(company.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentPayments.length === 0 ? (
              <EmptyState title="No payments found." icon={CreditCard} />
            ) : (
              <ul className="divide-y">
                {data.recentPayments.map((payment) => (
                  <li key={payment.paymentId} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/platform/payments/${payment.paymentId}`} className="truncate font-medium text-primary hover:underline">
                        {payment.companyName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {payment.provider} · {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={payment.status} />
                      <span className="text-sm font-semibold">{formatCurrency(payment.amount, payment.currencyCode)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.subscriptionActivity.length === 0 ? (
              <EmptyState title="No subscription activity yet." icon={TrendingDown} />
            ) : (
              <ul className="space-y-3">
                {data.subscriptionActivity.map((event) => (
                  <li key={event.eventId} className="text-sm">
                    <div className="flex items-center justify-between">
                      {event.companyId ? (
                        <Link href={`/platform/companies/${event.companyId}`} className="font-medium text-primary hover:underline">
                          {event.companyName}
                        </Link>
                      ) : (
                        <span className="font-medium">{event.companyName}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.planName} — {event.fromStatus ?? "NEW"} → {event.toStatus} ({event.reason.replaceAll("_", " ")})
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Platform Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.platformActivity.length === 0 ? (
              <EmptyState title="No platform activity recorded yet." icon={ShieldCheck} />
            ) : (
              <ul className="space-y-3">
                {data.platformActivity.map((activity) => (
                  <li key={activity.id} className="flex items-center justify-between text-sm">
                    <span>{activity.action.replaceAll("_", " ")}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <p className="text-sm text-muted-foreground">Only genuinely checked systems are shown here.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm font-medium">Database</span>
            {data.platformHealth.database ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" aria-hidden="true" /> Healthy
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                <XCircle className="size-4" aria-hidden="true" /> Unhealthy
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  compact,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive" | "warning";
  compact?: boolean;
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-lg border p-3">
      <p className={compact ? `text-sm font-bold ${toneClass}` : `text-xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionItem({ count, label, href }: { count: number; label: string; href: string }) {
  if (count === 0) return null;
  return (
    <Link href={href} className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:bg-muted/40">
      <span className="text-sm">
        <span className="font-semibold text-foreground">{count}</span> {label}
      </span>
      <span className="text-xs font-medium text-primary">View →</span>
    </Link>
  );
}

function PlatformDashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}

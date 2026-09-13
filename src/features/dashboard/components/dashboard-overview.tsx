"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Banknote,
  Box,
  Boxes,
  CalendarClock,
  CreditCard,
  Package,
  PackageX,
  Percent,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { SetupStatusCard } from "@/features/setup-status/components/setup-status-card";
import { useGetDashboardOverviewQuery } from "@/features/dashboard/api/dashboard.api";
import { KpiCard, type KpiTone } from "@/features/dashboard/components/kpi-card";
import { SalesPerformanceChart } from "@/features/dashboard/components/sales-performance-chart";
import { DateRangeFilter, ALL_LOCATIONS } from "@/features/reporting/components/date-range-filter";
import { DATE_PRESETS, resolvePresetRange, type DatePreset } from "@/features/dashboard/lib/date-presets";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { normalizeApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  return (
    <div>
      {/* Always rendered, regardless of REPORT_READ — this is exactly the
          one thing an Owner whose RBAC/subscription isn't ready yet still
          needs to see (see Day 4-7 Setup Status work); never gate it behind
          the same permission the overview below requires. */}
      <div className="p-4 pb-0 sm:p-6 sm:pb-0 lg:p-8 lg:pb-0">
        <SetupStatusCard />
      </div>
      <CompanyPermissionGate permission={COMPANY_PERMISSIONS.REPORT_READ} fallback={<PermissionDenied />}>
        <DashboardOverviewContent />
      </CompanyPermissionGate>
    </div>
  );
}

function DashboardOverviewContent() {
  const t = useTranslations("companyDashboard");
  const { company } = useCurrentCompany();
  const companyId = company?.companyId;

  const [preset, setPreset] = useState<DatePreset>("thisMonth");
  const [{ dateFrom, dateTo }, setRange] = useState(() => resolvePresetRange("thisMonth")!);
  const [locationId, setLocationId] = useState(ALL_LOCATIONS);

  const { data, isLoading, isFetching, error, refetch } = useGetDashboardOverviewQuery(
    {
      companyId: companyId ?? "",
      dateFrom,
      dateTo,
      locationId: locationId === ALL_LOCATIONS ? undefined : locationId,
    },
    { skip: !companyId },
  );

  function handlePresetChange(value: DatePreset) {
    setPreset(value);
    const resolved = resolvePresetRange(value);
    if (resolved) setRange(resolved);
  }

  if (!companyId || isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyStateWithRetry message={normalizeApiError(error).message} onRetry={refetch} />
      </div>
    );
  }

  if (!data) return null;

  const currencyCode = data.currencyCode;
  const money = (value: string) => formatCurrency(value, currencyCode);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-info/5 p-3 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {t("datePreset.label")}
            </span>
            <Select value={preset} onValueChange={(value) => handlePresetChange(value as DatePreset)}>
              <SelectTrigger className="w-40 border-primary/25 bg-primary/5 focus-visible:border-primary focus-visible:ring-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`datePreset.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={(value) => {
              setPreset("custom");
              setRange((prev) => ({ ...prev, dateFrom: value }));
            }}
            onDateToChange={(value) => {
              setPreset("custom");
              setRange((prev) => ({ ...prev, dateTo: value }));
            }}
            locationId={locationId}
            onLocationChange={setLocationId}
            locations={data.scope.locations}
            showLocationFilter={data.scope.hasBranches}
            labels={{
              dateFrom: t("dateFrom"),
              dateTo: t("dateTo"),
              locationPlaceholder: t("locationPlaceholder"),
              allLocations: t("allBranches"),
            }}
          />

          <Button
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-success text-success-foreground shadow-sm hover:bg-success/90"
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Wallet} label={t("kpi.sales")} value={money(data.kpis.sales)} tone="primary" />
        <KpiCard icon={ShoppingCart} label={t("kpi.orders")} value={String(data.kpis.orders)} tone="info" />
        <KpiCard icon={TrendingUp} label={t("kpi.grossProfit")} value={money(data.kpis.grossProfit)} tone="success" />
        <KpiCard
          icon={Percent}
          label={t("kpi.grossMargin")}
          value={data.kpis.grossMarginPercent === null ? "—" : `${data.kpis.grossMarginPercent}%`}
          tone="success"
        />
        <KpiCard
          icon={CreditCard}
          label={t("kpi.receivable")}
          value={money(data.kpis.receivable.total)}
          helperText={
            data.kpis.receivable.customerCount > 0
              ? t("kpi.dueCustomers", { count: data.kpis.receivable.customerCount })
              : undefined
          }
          onClick={() => (window.location.href = "/company/reports/due-payable")}
          tone="warning"
        />
        <KpiCard
          icon={TrendingDown}
          label={t("kpi.payable")}
          value={money(data.kpis.payable.total)}
          helperText={
            data.kpis.payable.supplierCount > 0
              ? t("kpi.dueSuppliers", { count: data.kpis.payable.supplierCount })
              : undefined
          }
          onClick={() => (window.location.href = "/company/reports/due-payable")}
          tone="destructive"
        />
      </div>

      {/* Sales Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("salesPerformance.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("salesPerformance.description")}</p>
        </CardHeader>
        <CardContent>
          {data.salesPerformance.length === 0 ? (
            <EmptyState title={t("salesPerformance.empty")} icon={TrendingUp} />
          ) : (
            <SalesPerformanceChart data={data.salesPerformance} currencyCode={currencyCode} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Health */}
        <Card>
          <CardHeader>
            <CardTitle>{t("inventoryHealth.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              icon={Wallet}
              label={t("inventoryHealth.value")}
              value={money(data.inventoryHealth.inventoryValue)}
              tone="primary"
            />
            <MiniStat
              icon={Boxes}
              label={t("inventoryHealth.products")}
              value={String(data.inventoryHealth.totalProducts)}
              tone="info"
            />
            <MiniStat
              icon={Package}
              label={t("inventoryHealth.lowStock")}
              value={String(data.inventoryHealth.lowStock)}
              tone={data.inventoryHealth.lowStock > 0 ? "warning" : "success"}
              href="/company/reports/stock"
            />
            <MiniStat
              icon={PackageX}
              label={t("inventoryHealth.outOfStock")}
              value={String(data.inventoryHealth.outOfStock)}
              tone={data.inventoryHealth.outOfStock > 0 ? "destructive" : "success"}
              href="/company/reports/stock"
            />
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>{t("topProducts.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("topProducts.description")}</p>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <EmptyState title={t("topProducts.empty")} icon={Package} />
            ) : (
              <ul className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <li key={product.productId} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        index === 0
                          ? "bg-warning/20 text-warning"
                          : index === 1
                            ? "bg-muted-foreground/15 text-muted-foreground"
                            : index === 2
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("topProducts.unitsSold", { count: product.quantitySold })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-success">{money(product.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Package}
          tone="info"
          title={t("purchaseOverview.title")}
          value={money(data.purchaseOverview.totalPurchases)}
          helperText={t("purchaseOverview.orderCount", { count: data.purchaseOverview.purchaseOrderCount })}
        />

        <SummaryCard
          icon={CreditCard}
          tone="warning"
          title={t("receivable.title")}
          value={money(data.kpis.receivable.total)}
          helperText={t("receivable.viewAll")}
          href="/company/reports/due-payable"
        />

        <SummaryCard
          icon={TrendingDown}
          tone="destructive"
          title={t("payable.title")}
          value={money(data.kpis.payable.total)}
          helperText={t("payable.viewAll")}
          href="/company/reports/due-payable"
        />

        <SummaryCard
          icon={Banknote}
          tone="success"
          title={t("cashPosition.title")}
          value={
            data.cashPosition.openSessionCount === 0 ? t("cashPosition.empty") : money(data.cashPosition.totalOpeningFloat)
          }
          helperText={
            data.cashPosition.openSessionCount === 0
              ? undefined
              : t("cashPosition.openSessions", { count: data.cashPosition.openSessionCount })
          }
        />
      </div>

      {data.branchPerformance && data.branchPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("branchPerformance.title")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="pb-2 font-medium">{t("branchPerformance.branch")}</th>
                  <th className="pb-2 font-medium">{t("branchPerformance.sales")}</th>
                  <th className="pb-2 font-medium">{t("branchPerformance.orders")}</th>
                  <th className="pb-2 font-medium">{t("branchPerformance.profit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.branchPerformance.map((branch) => (
                  <tr key={branch.locationId}>
                    <td className="py-3 font-medium">{branch.name}</td>
                    <td className="py-3 font-semibold text-primary">{money(branch.sales)}</td>
                    <td className="py-3 font-semibold text-info">{branch.orders}</td>
                    <td className="py-3 font-semibold text-success">{money(branch.grossProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Action Required */}
        <Card>
          <CardHeader>
            <CardTitle>{t("actionRequired.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.actionRequired.length === 0 ? (
              <EmptyState title={t("actionRequired.empty")} icon={AlertTriangle} />
            ) : (
              <ul className="space-y-3">
                {data.actionRequired.map((alert) => (
                  <li key={alert.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{alert.type.replaceAll("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentTransactions.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length === 0 ? (
              <EmptyState title={t("recentTransactions.empty")} icon={Box} />
            ) : (
              <ul className="divide-y">
                {data.recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="flex items-center gap-3 py-3">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        transaction.type === "SALE" ? "bg-success/15 text-success" : "bg-info/15 text-info",
                      )}
                    >
                      {transaction.type === "SALE" ? (
                        <ShoppingCart className="size-5" aria-hidden="true" />
                      ) : (
                        <Banknote className="size-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{transaction.reference}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {transaction.party ?? "—"} · {formatDate(transaction.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        transaction.type === "SALE" ? "text-success" : "text-info",
                      )}
                    >
                      {money(transaction.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const TONE_BADGE_CLASS: Record<KpiTone, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/15 text-info",
};

const TONE_TEXT_CLASS: Record<KpiTone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: KpiTone;
  href?: string;
}) {
  const content = (
    <div
      className={cn(
        "rounded-lg border p-4 transition",
        href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <span className={cn("flex size-9 items-center justify-center rounded-lg", TONE_BADGE_CLASS[tone])}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <p className={cn("mt-2 text-xl font-bold", TONE_TEXT_CLASS[tone])}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function SummaryCard({
  icon: Icon,
  tone,
  title,
  value,
  helperText,
  href,
}: {
  icon: LucideIcon;
  tone: KpiTone;
  title: string;
  value: string;
  helperText?: string;
  href?: string;
}) {
  const card = (
    <Card className={cn(href && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md")}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", TONE_BADGE_CLASS[tone])}>
            <Icon className="size-5.5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        <p className={cn("mt-3 text-2xl font-bold tracking-tight", TONE_TEXT_CLASS[tone])}>{value}</p>
        {helperText && (
          <p className={cn("mt-1 text-xs", href ? "font-medium text-primary" : "text-muted-foreground")}>
            {helperText}
          </p>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function EmptyStateWithRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("companyDashboard");
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
}

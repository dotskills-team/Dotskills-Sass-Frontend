"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Banknote,
  Box,
  CalendarClock,
  CreditCard,
  Package,
  Percent,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyPermissionGate } from "@/components/shared/permission-gate";
import { PermissionDenied } from "@/components/shared/permission-denied";
import { COMPANY_PERMISSIONS } from "@/constants/permissions";

import { useCurrentCompany } from "@/features/company/hooks/use-current-company";
import { SetupStatusCard } from "@/features/setup-status/components/setup-status-card";
import { useGetDashboardOverviewQuery } from "@/features/dashboard/api/dashboard.api";
import type { KpiTone } from "@/features/dashboard/components/kpi-card";
import { SalesPerformanceChart } from "@/features/dashboard/components/sales-performance-chart";
import { DateRangeFilter, ALL_LOCATIONS } from "@/features/reporting/components/date-range-filter";
import { DATE_PRESETS, resolvePresetRange, type DatePreset } from "@/features/dashboard/lib/date-presets";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { normalizeApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

/* Shared look: white panel, hairline border, soft shadow (analytics-console style) */
const PANEL = "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-card";
const PANEL_TITLE = "font-heading text-[15px] font-semibold tracking-tight text-foreground";

export function DashboardOverview() {
  return (
    <div>
      {/* Always rendered, regardless of REPORT_READ — this is exactly the
          one thing an Owner whose RBAC/subscription isn't ready yet still
          needs to see (see Day 4-7 Setup Status work); never gate it behind
          the same permission the overview below requires. */}
      <div className="px-4 pb-0 sm:px-6 sm:pb-0 xl:p-6 xl:pb-0">
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

  /* Inventory donut: three slices derived from the same inventoryHealth numbers */
  const inv = data.inventoryHealth;
  const healthyCount = Math.max(inv.totalProducts - inv.lowStock - inv.outOfStock, 0);
  const inventorySlices = [
    { key: "inStock", label: t("inventoryHealth.inStock"), value: healthyCount, color: "#2563eb" },
    { key: "lowStock", label: t("inventoryHealth.lowStock"), value: inv.lowStock, color: "#f59e0b" },
    { key: "outOfStock", label: t("inventoryHealth.outOfStock"), value: inv.outOfStock, color: "#ef4444" },
  ];

  const maxRevenue = Math.max(...data.topProducts.map((p) => Number(p.revenue)), 1);

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 xl:p-6">
      {/* Header */}
      <div className="flex justify-end">
        <div className="flex w-full flex-wrap items-end justify-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:w-fit dark:border-white/10 dark:bg-card">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {t("datePreset.label")}
            </span>
            <Select value={preset} onValueChange={(value) => handlePresetChange(value as DatePreset)}>
              <SelectTrigger className="h-9 w-40 rounded-lg border-slate-200 bg-white shadow-xs focus-visible:border-blue-600 focus-visible:ring-blue-600/20 dark:border-input dark:bg-background">
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
            className="h-9 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* KPI row — 1 col mobile, 2 tablet, 3 laptop, 6 on very wide screens */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4 2xl:grid-cols-6">
        <StatCard icon={Wallet} tone="primary" label={t("kpi.sales")} value={money(data.kpis.sales)} />
        <StatCard icon={ShoppingCart} tone="info" label={t("kpi.orders")} value={String(data.kpis.orders)} />
        <StatCard icon={TrendingUp} tone="success" label={t("kpi.grossProfit")} value={money(data.kpis.grossProfit)} />
        <StatCard
          icon={Percent}
          tone="success"
          label={t("kpi.grossMargin")}
          value={data.kpis.grossMarginPercent === null ? "—" : `${data.kpis.grossMarginPercent}%`}
        />
        <StatCard
          icon={CreditCard}
          tone="warning"
          label={t("kpi.receivable")}
          value={money(data.kpis.receivable.total)}
          helperText={
            data.kpis.receivable.customerCount > 0
              ? t("kpi.dueCustomers", { count: data.kpis.receivable.customerCount })
              : undefined
          }
          onClick={() => (window.location.href = "/company/reports/due-payable")}
        />
        <StatCard
          icon={TrendingDown}
          tone="destructive"
          label={t("kpi.payable")}
          value={money(data.kpis.payable.total)}
          helperText={
            data.kpis.payable.supplierCount > 0
              ? t("kpi.dueSuppliers", { count: data.kpis.payable.supplierCount })
              : undefined
          }
          onClick={() => (window.location.href = "/company/reports/due-payable")}
        />
      </section>

      {/* Sales chart + Top products + Inventory donut */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12 xl:gap-5">
        <div className={cn(PANEL, "min-w-0 xl:col-span-4")}>
          <h2 className={PANEL_TITLE}>{t("salesPerformance.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("salesPerformance.description")}</p>
          <div className="mt-3">
            {data.salesPerformance.length === 0 ? (
              <EmptyFrame>
                <EmptyState title={t("salesPerformance.empty")} icon={TrendingUp} />
              </EmptyFrame>
            ) : (
              <SalesPerformanceChart data={data.salesPerformance} currencyCode={currencyCode} />
            )}
          </div>
        </div>

        <div className={cn(PANEL, "min-w-0 xl:col-span-4")}>
          <h2 className={PANEL_TITLE}>{t("topProducts.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("topProducts.description")}</p>
          <div className="mt-4">
            {data.topProducts.length === 0 ? (
              <EmptyFrame>
                <EmptyState title={t("topProducts.empty")} icon={Package} />
              </EmptyFrame>
            ) : (
              <ul className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <li key={product.productId}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-50 text-[11px] font-bold tabular-nums text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                          {index + 1}
                        </span>
                        <span className="truncate font-medium">{product.name}</span>
                      </span>
                      <span className="shrink-0 font-bold tabular-nums">{money(product.revenue)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.max((Number(product.revenue) / maxRevenue) * 100, 3)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("topProducts.unitsSold", { count: product.quantitySold })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cn(PANEL, "min-w-0 lg:col-span-2 xl:col-span-4")}>
          <h2 className={PANEL_TITLE}>{t("inventoryHealth.title")}</h2>
          {inv.totalProducts === 0 ? (
            <div className="mt-4">
              <EmptyFrame>
                <EmptyState title={t("inventoryHealth.products")} icon={Package} />
              </EmptyFrame>
            </div>
          ) : (
            <div className="mx-auto mt-4 grid w-full max-w-md items-center gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <div className="relative mx-auto size-40 shrink-0 sm:size-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventorySlices.filter((s) => s.value > 0)}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="68%"
                      outerRadius="100%"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {inventorySlices
                        .filter((s) => s.value > 0)
                        .map((s) => (
                          <Cell key={s.key} fill={s.color} />
                        ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold tabular-nums">{inv.totalProducts}</span>
                  <span className="text-[11px] text-muted-foreground">{t("inventoryHealth.products")}</span>
                </div>
              </div>
              <ul className="min-w-0 space-y-2 text-sm">
                {inventorySlices.map((s) => (
                  <li
                    key={s.key}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                      <span className="truncate">{s.label}</span>
                    </span>
                    {s.key === "inStock" ? (
                      <span className="shrink-0 font-semibold tabular-nums">{s.value}</span>
                    ) : (
                      <Link
                        href="/company/reports/stock"
                        className="shrink-0 font-semibold tabular-nums underline-offset-2 hover:underline"
                      >
                        {s.value}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-muted-foreground dark:border-white/10">
            <span>{t("inventoryHealth.value")}</span>
            <span className="min-w-0 break-words text-sm font-bold tabular-nums text-foreground">
              {money(inv.inventoryValue)}
            </span>
          </div>
        </div>
      </section>

      {/* Purchases / receivable / payable / cash */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <StatCard
          icon={Package}
          tone="info"
          label={t("purchaseOverview.title")}
          value={money(data.purchaseOverview.totalPurchases)}
          helperText={t("purchaseOverview.orderCount", { count: data.purchaseOverview.purchaseOrderCount })}
        />
        <StatCard
          icon={CreditCard}
          tone="warning"
          label={t("receivable.title")}
          value={money(data.kpis.receivable.total)}
          helperText={t("receivable.viewAll")}
          href="/company/reports/due-payable"
        />
        <StatCard
          icon={TrendingDown}
          tone="destructive"
          label={t("payable.title")}
          value={money(data.kpis.payable.total)}
          helperText={t("payable.viewAll")}
          href="/company/reports/due-payable"
        />
        <StatCard
          icon={Banknote}
          tone="success"
          label={t("cashPosition.title")}
          value={
            data.cashPosition.openSessionCount === 0 ? t("cashPosition.empty") : money(data.cashPosition.totalOpeningFloat)
          }
          helperText={
            data.cashPosition.openSessionCount === 0
              ? undefined
              : t("cashPosition.openSessions", { count: data.cashPosition.openSessionCount })
          }
        />
      </section>

      {data.branchPerformance && data.branchPerformance.length > 0 && (
        <section className={PANEL}>
          <h2 className={PANEL_TITLE}>{t("branchPerformance.title")}</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-100 dark:border-white/10">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">{t("branchPerformance.branch")}</th>
                  <th className="px-3 py-2.5 text-right">{t("branchPerformance.sales")}</th>
                  <th className="px-3 py-2.5 text-right">{t("branchPerformance.orders")}</th>
                  <th className="px-3 py-2.5 text-right">{t("branchPerformance.profit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {data.branchPerformance.map((branch) => (
                  <tr key={branch.locationId} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-3 py-3 font-semibold">{branch.name}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{money(branch.sales)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{branch.orders}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-success">
                      {money(branch.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent transactions + Action required */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
        <div className={cn(PANEL, "xl:col-span-7")}>
          <h2 className={PANEL_TITLE}>{t("recentTransactions.title")}</h2>
          <div className="mt-3">
            {data.recentTransactions.length === 0 ? (
              <EmptyFrame>
                <EmptyState title={t("recentTransactions.empty")} icon={Box} />
              </EmptyFrame>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {data.recentTransactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        transaction.type === "SALE" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600",
                      )}
                    >
                      {transaction.type === "SALE" ? (
                        <ShoppingCart className="size-5" aria-hidden="true" />
                      ) : (
                        <Banknote className="size-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{transaction.reference}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {transaction.party ?? "—"} · {formatDate(transaction.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline-block",
                        transaction.type === "SALE" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {transaction.type.replaceAll("_", " ")}
                    </span>
                    <span className="w-28 shrink-0 text-right text-sm font-bold tabular-nums">
                      {money(transaction.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cn(PANEL, "xl:col-span-5")}>
          <h2 className={PANEL_TITLE}>{t("actionRequired.title")}</h2>
          <div className="mt-3">
            {data.actionRequired.length === 0 ? (
              <EmptyFrame>
                <EmptyState title={t("actionRequired.empty")} icon={AlertTriangle} />
              </EmptyFrame>
            ) : (
              <ul className="space-y-2.5">
                {data.actionRequired.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{alert.type.replaceAll("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const TONE_TILE: Record<KpiTone, string> = {
  primary: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  destructive: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  info: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
};

/* Dashed frame so empty states look intentional */
function EmptyFrame({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 dark:border-white/15 dark:bg-white/5">{children}</div>;
}

/**
 * KPI / summary card in the console style: small caps label, large figure,
 * tinted icon tile + helper line. Clickable via `onClick` (button semantics,
 * as before) or `href` (a real link).
 */
// function StatCard({
//   icon: Icon,
//   tone,
//   label,
//   value,
//   helperText,
//   onClick,
//   href,
// }: {
//   icon: LucideIcon;
//   tone: KpiTone;
//   label: string;
//   value: string;
//   helperText?: string;
//   onClick?: () => void;
//   href?: string;
// }) {
//   const interactive = Boolean(onClick || href);
//   const body = (
//     <div
//       className={cn(
//         PANEL,
//         "h-full",
//         interactive &&
//         "cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
//       )}
//       onClick={onClick}
//       role={onClick ? "button" : undefined}
//       tabIndex={onClick ? 0 : undefined}
//     >
//       <div className="flex items-start justify-between gap-3">
//         <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
//         <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_TILE[tone])}>
//           <Icon className="size-4" aria-hidden="true" />
//         </span>
//       </div>
//       <p className="mt-2 break-words text-2xl font-bold leading-tight tracking-tight tabular-nums text-foreground xl:text-[26px]">
//         {value}
//       </p>
//       {helperText && (
//         <p className={cn("mt-2 text-xs", href ? "font-medium text-blue-600" : "text-muted-foreground")}>{helperText}</p>
//       )}
//     </div>
//   );
//   return href ? (
//     <Link href={href} className="block rounded-xl">
//       {body}
//     </Link>
//   ) : (
//     body
//   );
// }
/* Icon color per tone (tile itself stays neutral) */
const TONE_ICON_TEXT: Record<KpiTone, string> = {
  primary: "text-blue-600 dark:text-blue-300",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  destructive: "text-red-600 dark:text-red-300",
  info: "text-sky-600 dark:text-sky-300",
};

/* Soft glow under the tile */
const TONE_GLOW: Record<KpiTone, string> = {
  primary: "bg-blue-500/40",
  success: "bg-emerald-500/40",
  warning: "bg-amber-500/40",
  destructive: "bg-red-500/40",
  info: "bg-sky-500/40",
};

/* Icon tile background (tone-wise soft gradient) */
const TONE_ICON_BG: Record<KpiTone, string> = {
  primary:
    "bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200/80 dark:from-blue-400/20 dark:to-blue-500/10 dark:border-blue-300/20",
  success:
    "bg-gradient-to-b from-emerald-50 to-emerald-100 border-emerald-200/80 dark:from-emerald-400/20 dark:to-emerald-500/10 dark:border-emerald-300/20",
  warning:
    "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-200/80 dark:from-amber-400/20 dark:to-amber-500/10 dark:border-amber-300/20",
  destructive:
    "bg-gradient-to-b from-red-50 to-red-100 border-red-200/80 dark:from-red-400/20 dark:to-red-500/10 dark:border-red-300/20",
  info:
    "bg-gradient-to-b from-sky-50 to-sky-100 border-sky-200/80 dark:from-sky-400/20 dark:to-sky-500/10 dark:border-sky-300/20",
};

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  helperText,
  onClick,
  href,
}: {
  icon: LucideIcon;
  tone: KpiTone;
  label: string;
  value: string;
  helperText?: string;
  onClick?: () => void;
  href?: string;
}) {
  const interactive = Boolean(onClick || href);
  const body = (
    <div
      className={cn(
        PANEL,
        "group h-full",
        interactive &&
          "cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        {/* Raised glass tile + colored glow */}
        <span className="relative size-10 shrink-0">
          {/* glow */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-1.5 -bottom-1 h-3 rounded-full opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none",
              TONE_GLOW[tone],
            )}
          />
          {/* tile with bg */}
          <span
            className={cn(
              "relative flex size-10 items-center justify-center rounded-xl border",
              "shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_2px_rgb(15_23_42/0.08)]",
              "transition-transform duration-200 group-hover:-translate-y-px motion-reduce:transition-none",
              "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
              TONE_ICON_BG[tone],
              TONE_ICON_TEXT[tone],
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
        </span>
      </div>

      <p className="mt-3 break-words text-2xl font-bold leading-tight tracking-tight tabular-nums text-foreground xl:text-[26px]">
        {value}
      </p>
      {helperText && (
        <p
          className={cn(
            "mt-2 text-xs",
            href ? "font-medium text-blue-600" : "text-muted-foreground",
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block rounded-xl">
      {body}
    </Link>
  ) : (
    body
  );
}
function EmptyStateWithRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("companyDashboard");
  return (
    <div className={PANEL}>
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 xl:p-6">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-72 w-full rounded-xl xl:col-span-4" />
        <Skeleton className="h-72 w-full rounded-xl xl:col-span-4" />
        <Skeleton className="h-72 w-full rounded-xl xl:col-span-4" />
      </div>
    </div>
  );
}

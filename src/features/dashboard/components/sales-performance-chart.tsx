"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { DashboardSalesPoint } from "@/types/dashboard";

/* Compact axis numbers (1.2K, 3.4M) — display only */
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function formatAxisTick(value: string): string {
  return format(parseISO(value), "d MMM");
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
  currencyCode,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  label?: string;
  currencyCode: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  const sales = Number(payload.find((item) => item.dataKey === "sales")?.value ?? 0);
  const grossProfit = Number(payload.find((item) => item.dataKey === "grossProfit")?.value ?? 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-white/10 dark:bg-popover">
      <p className="mb-1.5 font-semibold text-foreground">{formatDate(label)}</p>
      <p className="flex items-center gap-2 text-muted-foreground">
        <span className="size-2 rounded-full bg-blue-600" aria-hidden="true" />
        <span>
          Sales: <span className="font-semibold tabular-nums text-foreground">{formatCurrency(sales, currencyCode)}</span>
        </span>
      </p>
      <p className="mt-1 flex items-center gap-2 text-muted-foreground">
        <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
        <span>
          Profit:{" "}
          <span className="font-semibold tabular-nums text-foreground">{formatCurrency(grossProfit, currencyCode)}</span>
        </span>
      </p>
    </div>
  );
}

/**
 * Every value here comes straight from `ProfitReportService.getProfitReport()`'s
 * day-bucketed rows (reused unchanged by the dashboard's backend service) —
 * nothing is computed or estimated on the frontend.
 */
export function SalesPerformanceChart({
  data,
  currencyCode,
}: {
  data: DashboardSalesPoint[];
  currencyCode: string;
}) {
  const chartData = data.map((point) => ({
    date: point.date,
    sales: Number(point.sales),
    grossProfit: Number(point.grossProfit),
  }));

  return (
    <div className="h-60 w-full sm:h-64 xl:h-60">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisTick}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => compact.format(v)}
          />
          <Tooltip
            cursor={{ fill: "#2563eb", fillOpacity: 0.06 }}
            // recharts' own TooltipContentProps is structurally incompatible with a narrower
            // custom type at the function-parameter level; narrowing/validation happens safely
            // at runtime inside ChartTooltip itself.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload as TooltipPayloadItem[] | undefined}
                label={props.label === undefined ? undefined : String(props.label)}
                currencyCode={currencyCode}
              />
            )}
          />
          <Bar dataKey="sales" fill="#2554d6" radius={[3, 3, 0, 0]} maxBarSize={28} />
          <Line type="monotone" dataKey="grossProfit" stroke="#10b981" strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

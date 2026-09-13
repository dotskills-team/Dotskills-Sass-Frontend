"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { DashboardSalesPoint } from "@/types/dashboard";

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
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{formatDate(label)}</p>
      <p className="text-muted-foreground">
        Sales: <span className="font-medium text-foreground">{formatCurrency(sales, currencyCode)}</span>
      </p>
      <p className="text-muted-foreground">
        Profit: <span className="font-medium text-foreground">{formatCurrency(grossProfit, currencyCode)}</span>
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
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisTick}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
        <Tooltip
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
        <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Line type="monotone" dataKey="grossProfit" stroke="var(--color-success)" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

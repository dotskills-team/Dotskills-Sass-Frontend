"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { PlatformDashboardRevenuePoint } from "@/types/platform-dashboard";

function formatAxisTick(value: string): string {
  return format(parseISO(value), "d MMM");
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: string | number;
}

function RevenueTooltip({
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

  const revenue = Number(payload.find((item) => item.dataKey === "revenue")?.value ?? 0);

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{formatDate(label)}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-medium text-foreground">{formatCurrency(revenue, currencyCode)}</span>
      </p>
    </div>
  );
}

/**
 * Every point comes straight from `PlatformDashboardService.getRevenueSeries()`'s
 * day-bucketed successful-payment sums — days with no successful payment simply
 * don't appear (no fabricated zero-fill), so an empty/short series renders as a
 * sparse or empty chart rather than a misleading flat line.
 */
export function RevenueAnalyticsChart({
  data,
  currencyCode,
}: {
  data: PlatformDashboardRevenuePoint[];
  currencyCode: string;
}) {
  const chartData = data.map((point) => ({
    date: point.date,
    revenue: Number(point.revenue),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="platformRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisTick}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={(props: any) => (
            <RevenueTooltip
              active={props.active}
              payload={props.payload as TooltipPayloadItem[] | undefined}
              label={props.label === undefined ? undefined : String(props.label)}
              currencyCode={currencyCode}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#platformRevenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

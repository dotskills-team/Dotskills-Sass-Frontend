"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/formatters/currency";
import type { PlatformDashboardIndustryPerformance } from "@/types/platform-dashboard";

interface TooltipPayloadItem {
  payload?: { industryName: string; companyCount: number; mrr: number };
}

function IndustryTooltip({
  active,
  payload,
  currencyCode,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  currencyCode: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="font-medium text-foreground">{item.industryName}</p>
      <p className="text-muted-foreground">
        {item.companyCount} companies · {formatCurrency(item.mrr, currencyCode)} MRR
      </p>
    </div>
  );
}

/** Real per-industry counts + MRR from `PlatformDashboardService.getIndustryPerformance()` — industry names come from the `Industry` table, never hardcoded. */
export function IndustryPerformanceChart({
  data,
  currencyCode,
}: {
  data: PlatformDashboardIndustryPerformance[];
  currencyCode: string;
}) {
  const chartData = data.map((industry) => ({
    industryName: industry.industryName,
    companyCount: industry.companyCount,
    mrr: Number(industry.mrr),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 40)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          dataKey="industryName"
          type="category"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={(props: any) => (
            <IndustryTooltip
              active={props.active}
              payload={props.payload as TooltipPayloadItem[] | undefined}
              currencyCode={currencyCode}
            />
          )}
        />
        <Bar dataKey="companyCount" fill="var(--color-info)" radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

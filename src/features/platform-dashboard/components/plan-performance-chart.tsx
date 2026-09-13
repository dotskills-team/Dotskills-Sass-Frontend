"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters/currency";
import type { PlatformDashboardPlanPerformance } from "@/types/platform-dashboard";

type Metric = "companies" | "mrr";

interface TooltipPayloadItem {
  value?: string | number;
  payload?: { planName: string; companies: number; mrr: number };
}

/** Real per-plan metrics from `PlatformDashboardService.getPlanPerformance()` — a metric selector avoids two charts fighting for space when only one is being read at a time. */
export function PlanPerformanceChart({
  data,
  currencyCode,
}: {
  data: PlatformDashboardPlanPerformance[];
  currencyCode: string;
}) {
  const [metric, setMetric] = useState<Metric>("mrr");

  const chartData = data.map((plan) => ({
    planName: plan.planName,
    companies: plan.activeSubscriptions,
    mrr: Number(plan.mrr),
  }));

  function DonutTooltip({ active, payload }: { active?: boolean; payload?: readonly TooltipPayloadItem[] }) {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0]?.payload;
    if (!item) return null;
    return (
      <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
        <p className="font-medium text-foreground">{item.planName}</p>
        <p className="text-muted-foreground">
          {metric === "mrr" ? formatCurrency(item.mrr, currencyCode) : `${item.companies} companies`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Select value={metric} onValueChange={(value) => setMetric(value as Metric)}>
          <SelectTrigger className="w-32" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mrr">MRR</SelectItem>
            <SelectItem value="companies">Companies</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 42)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (metric === "mrr" ? formatCurrency(value, currencyCode) : String(value))}
          />
          <YAxis dataKey="planName" type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={100} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => (
              <DonutTooltip active={props.active} payload={props.payload as TooltipPayloadItem[] | undefined} />
            )}
          />
          <Bar dataKey={metric} fill="var(--color-primary)" radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

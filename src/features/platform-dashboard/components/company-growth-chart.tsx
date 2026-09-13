"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

import { formatDate } from "@/lib/formatters/date";
import type { PlatformDashboardCompanyGrowthPoint } from "@/types/platform-dashboard";

function formatAxisTick(value: string): string {
  return format(parseISO(value), "d MMM");
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: string | number;
}

function GrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  const newCompanies = Number(payload.find((item) => item.dataKey === "newCompanies")?.value ?? 0);

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{formatDate(label)}</p>
      <p className="text-muted-foreground">
        New companies: <span className="font-medium text-foreground">{newCompanies}</span>
      </p>
    </div>
  );
}

/** Every bar comes directly from `PlatformDashboardService.getCompanyGrowthSeries()`'s day-bucketed `Company.createdAt` counts. */
export function CompanyGrowthChart({ data }: { data: PlatformDashboardCompanyGrowthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisTick}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={(props: any) => (
            <GrowthTooltip
              active={props.active}
              payload={props.payload as TooltipPayloadItem[] | undefined}
              label={props.label === undefined ? undefined : String(props.label)}
            />
          )}
        />
        <Bar dataKey="newCompanies" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

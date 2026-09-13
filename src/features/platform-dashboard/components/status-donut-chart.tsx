"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getStatusTone, TONE_CLASS, type Tone } from "@/components/shared/status-badge";

/** Semantic tone → chart fill, sharing the exact tone assignment `StatusBadge` uses elsewhere so a status is always the same color everywhere in the app. */
const TONE_FILL: Record<Tone, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  destructive: "var(--color-destructive)",
  info: "var(--color-info)",
  muted: "var(--color-muted-foreground)",
  primary: "var(--color-primary)",
};

export interface StatusDonutSlice {
  status: string;
  count: number;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: { status: string; count: number; percentage: number };
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: readonly TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="font-medium text-foreground">{item.status}</p>
      <p className="text-muted-foreground">
        {item.count} ({item.percentage}%)
      </p>
    </div>
  );
}

/** A small, reusable status-distribution donut — used for Subscription/Payment/Invoice health, each fed real grouped counts from the backend. */
export function StatusDonutChart({ slices }: { slices: StatusDonutSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const data = slices.map((slice) => ({
    ...slice,
    percentage: total > 0 ? Math.round((slice.count / total) * 1000) / 10 : 0,
  }));

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={36} outerRadius={56} paddingAngle={2}>
            {data.map((slice) => (
              <Cell key={slice.status} fill={TONE_FILL[getStatusTone(slice.status)]} />
            ))}
          </Pie>
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => (
              <DonutTooltip active={props.active} payload={props.payload as TooltipPayloadItem[] | undefined} />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-1.5">
        {data.map((slice) => (
          <li key={slice.status} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 truncate">
              <span
                className={`inline-block size-2 shrink-0 rounded-full ${TONE_CLASS[getStatusTone(slice.status)].split(" ")[0]}`}
              />
              <span className="truncate text-muted-foreground">{slice.status}</span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {slice.count} · {slice.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

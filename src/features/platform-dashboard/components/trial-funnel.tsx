"use client";

import type { PlatformDashboardTrialOverview } from "@/types/platform-dashboard";

/**
 * Recharts has no dedicated funnel chart in this project's already-installed
 * version, and a staged-bar visualization reads more clearly for only 3 stages
 * anyway — so this renders as a simple width-proportional staged bar rather
 * than pulling in a second charting approach for one section.
 *
 * Conversion rate is exactly `converted / (converted + expired) * 100`,
 * rounded to 1 decimal, computed backend-side in `getTrialOverview()` — never
 * recalculated here — and is `null` (rendered as "—") when there is no
 * converted/expired data yet, never fabricated as 0%.
 */
export function TrialFunnel({ data }: { data: PlatformDashboardTrialOverview }) {
  const stages = [
    { label: "Started (period)", value: data.started, tone: "bg-info" },
    { label: "Converted (period)", value: data.converted, tone: "bg-success" },
    { label: "Expired (period)", value: data.expired, tone: "bg-destructive" },
  ];
  const max = Math.max(1, ...stages.map((stage) => stage.value));

  return (
    <div className="space-y-3">
      {stages.map((stage) => (
        <div key={stage.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{stage.label}</span>
            <span className="font-medium text-foreground">{stage.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${stage.tone}`}
              style={{ width: `${Math.round((stage.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
        <span className="text-muted-foreground">Trial → Paid conversion</span>
        <span className="font-semibold text-foreground">
          {data.conversionRate === null ? "—" : `${data.conversionRate}%`}
        </span>
      </div>
    </div>
  );
}

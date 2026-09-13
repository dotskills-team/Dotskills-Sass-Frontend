import type { PlatformDashboardExpiryBuckets } from "@/types/platform-dashboard";

/** Real current-snapshot counts from `PlatformDashboardService.getExpiryBuckets()` — semantic emphasis only (no extra colors beyond the existing success/warning/destructive tones). */
export function ExpiryBuckets({ data }: { data: PlatformDashboardExpiryBuckets }) {
  const items = [
    { label: "Within 7 days", value: data.within7, className: "border-destructive/30 bg-destructive/10 text-destructive" },
    { label: "Within 30 days", value: data.within30, className: "border-warning/30 bg-warning/10 text-warning" },
    { label: "Within 60 days", value: data.within60, className: "border-info/30 bg-info/10 text-info" },
    { label: "Already expired", value: data.expired, className: "border-border bg-muted text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={`rounded-lg border p-3 ${item.className}`}>
          <p className="text-xl font-bold">{item.value}</p>
          <p className="mt-1 text-xs opacity-90">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiTone = "primary" | "success" | "warning" | "destructive" | "info";

/** Icon-badge background/foreground per tone — reuses the app's existing semantic color tokens, never a new palette. */
const TONE_BADGE_CLASS: Record<KpiTone, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/15 text-info",
};

/** Value-text color per tone — same token set as the badge, so the number reads as one color story with its icon. */
const TONE_TEXT_CLASS: Record<KpiTone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  helperText,
  onClick,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helperText?: string;
  onClick?: () => void;
  /** Optional semantic tint for the icon badge — omit to keep the original plain/neutral look. */
  tone?: KpiTone;
}) {
  return (
    <Card
      className={cn(onClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              tone ? TONE_BADGE_CLASS[tone] : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight",
              tone ? TONE_TEXT_CLASS[tone] : "text-foreground",
            )}
          >
            {value}
          </p>
        </div>
        {helperText && <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>}
      </CardContent>
    </Card>
  );
}

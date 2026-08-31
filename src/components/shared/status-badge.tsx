import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "destructive" | "info" | "muted" | "primary";

/**
 * Backend lifecycle enum-এর প্রতিটা status-কে একটা semantic tone-এ map
 * করে — একই meaning-এর জন্য সব page-এ একই রং (section-এর "consistent
 * color usage" নিয়ম)। নতুন status backend-এ যোগ হলে এখানেই যোগ করতে হবে।
 */
const STATUS_TONE: Record<string, Tone> = {
  // Company
  LIVE: "success",
  READY: "info",
  ONBOARDING: "info",
  DRAFT: "muted",
  TRIAL: "info",
  SUSPENDED: "warning",
  CLOSED: "destructive",
  // Industry / Plan
  ACTIVE: "success",
  INACTIVE: "muted",
  ARCHIVED: "muted",
  // Company Owner membership
  INVITED: "info",
  REVOKED: "destructive",
  // Subscription
  TRIALING: "info",
  PAST_DUE: "warning",
  GRACE: "warning",
  CANCELLED: "destructive",
  EXPIRED: "destructive",
  // Billing / Payment
  PENDING: "muted",
  PROCESSING: "info",
  SUCCEEDED: "success",
  FAILED: "destructive",
  SKIPPED: "muted",
  // Invoice
  ISSUED: "info",
  PAID: "success",
  VOID: "destructive",
  // Purchase Order / Stock Transfer
  PARTIALLY_RECEIVED: "warning",
  FULLY_RECEIVED: "success",
  IN_TRANSIT: "info",
  RECEIVED: "success",
  // Sale
  COMPLETED: "success",
  VOIDED: "destructive",
};

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/30",
};

export function getStatusTone(status: string): Tone {
  return STATUS_TONE[status] ?? "muted";
}

export function StatusBadge({ status }: { status: string }) {
  const tone = getStatusTone(status);

  return (
    <Badge variant="outline" className={cn("font-medium", TONE_CLASS[tone])}>
      {status}
    </Badge>
  );
}
